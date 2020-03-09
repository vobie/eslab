const evalToGetScopeReader = function () { // needs to be eval'd
  return new Proxy({}, {
    get (target, prop, caller) {
      return eval(prop)
    }
  })
}
const ScopeReader = `(${evalToGetScopeReader.toString()})()`

export default ScopeReader
