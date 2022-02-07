
// export * from "./db";
// export type { SqliteStats } from "./sqlite.worker";
// export type { PageReadLog } from "./lazyFile";
export type { Database, BindParams } from "sql.js";
// export {createDbWorker} from "db.worker";
import { Database, QueryExecResult } from "sql.js";

const sqlJsURL = new URL("sql.js/sql-wasm.wasm", import.meta.url);
console.log(sqlJsURL);

export function toObjects<T>(res: QueryExecResult[]): T[] {
  return res.flatMap(r => r.values.map((v) => {
    const o: any = {};
    for (let i = 0; i < r.columns.length; i++) {
      o[r.columns[i]] = v[i];
    }
    return o as T;
  }));
}

export async function query(db: Database, query: string, params?: BindParams): Promise<any[]> {
  console.time(query);
  const result = await db.exec(query, params);
  console.timeEnd(query);
  return toObjects(result);
}