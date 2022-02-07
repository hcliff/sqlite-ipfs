declare module './sql.js/sql-wasm';

declare module "json!*" {
    const value: any;
    export default value;
}

declare module '*.sqlite3' {
    const content: any;
    export default content;
}
  