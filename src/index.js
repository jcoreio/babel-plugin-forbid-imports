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

    return (lastPatterns = [
      ...packages.map(pkg => ({
        pattern: new RegExp(`^${pkg}(/|$)`),
        type: 'package',
        what: pkg,
      })),
      ...patterns.map(_pattern => {
        const pattern = Array.isArray(_pattern)
          ? new RegExp(_pattern[0], _pattern[1] || '')
          : new RegExp(_pattern, '')
        return {
          pattern,
          type: 'pattern',
          what: pattern,
        }
      }),
      ...paths.map(_path => ({
        pattern: new RegExp(`^${path.resolve(cwd, _path)}(/|$)`),
        type: 'path',
        what: _path,
      })),
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
