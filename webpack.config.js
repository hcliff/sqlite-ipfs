const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

const example = {
  target: 'web',
  watch: false,
  devServer: {
    magicHtml: false,
    watchFiles: [],

    static: ["example/assets"],
    https: true,
    // interferes with targeting webworkers
    hot: false,
    liveReload: false,
    // headers required for SharedArrayBuffer to be available
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    devMiddleware: {
      // webpack attempts to serve compiled ts files as a video (???)
      // overide that behaviour
      mimeTypes: { 'ts': 'application/javascript' },
    }
  },

  devtool: 'inline-source-map',
  entry: {
    index: "./example/index.ts"
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: [/\.wasm$/],
        type: 'asset/resource',
      },
      {
        test: [/\.sqlite3$/],
        loader: 'raw-loader',
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      crypto: false,
      path: false,
    },
  }
}

const web = {
  target: 'web',
  devtool: 'inline-source-map',
  entry: {
    index: "./src/index.ts"
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      crypto: false,
      path: false,
    },
  },
  output: {
    filename: "[name].js",
  },
};

const workers = {
  watch: false,
  target: 'webworker',
  devtool: 'inline-source-map',
  entry: {
    "db.worker": "./src/db.worker.ts",
    "ipfs.worker": "./src/ipfs.worker.ts"
  },
  plugins: [
    new NodePolyfillPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      crypto: false,
      path: false,
    },
  },
  output: {
    filename: "[name].js",
  },
};

module.exports = [example, web, workers];