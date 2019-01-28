# babel-plugin-forbid-imports

[![Build Status](https://travis-ci.org/jcoreio/babel-plugin-forbid-imports.svg?branch=master)](https://travis-ci.org/jcoreio/babel-plugin-forbid-imports)
[![Coverage Status](https://codecov.io/gh/jcoreio/babel-plugin-forbid-imports/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/babel-plugin-forbid-imports)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/babel-plugin-forbid-imports.svg)](https://badge.fury.io/js/babel-plugin-forbid-imports)

throw errors if certain packages/directories are imported from

# Purpose

I created this to automatically check whether client code in a webapp project
accidentally imports from server code.

# Installation

```
npm install --save-dev babel-plugin-forbid-imports
```

# Configuration options

## `packages`

An array of packages to forbid importing from.

### Example

```json
{
  "plugins": [
    [
      "babel-plugin-forbid-imports",
      {
        "packages": ["sequelize"]
      }
    ]
  ]
}
```

## `patterns`

An array of regular expression patterns. Any imports matching one of these
patterns will be forbidden. Each pattern can be a string or an array of
`[pattern, flags]`.

### Example

```json
{
  "plugins": [
    [
      "babel-plugin-forbid-imports",
      {
        "patterns": ["\\d", ["foo", "i"]]
      }
    ]
  ]
}
```

## `paths`

An array of paths to files or directories (relative to the babel cwd) to forbid
importing from. Subfiles and subdirectories are also forbidden.

### Example

```json
{
  "plugins": [
    [
      "babel-plugin-forbid-imports",
      {
        "paths": ["./src/server"]
      }
    ]
  ]
}
```
