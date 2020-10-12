/*
 * SystemJS format Babel transformer
 */
import * as babel from '@babel/core';
import babelPresetTypeScript from '@babel/preset-typescript';
import babelPluginClassProperties from '@babel/plugin-proposal-class-properties';
import babelPluginNumericSeparator from '@babel/plugin-proposal-numeric-separator';
import pluginProposalExportDefaultFrom from '@babel/plugin-proposal-export-default-from';
import pluginProposalExportNamespaceFrom from '@babel/plugin-proposal-export-namespace-from';
import pluginTransformModulesSystemJS from './babel-plugin-transform-modules-systemjs-patched.js';
import pluginProposalDynamicImport from '@babel/plugin-proposal-dynamic-import';
import pluginProposalDecorators from '@babel/plugin-proposal-decorators';

var plugins = [
  pluginProposalExportDefaultFrom,
  pluginProposalExportNamespaceFrom,
  babelPluginClassProperties,
  babelPluginNumericSeparator,
  pluginProposalDynamicImport,
  [pluginProposalDecorators, { decoratorsBeforeExport: true }],
  pluginTransformModulesSystemJS,
];
var tsPreset = [[babelPresetTypeScript, {
  allowDeclareFields: true,
  onlyRemoveTypeImports: true
}]];
var stage3Syntax = ['asyncGenerators', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'dynamicImport', 'importMeta', 'nullishCoalescingOperator', 'numericSeparator', 'optionalCatchBinding', 'optionalChaining', 'objectRestSpread', 'topLevelAwait'];

var global = typeof self !== 'undefined' ? self : global;
var systemJSPrototype = global.System.constructor.prototype;

systemJSPrototype.shouldFetch = function () {
  return true;
};

var jsonCssWasmContentType = /^(application\/json|application\/wasm|text\/css)(;|$)/;
var tsUrls = /^[^#?]+\.ts([?#].*)?$/;
var registerRegEx = /^\s*(\/\*[^\*]*(\*(?!\/)[^\*]*)*\*\/|\s*\/\/[^\n]*)*\s*System\s*\.\s*register\s*\(\s*(\[[^\]]*\])\s*,\s*\(?function\s*\(\s*([^\),\s]+\s*(,\s*([^\),\s]+)\s*)?\s*)?\)/;

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
          compact: true,
          sourceType: 'module',
          parserOpts: {
            plugins: stage3Syntax,
            errorRecovery: true
          },
          plugins: plugins,
          presets: tsUrls.test(url) ? tsPreset : []
        }, function (err, result) {
          if (err)
            return reject(err);
          const code = result.code + '\n//# sourceURL=' + u + '!system';
          resolve(new Response(new Blob([code], { type: 'application/javascript' })));
        });
      })
    });
  });
};
