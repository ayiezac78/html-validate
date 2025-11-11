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
{
	"$schema": "https://html-validate.org/schemas/config.json",
	"extends": [
		"html-validate:recommended",
+		"html-sentinel-shepherd:recommended"
	],
	"plugins": ["html-sentinel-shepherd"],
	"elements": ["html5"],
	"rules": {
		"no-style-tag": "error",
		"heading-level": [
			"error",
			{ "allowMultipleH1": false, "minInitialRank": "h1" }
		],
		"missing-doctype": "error"
	}
}
```
