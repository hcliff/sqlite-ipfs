export type { Database, BindParams } from "sql.js";
import { Database, BindParams, QueryExecResult } from "sql.js";

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