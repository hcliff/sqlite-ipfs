import * as Comlink from "comlink";
import { StatResult, StatOptions } from 'ipfs-core-types/src/files';
import { create, IPFS } from "ipfs-core";
import { Mutex, unlock } from "./mutex";
import { createRepo } from "ipfs-repo";
import { LevelDatastore } from "datastore-level";
import { BlockstoreDatastoreAdapter } from "blockstore-datastore-adapter";
// @ts-ignore
import * as memstore from "level-mem";

let ipfsConnection: IPFS;

// https://github.com/ipfs-examples/js-ipfs-examples/blob/master/examples/custom-ipfs-repo/index.js
const codecs = [
  require('@ipld/dag-pb'),
  require('@ipld/dag-cbor'),
  require('multiformats/codecs/raw')
].reduce((acc, curr) => {
  acc[curr.name] = curr
  acc[curr.code] = curr

  return acc
}, {})

// Support dag-pb and dag-cbor at a minimum
const loadCodec = (nameOrCode: any) => {
  if (codecs[nameOrCode]) {
    return codecs[nameOrCode]
  }

  throw new Error(`Could not load codec for ${nameOrCode}`)
}

const boot = async function () {
  const repoPath = String(Math.random() + Date.now())

  const repo = createRepo(repoPath, loadCodec, {
    root: new LevelDatastore(repoPath, {
      prefix: '',
      version: 2,
      // note: the default repo uses LevelDatastore which is _incredibly_ slow
      // 30ms per read slow. Use an in-memory datastore instead.
      db: memstore
    }),
    blocks: new BlockstoreDatastoreAdapter(new LevelDatastore(`${repoPath}/blocks`, {
      prefix: '',
      version: 2,
      db: memstore
    })),
    datastore: new LevelDatastore(`${repoPath}/datastore`, {
      prefix: '',
      version: 2,
      db: memstore
    }),
    keys: new LevelDatastore(`${repoPath}/keys`, {
      prefix: '',
      version: 2,
      db: memstore
    }),
    pins: new LevelDatastore(`${repoPath}/pins`, {
      prefix: '',
      version: 2,
      db: memstore
    })
  });

  ipfsConnection = await create({
    repo: repo,
    init: { algorithm: 'Ed25519' },
  });
}

// reads the required bytes from ipfs into a buffer and unlocks the passed in mutex
const read = async function (
  ipfsPath: string,
  buffer: SharedArrayBuffer,
  offset: number,
  length: number,
  position: number,
  // the mutex to unlock upon the operation completing
  mu: Mutex,
  timeout: number,
) {
  // console.log("read ipfs", ipfsPath, offset, length, position);

  const uint8 = new Uint8Array(buffer);

  // const timeLabel = `ipfs reading ${length} bytes`
  // console.time(timeLabel);
  let i = 0;
  for await (const chunk of ipfsConnection.files.read("/ipfs/" + ipfsPath, {
    offset: position,
    length: length,
    timeout: timeout
  })) {
    uint8.set(chunk, offset + i);
    i += chunk.length;
  }
  // console.timeEnd(timeLabel);

  unlock(mu);
}

const mod = {
  read: read,
  boot: boot,
  dummy: function () {
    console.log("[asyncreader]", "comlink works", Math.random());
  },
  stat: async function (path: string, options?: StatOptions): Promise<StatResult> {
    // note, stat doesn't support `withLocal` currently
    // there's no way to understand how much local storage is used
    // https://github.com/ipfs/js-ipfs/issues/2806
    return ipfsConnection.files.stat("/ipfs/" + path, options)
  }
}
export type ReaderComlinkMod = typeof mod;
Comlink.expose(mod);