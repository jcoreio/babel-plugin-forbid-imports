import path from 'path'
import plugin from '../src'
import { expect } from 'chai'

import { describe, it } from 'mocha'

for (let pkg of ['@babel/core', 'babel-core']) {
  describe(pkg, function() {
    const { transform } = require(pkg)
    describe(`babel-plugin-forbid-imports`, function() {
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
