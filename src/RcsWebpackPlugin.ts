import { Plugin, Compiler, compilation as webpackCompilation } from 'webpack';
import replaceData from 'rename-css-selectors/dest/process/replaceData';
import defaults from 'rename-css-selectors/dest/process/defaults';
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

export interface FillLibrariesOptions {
  experimentalHandlebarsVariables?: boolean;
  fillLibrariesOptions?: RcsOptions;
  fillLibraries?: true;
  espreeOptions?: {
    ecmaVersion: number;
    sourceType: string;
    ecmaFeatures: {
      jsx: boolean;
    };
  };
}

export interface NoFillLibrariesOptions {
  experimentalHandlebarsVariables?: boolean;
  fillLibraries?: false;
  espreeOptions?: {
    ecmaVersion: number;
    sourceType: string;
    ecmaFeatures: {
      jsx: boolean;
    };
  };
}

export type Options = FillLibrariesOptions | NoFillLibrariesOptions;

class RcsWebpackPlugin implements Plugin {
  public options: Options = {};

  public plugin = 'RcsPlugin';

  public constructor(options: Options = {}) {
    this.options = {
      fillLibraries: true,
      ...options,
    };
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(this.plugin, this.compilation.bind(this));
  }

  private compilation(compilation: webpackCompilation.Compilation): void {
    compilation.hooks.optimizeChunkAssets.tap(
      this.plugin,
      () => this.optimization(compilation),
    );
  }

  private htmlWebpackPlugin(compilation: webpackCompilation.Compilation): void {
    let hookAfter = (compilation.hooks as any).htmlWebpackPluginAfterHtmlProcessing;
    const [HtmlWebpackPlugin] = (compilation.compiler.options.plugins || []).filter(plugin => (
      plugin.constructor.name === 'HtmlWebpackPlugin'
    ));

    // html-webpack-plugin v4+
    if (!hookAfter && HtmlWebpackPlugin) {
      const hooks = (HtmlWebpackPlugin as any).constructor.getHooks(compilation);

      if (!hooks) {
        return;
      }

      hookAfter = hooks.afterTemplateExecution;
    }

    if (!hookAfter) {
      // HtmlWebpackPlugin not in use
      return;
    }

    // replace after processing
    // in case html changed during processing
    hookAfter.tapAsync(this.plugin, (htmlData: any, callback: any) => {
      const options = (this.options as FillLibrariesOptions).fillLibrariesOptions || {};

      let { html } = htmlData;

      // replace handlebars variables when they were ignored
      if (this.options.experimentalHandlebarsVariables) {
        html = html.replace(/({{[\s\S]*}})/g, "'experimentalRcs$1experimentalRcsEnd'");
      }

      rcs.fillLibraries(html, {
        ...options,
        codeType: 'html',
      });

      html = rcs.replace.html(html, { espreeOptions: this.options.espreeOptions });

      if (this.options.experimentalHandlebarsVariables) {
        html = html.replace(/'experimentalRcs([\s\S]*)experimentalRcsEnd'/, '$1');
      }

      // eslint-disable-next-line no-param-reassign
      htmlData.html = html;

      callback(null, htmlData);
    });
  }

  private optimization(compilation: webpackCompilation.Compilation): void {
    const filesArray = Object.keys(compilation.assets);

    // should gain selectors first
    const cssHtmlFiles = filesArray.filter(file => (
      defaults.fileExt.css.includes(path.extname(file))
      || defaults.fileExt.html.includes(path.extname(file))
    ));

    // todo jpeer: check if there is a way to get source without webpackBootstrap
    // set some excludes as they are used in the webpackBootstrap
    rcs.selectorsLibrary.setExclude(/^(default|string|object|a)$/);

    if (this.options.fillLibraries) {
      // fill libraries first just if wanted
      cssHtmlFiles.forEach((filePath) => {
        const isHtml = defaults.fileExt.html.includes(path.extname(filePath));
        const options = (this.options as FillLibrariesOptions).fillLibrariesOptions || {};

        rcs.fillLibraries(
          compilation.assets[filePath].source(),
          {
            prefix: options.prefix,
            suffix: options.suffix,
            replaceKeyframes: options.replaceKeyframes,
            preventRandomName: options.preventRandomName,
            ignoreAttributeSelectors: options.ignoreAttributeSelectors,
            ignoreCssVariables: options.ignoreCssVariables,
            codeType: isHtml ? 'html' : 'css',
          },
        );
      });
    }

    filesArray.forEach((filePath) => {
      const data = replaceData('auto', filePath, compilation.assets[filePath].source(), { espreeOptions: this.options.espreeOptions });

      // todo jpeer: add sourcemaps
      // eslint-disable-next-line no-param-reassign
      compilation.assets[filePath] = new RawSource(data);
    });

    this.htmlWebpackPlugin(compilation);
  }
}

export default RcsWebpackPlugin;
