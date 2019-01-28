import path from 'path'
import plugin from '../src'
import { expect } from 'chai'

import { describe, it } from 'mocha'

for (let prefix of ['@babel/', 'babel-']) {
  const pkg = `${prefix}core`
  describe(pkg, function() {
    const { transform } = require(pkg)
    describe(`babel-plugin-forbid-imports`, function() {
      it(`requires packages to be an array`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { packages: 'foo' }]] })
        ).to.throw(Error, `packages must be an array if given`)
      })
      it(`requires packages to contain only strings`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { packages: ['foo', 2] }]] })
        ).to.throw(Error, `packages[1] must be a string`)
      })
      it(`requires patterns to be an array`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { patterns: 'foo' }]] })
        ).to.throw(Error, `patterns must be an array if given`)
      })
      it(`requires packages to contain only strings or arrays of strings`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, {
            plugins: [[plugin, { patterns: [['foo', 'i'], 2] }]],
          })
        ).to.throw(Error, `patterns[1] must be a string or array of strings`)

        expect(() =>
          transform(code, {
            plugins: [[plugin, { patterns: [['foo', 'i'], ['bar', 2]] }]],
          })
        ).to.throw(Error, `patterns[1][1] must be a string if given`)
      })
      it(`requires paths to be an array`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { paths: 'foo' }]] })
        ).to.throw(Error, `paths must be an array if given`)
      })
      it(`requires paths to contain only strings`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { paths: ['foo', 2] }]] })
        ).to.throw(Error, `paths[1] must be a string`)
      })
      it(`forbids exact package imports`, function() {
        const code = `
        import foo from 'foo'
        import {size} from 'lodash'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { packages: ['lodash'] }]] })
        ).to.throw(
          Error,
          `importing from 'lodash' is forbidden (imported: 'lodash')`
        )
      })
      it(`forbids exact package dynamic imports`, function() {
        const code = `
        import foo from 'foo'
        import('lodash')
        `
        expect(() =>
          transform(code, {
            plugins: [
              `${prefix}plugin-syntax-dynamic-import`,
              [plugin, { packages: ['lodash'] }],
            ],
          })
        ).to.throw(
          Error,
          `importing from 'lodash' is forbidden (imported: 'lodash')`
        )
      })
      it(`forbids exact package requires`, function() {
        const code = `
        import foo from 'foo'
        require('lodash')
        `
        expect(() =>
          transform(code, {
            plugins: [
              `${prefix}plugin-syntax-dynamic-import`,
              [plugin, { packages: ['lodash'] }],
            ],
          })
        ).to.throw(
          Error,
          `importing from 'lodash' is forbidden (imported: 'lodash')`
        )
      })
      it(`ignores shadowed requires`, function() {
        const code = `
        import foo from 'foo'
        function bar(require) {
          require('lodash')
        }
        `
        transform(code, {
          plugins: [
            `${prefix}plugin-syntax-dynamic-import`,
            [plugin, { packages: ['lodash'] }],
          ],
        })
      })
      it(`forbids imports from within packages`, function() {
        const code = `
        import foo from 'foo'
        import size from 'lodash/size'
        `
        expect(() =>
          transform(code, { plugins: [[plugin, { packages: ['lodash'] }]] })
        ).to.throw(
          Error,
          `importing from 'lodash' is forbidden (imported: 'lodash/size')`
        )
      })
      it(`forbids imports from paths`, function() {
        const code = `
        import foo from './src/foo'
        `
        const options = {
          filename: path.resolve(__dirname, '..', 'blah.js'),
          plugins: [
            [
              plugin,
              {
                paths: [
                  pkg === 'babel-core'
                    ? path.resolve(__dirname, '..', 'src')
                    : '../src',
                ],
              },
            ],
          ],
        }
        if (pkg !== 'babel-core') options.cwd = __dirname
        expect(() => transform(code, options)).to.throw(
          Error,
          `importing from './src' is forbidden (imported: './src/foo')`
        )
      })
      it(`forbids imports matching patterns`, function() {
        const code = `
        import foo from 'foo'
        import bar from '0bar'
        `
        expect(() =>
          transform(code, {
            filename: path.resolve(__dirname, '..', 'blah.js'),
            plugins: [
              [
                plugin,
                {
                  patterns: ['^\\d'],
                },
              ],
            ],
          })
        ).to.throw(
          Error,
          `importing from /^\\d/ is forbidden (imported: '0bar')`
        )
      })
      it(`forbids imports matching patterns with flags`, function() {
        const code = `
        import foo from 'foo'
        import bar from '0BAR'
        `
        expect(() =>
          transform(code, {
            filename: path.resolve(__dirname, '..', 'blah.js'),
            plugins: [
              [
                plugin,
                {
                  patterns: [['bar', 'i']],
                },
              ],
            ],
          })
        ).to.throw(
          Error,
          `importing from /bar/i is forbidden (imported: '0BAR')`
        )
      })
    })
  })
}
