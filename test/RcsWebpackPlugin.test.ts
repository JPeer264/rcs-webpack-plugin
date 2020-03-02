import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack, { Configuration } from 'webpack';
import { minify } from 'html-minifier';
import rimraf from 'rimraf';
import rcs from 'rcs-core';
import uuid from 'uuid/v1';
import path from 'path';
import fs from 'fs';

import RcsWebpackPlugin, { Options } from '../src';

const buildDir = path.join(__dirname, 'build');

let extraPlugins = [];

const getConfig = (file: string, opts?: Options, expect = false): Configuration => ({
  entry: path.join(__dirname, 'files', expect ? 'results' : 'fixtures', 'entries', file),
  output: {
    filename: 'bundle.js',
    path: path.join(buildDir, uuid()),
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
      {
        test: /\.hbs$/,
        use: [
          'handlebars-loader',
        ],
      },
    ],
  },
  plugins: [
    ...extraPlugins,
    new MiniCssExtractPlugin(),
    expect ? undefined : new RcsWebpackPlugin(opts),
  ].filter(a => a),
});

const run = async (file: string, opts?: Options, expect?: boolean): Promise<string> => {
  const config = getConfig(file, opts, expect);
  const compiler = webpack(config);
  const generatedPath = config.output.path.split('/').pop();

  await new Promise(res => compiler.run(() => res()));

  return generatedPath;
};

interface Files {
  html: string | null;
  pug: string | null;
  css: string | null;
  js: string | null;
}

const getFiles = (generatedPath: string): Files => (
  [
    ['html', 'index.html'],
    ['css', 'main.css'],
    ['js', 'bundle.js'],
    ['pug', 'index.pug'],
  ].reduce<Files>((prev, [type, name]) => {
    const filePath = path.join(buildDir, generatedPath, name);
    let file: string | null = null;

    if (fs.existsSync(filePath)) {
      file = fs.readFileSync(path.join(buildDir, generatedPath, name)).toString();
    }

    return {
      ...prev,
      [type]: file,
    };
  }, {} as any)
);

const expectFn = async (
  inputFile: string,
  expectedFile: string,
  toCompare: ('js' | 'css' | 'html' | 'pug')[],
  options?: Options,
): Promise<void> => {
  const generatedPath = await run(inputFile, options);
  const eGeneratedPath = await run(expectedFile, undefined, true);
  const {
    js,
    css,
    pug,
    html,
  } = getFiles(generatedPath);
  const {
    js: eJs,
    css: eCss,
    pug: ePug,
    html: eHtml,
  } = getFiles(eGeneratedPath);

  if (toCompare.includes('js')) {
    expect(js).toBeTruthy();
    expect(eJs).toBeTruthy();
    expect(js).toEqual(eJs);
  }

  if (toCompare.includes('css')) {
    expect(css).toBeTruthy();
    expect(eCss).toBeTruthy();
    expect(css).toEqual(eCss);
  }

  if (toCompare.includes('pug')) {
    expect(pug).toBeTruthy();
    expect(ePug).toBeTruthy();
    expect(pug).toEqual(ePug);
  }

  if (toCompare.includes('html')) {
    expect(html).toBeTruthy();
    expect(eHtml).toBeTruthy();
    expect(html).toEqual(eHtml);
  }
};

describe('rcs-webpack-plugin', () => {
  beforeEach(() => {
    rcs.nameGenerator.setAlphabet('#abcdefghijklmnopqrstuvwxyz');
    rcs.nameGenerator.reset();
    rcs.selectorLibrary.reset();
    rcs.keyframesLibrary.reset();
    rcs.cssVariablesLibrary.reset();

    extraPlugins = [];
  });

  afterEach(() => {
    rimraf.sync(buildDir);
  });

  it('main js', () => expectFn('main.js', 'main.js', ['css', 'js']));

  it('main js ignore variables', () => (
    expectFn('main.js', 'main-ignore-variables.js', ['css', 'js'], { fillLibrariesOptions: { ignoreCssVariables: true } })
  ));

  it('should work with HtmlWebpackPlugin', (done) => {
    extraPlugins = [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'files/fixtures/entries/index-with-style.html'),
      }),
    ];

    const config = getConfig('main.js');

    webpack(config, (_, res) => {
      const generatedHtml = res.compilation.assets['index.html'].source();
      const expectedHtml = fs.readFileSync(path.join(__dirname, 'files/results/html/index-with-style.html'), 'utf8');

      expect(minify(generatedHtml, { collapseWhitespace: true }))
        .toEqual(minify(expectedHtml, { collapseWhitespace: true }));

      done();
    });
  });

  it('should work with HtmlWebpackPlugin and handlebars', (done) => {
    extraPlugins = [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'files/fixtures/entries/index-with-style.hbs'),
      }),
    ];

    const config = getConfig('main.js');

    webpack(config, (_, res) => {
      const generatedHtml = res.compilation.assets['index.html'].source();
      const expectedHtml = fs.readFileSync(path.join(__dirname, 'files/results/html/index-handlebars.html'), 'utf8');

      expect(minify(generatedHtml, { collapseWhitespace: true }))
        .toEqual(minify(expectedHtml, { collapseWhitespace: true }));

      done();
    });
  });

  it('should work with HtmlWebpackPlugin and handlebars variables | issue #6', (done) => {
    extraPlugins = [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'files/fixtures/entries/index-with-kept-variables.hbs'),
      }),
    ];

    const config = getConfig('main.js', { experimentalHandlebarsVariables: true });

    webpack(config, (_, res) => {
      const generatedHtml = res.compilation.assets['index.html'].source();
      const expectedHtml = fs.readFileSync(path.join(__dirname, 'files/results/html/index-handlebars-kept-variables.html'), 'utf8');

      expect(minify(generatedHtml, { collapseWhitespace: true }))
        .toEqual(minify(expectedHtml, { collapseWhitespace: true }));

      done();
    });
  });
});
