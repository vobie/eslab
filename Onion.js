// incomplete
function onion (objectSet) {
  return new Proxy({}, {
    get (t, prop, caller) {
      let objThatHasProp = Array.from(objectSet).find((o) => o.hasOwnProperty(prop))
      return objThatHasProp ? objThatHasProp[prop] : undefined // security: restrict to own keys
    },
    ownKeys (t) {
      let keySet = Array.from(objectSet)
        .reduce((set, o) => {
          Reflect.ownKeys(o).forEach(set.add.bind(set))
          return set
        }, new Set())
      return Array.from(keySet)
    }
  })
}
