
import { Database } from "sql.js";
import { ReaderComlinkMod } from "./ipfs.worker";
import { lock, waitForLock } from "./mutex";
import * as Comlink from "comlink";
// @ts-ignore
import initSqlJs from "./sql.js/sql-wasm";

// exported for testing
export async function createLazyFile(
    ipfsWorkerURL: string,
    fs: FileSystem,
    ipfsPath: string,
): Promise<FS.FSNode> {
    console.log("createLazyFile called");

    console.time("ipfsWorker instantiation");
    const ipfsWorker: Worker = new Worker(ipfsWorkerURL);
    const ipfs = Comlink.wrap<ReaderComlinkMod>(ipfsWorker);
    // ipfs.dummy();
    await ipfs.boot();
    console.timeEnd("ipfsWorker instantiation");

    // @ts-ignore createFile does actually exist
    var node: FS.FSNode = fs.createFile("/", ipfsPath, {}, true, true);

    // consider making this lazy to avoid the network request at insantiation time
    // this is often a very long process for files recently uploaded to ipfs
    console.log("beginning stat");
    const statResult = await ipfs.stat(ipfsPath, {
        // speed things up by only pulling the size
        size: true
    });
    console.log(`${ipfsPath} statresult`, statResult);

    Object.defineProperties(node, {
        usedBytes: {
            get: function () { return statResult.size }
        }
    });

    // https://emscripten.org/docs/api_reference/Filesystem-API.html#FS.read
    // @ts-ignore strem_ops is a property of node
    node.stream_ops.read = function (
        _: { node: { path: string } },
        buffer: Uint8Array,
        // The offset within buffer to store the data.
        offset: number,
        // The length of data to write in buffer.
        length: number,
        // The offset within the stream to read. By default this is the stream’s current offset.
        position: number
    ) {
        // console.time("stream_ops.read");

        // our worker thread will write into this shared buffer
        const workerBuffer = new SharedArrayBuffer(length);

        // create a buffer large enough to hold one 32 bit integer
        const mu = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
        lock(mu);

        const readTimeout = 10000;
        // note: this is behind comlink and does not happen syncronously
        // we cannot await on it as `stream_ops.read` is a emscripten callback
        // that does not support async/await
        //
        // offset here is set to 0 as we instantiate a new buffer and pass it in
        ipfs.read(ipfsPath, workerBuffer, 0, length, position, mu, readTimeout);

        // this lock cannot be aquired until the previous lock is released
        // by `read` completing in a worker thread
        // if the read takes longer than readTimeout it will have failed
        const wait = waitForLock(mu, readTimeout);
        if (wait !== "ok") {
            throw new Error(`read timed out after ${readTimeout/1000}s`)
        }

        const uint8 = new Uint8Array(workerBuffer);
        buffer.set(uint8, offset);

        // console.timeEnd("stream_ops.read");

        return length;
    };

    return node;
}

export async function createDbWorker(
    sqlJsURL: string,
    asyncReaderURL: string,
    path: string,
): Promise<{ db: Database }> {
    console.info('beginning initSqlJs');
    const SQL = await initSqlJs({
        locateFile: (file: string) => {
            // sql.js.org is the original sql.js which is missing some extenions
            // return `https://sql.js.org/dist/${file}`;

            // phiresky.github.io is the fork we need
            // return 'https://phiresky.github.io/blog/sql-wasm.wasm';

            return sqlJsURL;
        }
    });

    // SQL.FS only exists in the sql.js fork we use, and not the official typings
    // createLazyFile spawns a long lived worker
    const ipfsFile = await createLazyFile(asyncReaderURL, SQL.FS, path);
    console.info("lazy ipfs file", ipfsFile);

    // use the same filename as 
    const db: Database = new SQL.CustomDatabase(path);

    // verify page size and disable cache (since we hold everything in memory anyways)
    const pageSizeResp = await db.exec("pragma page_size; pragma cache_size=0");
    const pageSize = pageSizeResp[0].values[0][0];
    console.info(`page size ${pageSize}`);

    return Comlink.proxy({ db });
}


const mod = {
    createLazyFile: createLazyFile,
    createDbWorker: createDbWorker,
    dummy: function () {
        console.log("[dbworker]", "comlink works", Math.random());
    }
}
export type SqliteComlinkMod = typeof mod;
Comlink.expose(mod);