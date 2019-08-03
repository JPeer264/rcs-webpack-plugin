[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![npm version](https://badge.fury.io/js/rcs-webpack-plugin.svg)](https://www.npmjs.com/package/rcs-webpack-plugin)
[![Build Status](https://travis-ci.com/JPeer264/rcs-webpack-plugin.svg?branch=master)](https://travis-ci.com/JPeer264/rcs-webpack-plugin)
[![Coverage Status](https://coveralls.io/repos/github/JPeer264/rcs-webpack-plugin/badge.svg?branch=master)](https://coveralls.io/github/JPeer264/rcs-webpack-plugin?branch=master)

<div align="center">
  <!-- replace with accurate logo e.g from https://worldvectorlogo.com/ -->
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" vspace="" hspace="25"
      src="https://cdn.rawgit.com/webpack/media/e7485eb2/logo/icon.svg">
  </a>
  <h1>rcs webpack plugin</h1>
  <p>The webpack plugin for <a href="https://github.com/JPeer264/node-rcs-core">rcs-core</a></p>
</div>

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [LICENSE](#license)

## Installation

```sh
$ npm i rcs-webpack-plugin -D
```

## Usage

```js
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import RcsWebpackPlugin from 'rcs-webpack-plugin';

export default {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new RcsWebpackPlugin(),
  ],
};
```

## Options

### fillLibraries (boolean)

`fillLibraries` is to wether or not rcs should get prefilled with selectors. Turning off is usefull if you used [postcss-rcs](https://github.com/JPeer264/postcss-rcs) or plain [rcs-core](https://github.com/JPeer264/node-rcs-core).

Default: `true`

### fillLibrariesOptions (object)

`fillLibrariesOptions` just applies if `{ fillLibraries: true }`. These options are the same as [`rcs-core@fillLibraries`](https://github.com/JPeer264/node-rcs-core/blob/master/docs/api/filllibraries.md)

### espreeOptions (object)

`espreeOptions` are mainly for the JS parsing. These options are the same as [`rcs-core@replaceJs`](https://github.com/JPeer264/node-rcs-core/blob/master/docs/api/replace.md#js)


## LICENSE

MIT © [Jan Peer Stöcklmair](https://www.jpeer.at)
