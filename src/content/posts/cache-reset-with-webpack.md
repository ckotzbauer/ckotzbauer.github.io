---
title: Cache reset with Webpack
published: 2017-01-22T10:00:00Z
description: "Cache busting with webpack."
image: ""
tags: [Webpack, SPA, Web]
category: "Development"
draft: false
lang: "en"
---

# Cache reset with Webpack

There are several strategies to implement a caching mechanism. The common way with Webpack is, to change the file

name and add a content-based hash. The advantage of this is, that the file only needs to be reloaded if its content

changed. But the disadvantage is (e.g. for images) that all references in your source-code have to be modified in

order to match the different file names, but this seems to be solvable. But what happens, if you start generating some paths

through variables at runtime? So I considered to use a fairly old mechanism: Cache-Busting with a Query-Parameter.

To append this parameter to all the code references, I wrote a custom webpack-loader.

## Usage

First, install the loader through npm:

```bash

npm install cache-bust-loader
```

Enter fullscreen modeExit fullscreen mode

Assuming, that the list of loaders in your `webpack.config.js` looks similar to this:

```js

[\
  { test: /\.css$/, loader: ExtractTextPlugin.extract({ loader: 'css-loader' }) },\
  { test: /\.html$/, loader: 'raw-loader' },\
  { test: /\.ts$/, loader: 'awesome-typescript-loader' },\
];
```

Enter fullscreen modeExit fullscreen mode

Now, simply add the `cache-bust-loader` to each file-type where you reference other files which you want to be cache-busted:

```js

const cacheBustLoader = `cache-bust-loader?name=bust&value=${bustValue}`;

[\
  { test: /\.css$/, loader: ExtractTextPlugin.extract({ loader: `${cacheBustLoader}!css-loader` }) },\
  { test: /\.html$/, loader: `${cacheBustLoader}!raw-loader` },\
  { test: /\.ts$/, loader: `${cacheBustLoader}!awesome-typescript-loader` },\
];
```

Enter fullscreen modeExit fullscreen mode

The loader has three parameters:

| Parameter | Mandatory | Data type | Default value                                        |
| --------- | --------- | --------- | ---------------------------------------------------- |
| name      | True      | String    |                                                      |
| value     | False     | String    |                                                      |
| types     | False     | String    | eot;woff;woff2;svg;ttf;otf;jpg;jpeg;png;ico;gif;json |

The `name` describes the name of the query parameter, the `value` the string which should change every build.

If the `value` is empty, no parameters are applied (e.g. in development mode). The `types` are file-types

which you want to be cache-busted. Split them with a semicolon.

To generate a short unique string for each build you can fill `bustValue` like this:

```js
bustValue = require("randomstring").generate(5);
```

Enter fullscreen modeExit fullscreen mode

## Result

Open your browser-network-tab:

[![network-tab](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fraw.githubusercontent.com%2Fckotzbauer%2Fdev.to-posts%2Fmaster%2Fblog-posts%2F2020%2Fcache-reset-with-webpack%2Fassets%2Fnetwork-tab.jpg)](https://media2.dev.to/dynamic/image/width=800%2Cheight=%2Cfit=scale-down%2Cgravity=auto%2Cformat=auto/https%3A%2F%2Fraw.githubusercontent.com%2Fckotzbauer%2Fdev.to-posts%2Fmaster%2Fblog-posts%2F2020%2Fcache-reset-with-webpack%2Fassets%2Fnetwork-tab.jpg)

## Conclusion

This webpack-loader makes it easy to implement a basic cache-reset mechanism. All files matching the file-type have the query-parameter appended

and are reloaded if a new version of your frontend-project is deployed.
