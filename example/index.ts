import { SqliteComlinkMod } from "./db.worker";
import { Database } from "sql.js";
import * as Comlink from "comlink";
import {Database, query} from "./index";

// const sqlJsURL = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);
const sqlJsURL = new URL("sql.js/sql-wasm.wasm", import.meta.url);

// note: there's no good story around webpack/typescript/webworkers
// so directly target the compiled file
// TODO: fix this when possible.
// const dbWorkerURL = new URL("db.worker", import.meta.url); 
const dbWorkerURL = "db.worker.js";

// const ipfsWorkerURL = new URL("ipfs.worker", import.meta.url);
const ipfsWorkerURL = "ipfs.worker.js"; 

async function load() {
  // example.sqlite3
  // let path = "QmQRt5BRHAeBaspyEf4KG4cY9GdSmpisRfdJTi7SvPhBeY";
  // sample.sqlite3 @ 4kb page size
  // let path = "QmbcqJRH1rvFZtR1NBp5xqHTKz9brvdCRRMtiw6TVetwxa";
  // sample.sqlite3 @ 64kb page size
  let ipfsPath = "QmZwoJuBtrvSNh6n5XmKoBCVf9Ny7mEGpuWh17JbnQedrw";

  const dbManagerWorker: Worker = new Worker(dbWorkerURL);
  const dbManager = Comlink.wrap<SqliteComlinkMod>(dbManagerWorker);

  await dbManager.dummy();

  console.log("begin db worker spawn");
  const { db } = await dbManager.createDbWorker(
    sqlJsURL.toString(),
    ipfsWorkerURL,
    ipfsPath,
  );
  console.log("db worker created", db);

  const queryString1 = `select * from sqlite_master;`
  console.log(exec(db, queryString1));

  // exec(db, `select * from data where "Country Name" LIKE "%Africa%"`);
  
  // exec(db, `select count(id) from data`);
}

load();