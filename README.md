# babel-plugin-transform-switch-with



## Installation

```sh
$ npm install babel-plugin-transform-switch-with
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-switch-with"]
}
```

### Via CLI

```sh
$ babel --plugins transform-switch-with script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-switch-with"]
});
```
