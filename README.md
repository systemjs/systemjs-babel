SystemJS Babel Transform
===

Provides Babel transforms of ES modules in SystemJS 2.0 when used with the "transform" extra.

Currently does not provide support for any other plugins, although PRs are welcome to add this feature.

## Usage

```html
<script src="systemjs/dist/system.js"></script>
<script src="systemjs/dist/extras/transform.js"></script>
<script src="dist/babel-transform.js"></script>
<script>
  System.import('./es-module.js');
</script>
```

    }
  }
});
```

## LICENSE

MIT