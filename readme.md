# sql.js-ipfs
## [Demo](https://k51qzi5uqu5diy09qbtg7b3ma8n0cj4l05st37rza1bdoyrm3hw0wvzypt8n0l.ipns.dweb.link/)

## Inspiration / Deps
Heavily inspired and uses code from [https://github.com/phiresky/sql.js-httpvfs](sql.js-httpvfs)
Impossible without [sql.js](https://sql.js.org/#/)

## Usage
### Basic
1) `npm install`
2) `npm run dev`
3) **Using https** open your browser and navigate to the url given by webpack
4) Check the console

### With your own database
1) [Install IPFS](https://flyingzumwalt.gitbooks.io/decentralized-web-primer/content/install-ipfs/lessons/download-and-install.html)
2) Add your sqlite file ```ipfs add db.sqlite3```
3) Take the CID from the output and change ipfsPath in examples/index.ts
4) `npm run dev`
5) `Check the console`

## FAQ
* **How does this work?** Your browser runs a wasm binary that contains the sqlite server & client. It reads blocks of data from a .sqlite file on ipfs and performs queries in your browser.
* **Performance?** Table scans are very bad. The cross-worker communcation of [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) introduces heavy performance penalties too.
* **Writes?** Certainly possible, but not implemented currently. 
* **What was the hardest part of the project?** Configuring webpack
* **Is this blockchain? 🚀🚀🚀** It's not, but it is technically a distributed ledger, be sure anyone you give money too can explain the difference.