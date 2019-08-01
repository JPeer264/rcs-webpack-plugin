import { Plugin, Compiler, compilation as webpackCompilation } from 'webpack';
import replaceData from 'rename-css-selectors/lib/process/replaceData';
import ModuleFilenameHelpers from 'webpack/lib/ModuleFilenameHelpers';
import defaults from 'rename-css-selectors/lib/process/defaults';
import { RawSource } from 'webpack-sources';
import rcs from 'rcs-core';
import path from 'path';

// todo jpeer: change to rcs-core options as soon as it is typesafe
interface RcsOptions {
  suffix?: string;
  prefix?: string;
  replaceKeyframes?: boolean;
  preventRandomName?: boolean;
  ignoreCssVariables?: boolean;
  ignoreAttributeSelectors?: boolean;
}

export interface Options extends RcsOptions {
  rcs?: typeof rcs;
  fillLibraries?: boolean;
  espreeOptions?: {
    ecmaVersion: number;
    sourceType: string;
    ecmaFeatures: {
      jsx: boolean;
    };
  };
}

class RcsWebpackPlugin implements Plugin {
  public options: Options = {};

  public plugin = 'RcsPlugin';

  public constructor(options: Options = {}) {
    this.options = options;
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(this.plugin, this.compilation.bind(this));
  }

  private compilation(compilation: webpackCompilation.Compilation): void {
    compilation.hooks.optimizeChunkAssets.tap(
      this.plugin,
      chunks => this.optimization(compilation, chunks),
    );
  }

  private optimization(
    compilation: webpackCompilation.Compilation,
    chunks: webpackCompilation.Chunk[],
  ): void {
    const filesArray = chunks.reduce((acc, chunk) => acc.concat(chunk.files || []), [])
      .concat(compilation.additionalChunkAssets || [])
      .filter(ModuleFilenameHelpers.matchObject.bind(null, this.options));

    // should gain selectors first
    const cssHtmlFiles = filesArray.filter(file => (
      defaults.fileExt.css.includes(path.extname(file))
      || defaults.fileExt.html.includes(path.extname(file))
    ));

    // todo jpeer: check if there is a way to get source without webpackBootstrap
    // set some excludes as they are used in the webpackBootstrap
    rcs.selectorLibrary.setExclude(/default|string|object|a/);

    if (this.options.fillLibraries) {
      // fill libraries first just if wanted
      cssHtmlFiles.forEach((filePath) => {
        const isHtml = defaults.fileExt.html.includes(path.extname(filePath));

        rcs.fillLibraries(
          compilation.assets[filePath].source(),
          {
            prefix: this.options.prefix,
            suffix: this.options.suffix,
            replaceKeyframes: this.options.replaceKeyframes,
            preventRandomName: this.options.preventRandomName,
            ignoreAttributeSelectors: this.options.ignoreAttributeSelectors,
            ignoreCssVariables: this.options.ignoreCssVariables,
            codeType: isHtml ? 'html' : 'css',
          },
        );
      });
    }

    filesArray.forEach((filePath) => {
      const data = replaceData(filePath, compilation.assets[filePath].source(), {
        ...this.options.espreeOptions,
        type: 'auto',
      });

      // todo jpeer: add sourcemaps
      // eslint-disable-next-line no-param-reassign
      compilation.assets[filePath] = new RawSource(data);
    });
  }
}

export default RcsWebpackPlugin;
