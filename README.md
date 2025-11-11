# html-sentinel-shepherd
A custom plugin for html-validate linting rule for HTML files.

## Getting Started

### Add package as dev dependency
```js
npm i -D html-sentinel-shepherd
```
### Update your HTML-validate configuration
This example assumes you are using the .htmlvalidate.mjs configuration flavor. HTML-validate also supports other [configuration](https://html-validate.org/usage/index.html#configuration).
```js
  import { defineConfig } from "html-validate";
+ import { NiceCheckersPlugin } from "@fulldecent/nice-checkers-plugin"

  export default defineConfig({
-   "extends": ["htmlvalidate:recommended"]
+   "plugins": [NiceCheckersPlugin],
+   "extends": ["htmlvalidate:recommended", "nice-checkers-plugin:recommended"]
  });
```
