# sql.js-ipfs

## Inspiration
Heavily inspired and uses code from [https://github.com/phiresky/sql.js-httpvfs](sql.js-httpvfs)
Impossible without [sql.js](https://sql.js.org/#/)

## Usage
The demo allows you to interact with any sqllite file on IPFS.
1) [Install IPFS](https://flyingzumwalt.gitbooks.io/decentralized-web-primer/content/install-ipfs/lessons/download-and-install.html)
2) Add your sqlite file ```ipfs add db.sqlite3```
3) Take the CID from the output and use it in the demo

Alternatively check the index.ts file for sample code.

## FAQ
* **How does this work?** Your browser runs a wasm binary that contains the sqlite server & client. It reads blocks of data from a .sqlite file on ipfs and performs queries in your browser.
* **Performance?** Table scans are very bad. The cross-worker communcation of [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) introduces heavy performance penalties too.
* **Writes?** Certainly possible, but not implemented currently. 
* **What was the hardest part of the project?** Configuring webpack
* **Is this blockchain? 🚀🚀🚀** It's not, but it is technically a distributed ledger, be sure anyone you give money too can explain the difference.