import path from 'path'

export default function() {
  let lastOpts
  let lastCwd
  let lastPatterns

  function selectPatterns(state) {
    const { opts } = state
    const cwd = state.cwd || process.cwd()
    if (opts === lastOpts && cwd === lastCwd) return lastPatterns
    lastCwd = cwd
    lastOpts = opts

    const { packages = [], patterns = [], paths = [] } = opts
    if (!Array.isArray(packages)) {
      throw new Error('packages must be an array if given')
    }
    if (!Array.isArray(patterns)) {
      throw new Error('patterns must be an array if given')
    }
    if (!Array.isArray(paths)) {
      throw new Error('paths must be an array if given')
    }

    return (lastPatterns = [
      ...packages.map((pkg, index) => {
        if (typeof pkg !== 'string') {
          throw new Error(`packages[${index}] must be a string`)
        }
        return {
          pattern: new RegExp(`^${pkg}(/|$)`),
          type: 'package',
          what: pkg,
        }
      }),
      ...patterns.map((_pattern, index) => {
        let pattern
        if (Array.isArray(_pattern)) {
          if (typeof _pattern[0] !== 'string') {
            throw new Error(`patterns[${index}][0] must be a string`)
          }
          if (_pattern.length > 1 && typeof _pattern[1] !== 'string') {
            throw new Error(`patterns[${index}][1] must be a string if given`)
          }
          pattern = new RegExp(_pattern[0], _pattern[1] || '')
        } else if (typeof _pattern === 'string') {
          pattern = new RegExp(_pattern)
        } else {
          throw new Error(
            `patterns[${index}] must be a string or array of strings`
          )
        }
        return {
          pattern,
          type: 'pattern',
          what: pattern,
        }
      }),
      ...paths.map((_path, index) => {
        if (typeof _path !== 'string') {
          throw new Error(`paths[${index}] must be a string`)
        }
        return {
          pattern: new RegExp(`^${path.resolve(cwd, _path)}(/|$)`),
          type: 'path',
          what: _path,
        }
      }),
    ])
  }

  return {
    visitor: {
      ImportDeclaration(_path, state) {
        const filename =
          (state.file && state.file.opts && state.file.opts.filename) ||
          state.filename
        const cwd = state.cwd || process.cwd()
        const rawSource = _path.node.source.value
        const source = /^[./]/.test(rawSource)
          ? path.resolve(path.dirname(filename), rawSource)
          : rawSource
        const patterns = selectPatterns(state)
        patterns.forEach(({ pattern, type, what }) => {
          if (pattern.test(source)) {
            let rule
            switch (type) {
              case 'package':
                rule = `'${what}'`
                break
              case 'pattern':
                rule = String(what)
                break
              case 'path':
                rule = path.relative(
                  path.dirname(filename),
                  path.resolve(cwd, what)
                )
                if (!/^\./.test(rule)) rule = `./${rule}`
                rule = `'${rule}'`
                break
            }

            throw new Error(
              `importing from ${rule} is forbidden (imported: '${rawSource}')`
            )
          }
        })
      },
    },
  }
}
