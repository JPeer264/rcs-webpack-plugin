import webpack, { Configuration, Stats } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import rimraf from 'rimraf';
import rcs from 'rcs-core';
import path from 'path';
import fs from 'fs';

import RcsWebpackPlugin, { Options } from '../src';

const buildDir = path.join(__dirname, 'build');

const getConfig = (file: string, opts: Options, noPlugin = false): Configuration => ({
  entry: path.join(__dirname, 'fixtures', file),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'build'),
  },
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
  plugins: noPlugin ? [] : [new RcsWebpackPlugin(opts)],
});

const run = (file: string, opts?): Promise<Stats | Error> => {
  const compiler = webpack(getConfig(file, opts));

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => (
      err ? reject(err) : resolve(stats)
    ));
  });
};

const getFile = (file): string => fs.readFileSync(path.join(buildDir, file)).toString();

describe('rcs-webpack-plugin', () => {
  afterEach(() => {
    rimraf.sync(buildDir);
  });

  describe('works', () => {
    it('fine', async () => {
      rcs.selectorLibrary.set('.jp-test');
      await run('js/main.js');
      const output = getFile('test.css');

      expect(output).toBe(true);
    });
  });
});
