import { SqliteComlinkMod } from "../src/db.worker";
import * as Comlink from "comlink";
import {query} from "../src/index";

// @ts-ignore we're in a module, and have access to import.meta.url
const sqlJsURL = new URL("../src/sql.js/sql-wasm.wasm", import.meta.url).toString();

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
  // let ipfsPath = "QmZwoJuBtrvSNh6n5XmKoBCVf9Ny7mEGpuWh17JbnQedrw";
  // wdi.sqlite3 @ 64kb page size
  let ipfsPath = "Qme2jr3JG2CyZK2NJBzse7DjgZzktgbL1jxiJ73AxhuLNA";

  const dbManagerWorker: Worker = new Worker(dbWorkerURL);
  const dbManager = Comlink.wrap<SqliteComlinkMod>(dbManagerWorker);

  await dbManager.dummy();

  console.log("begin db worker spawn");
  const { db } = await dbManager.createDbWorker(
    sqlJsURL,
    ipfsWorkerURL,
    ipfsPath,
  );
  console.log("db worker created", db);

  const queryString1 = `select * from sqlite_master;`
  console.log(await query(db, queryString1));

  // exec(db, `select * from data where "Country Name" LIKE "%Africa%"`);
  
  // exec(db, `select count(id) from data`);
}

load();