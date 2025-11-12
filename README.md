# html-sentinel-shepherd
A custom plugin for html-validate linting rule for HTML files.

## npm
https://www.npmjs.com/package/html-sentinel-shepherd

## Getting Started

### Add package as dev dependency
```js
npm i -D html-sentinel-shepherd
```
### Update your HTML-validate configuration
This example assumes you are using the .htmlvalidate.json configuration flavor. HTML-validate also supports other [configuration](https://html-validate.org/usage/index.html#configuration).
```diff
  {
  	"$schema": "https://html-validate.org/schemas/config.json",
  	"extends": [
  		"html-validate:recommended",
+  		"html-sentinel-shepherd:recommended"
  	],
+  	"plugins": ["html-sentinel-shepherd"]
  }
```
