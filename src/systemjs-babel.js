/*
 * SystemJS format Babel transformer
 */
import * as babel from '@babel/core';
import babelPluginTransformTypeScript from '@babel/plugin-transform-typescript';
import babelPluginSyntaxClassProperties from '@babel/plugin-syntax-class-properties';
import babelPluginNumericSeparator from '@babel/plugin-proposal-numeric-separator';
import babelPluginProposalExportDefaultFrom from '@babel/plugin-proposal-export-default-from';
import babelPluginProposalExportNamespaceFrom from '@babel/plugin-proposal-export-namespace-from';
import babelPluginTransformModulesSystemJS from '@babel/plugin-transform-modules-systemjs';
import babelPluginProposalDynamicImport from '@babel/plugin-proposal-dynamic-import';
import babelPluginTransformReactJsx from '@babel/plugin-transform-react-jsx';

const plugins = [
  babelPluginProposalExportDefaultFrom,
  babelPluginProposalExportNamespaceFrom,
  babelPluginSyntaxClassProperties,
  babelPluginNumericSeparator,

  babelPluginProposalDynamicImport,
  babelPluginTransformModulesSystemJS,
];

const tsPlugins = [
  [babelPluginTransformTypeScript, {
    onlyRemoveTypeImports: true
  }],
  ...plugins
];
const tsxPlugins = [
  [babelPluginTransformTypeScript, {
    isTSX: true,
    onlyRemoveTypeImports: true
  }],
  babelPluginTransformReactJsx,
  ...plugins
];
const jsxPlugins = [
  babelPluginTransformReactJsx,
  ...plugins
];

var stage3Syntax = ['asyncGenerators', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'dynamicImport', 'importMeta', 'nullishCoalescingOperator', 'numericSeparator', 'optionalCatchBinding', 'optionalChaining', 'objectRestSpread', 'topLevelAwait'];

var global = typeof self !== 'undefined' ? self : global;
var systemJSPrototype = global.System.constructor.prototype;

systemJSPrototype.shouldFetch = function () {
  return true;
};

var jsonCssWasmContentType = /^(application\/json|application\/wasm|text\/css)(;|$)/;
var jtsxUrls = /^[^#?]+\.(tsx?|jsx)([?#].*)?$/;
var tsxUrls = /^[^#?]+\.tsx([?#].*)?$/;
var jsxUrls = /^[^#?]+\.jsx([?#].*)?$/;
var registerRegEx = /\s*(\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*)*\s*System\s*\.\s*register\s*\(\s*(\[[^\]]*\])\s*,\s*\(?function\s*\(\s*([^\),\s]+\s*(,\s*([^\),\s]+)\s*)?\s*)?\)/;

var fetch = systemJSPrototype.fetch;
systemJSPrototype.fetch = function (url, options) {
  return fetch(url, options)
  .then(function (res) {
    if (!res.ok || jsonCssWasmContentType.test(res.headers.get('content-type')))
      return res;
    
    return res.text()
    .then(function (source) {
      if (registerRegEx.test(source))
        return new Response(new Blob([source], { type: 'application/javascript' }));

      return new Promise((resolve, reject) => {
        babel.transform(source, {
          filename: url,
          sourceMaps: 'inline',
          ast: false,
          compact: false,
          sourceType: 'module',
          parserOpts: {
            plugins: stage3Syntax,
            errorRecovery: true
          },
          plugins: jtsxUrls.test(url) ? tsxUrls.test(url) ? tsxPlugins : jsxUrls.test(url) ? jsxPlugins : tsPlugins : plugins
        }, function (err, result) {
          if (err)
            return reject(err);
          const code = result.code + '\n//# sourceURL=' + url + '!system';
          resolve(new Response(new Blob([code], { type: 'application/javascript' })));
        });
      })
    });
  });
};
