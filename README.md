[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![npm version](https://badge.fury.io/js/rcs-webpack-plugin.svg)](https://badge.fury.io/js/rcs-webpack-plugin)
[![Build Status](https://travis-ci.com/JPeer264/rcs-webpack-plugin.svg?branch=main)](https://travis-ci.com/JPeer264/rcs-webpack-plugin)
[![Coverage Status](https://coveralls.io/repos/github/JPeer264/rcs-webpack-plugin/badge.svg?branch=main)](https://coveralls.io/github/JPeer264/rcs-webpack-plugin?branch=main)

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

With NPM v7+:

```
$ npm i rcs-webpack-plugin -D
```

With prior NPM versions:

```sh
$ npm i rcs-webpack-plugin rcs-core rename-css-selectors -D
```

## Usage

```js
import rcs from 'rcs-core'; // just import this if you want to change the options on the core directly
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import RcsWebpackPlugin from 'rcs-webpack-plugin';

// following methods also allow array of strings and RegExp
rcs.selectorLibrary.setExclude('my-selector'); // if you want to exclude a specific selector
rcs.selectorLibrary.set('my-custom-selector'); // if you want to include custom selectors which are not in css files
// check out github.com/JPeer264/node-rcs-core/blob/7e3ebb872964f49bf82c84f6920005610a3d252a/docs/api for more information

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

`fillLibrariesOptions` just applies if `{ fillLibraries: true }`. These options are the same as [`rcs-core@fillLibraries`](https://github.com/JPeer264/node-rcs-core/blob/main/docs/api/filllibraries.md)

### espreeOptions (object)

`espreeOptions` are mainly for the JS parsing. These options are the same as [`rcs-core@replaceJs`](https://github.com/JPeer264/node-rcs-core/blob/main/docs/api/replace.md#js)

### experimentalHandlebarsVariables

If you use handlebars and have variables in your JavaScript for dynamic content creation

Default: `false`

## LICENSE

MIT © [Jan Peer Stöcklmair](https://www.jpeer.at)
