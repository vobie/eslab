
makeHandler = function (target, reflectTarget, lookFunction) {
  return '{\n' + Object.keys(
    Object.getOwnPropertyDescriptors(Reflect)
  ).map((handlerName) => `  ${handlerName}: (${target}, ...args) => {
    lookFunction("${handlerName}", ...args)
    return Reflect.${handlerName}(${reflectTarget}, ...args)
  }`).join(',\n') +
    '\n}'
}

//reference on what traps exist, template
function vroxyHandler (conf) {
  return {
    apply (target, thisArg, argumentsList) {
      return Reflect.apply(conf.target, thisArg, argumentsList)
    },
    construct (target, args) {
      return Reflect.construct(conf.target, args)
    },
    defineProperty (target, key, descriptor) { // Will not trigger if set() exists
      return Reflect.defineProperty(conf.target, key, descriptor)
    },
    deleteProperty (target, prop) {
      return Reflect.deleteProperty(conf.target, prop)
    },
    get (target, prop, caller) {
      return Reflect.get(conf.target, prop, caller)
    },
    getOwnPropertyDescriptor (target, prop) {
      return Reflect.getOwnPropertyDescriptor(conf.target, prop)
    },
    getPrototypeOf (target) {
      return Reflect.getPrototypeOf(conf.target)
    },
    has (target, key) {
      return Reflect.has(conf.target, key)
    },
    isExtensible (target) {
      return Reflect.isExtensible(conf.target)
    },
    ownKeys (target) {
      return Reflect.ownKeys(conf.target)
    },
    preventExtensions (target) {
      return Reflect.preventExtensions(conf.target)
    },
    set (target, prop, value) {
      return Reflect.set(conf.target, prop, value)
    },
    setPrototypeOf: (target, prototype) => {
      return Reflect.setPrototypeOf(conf.target, prototype)
    }
  }
}



/**
  * Gets all own properties and symbols, strips them, insert proxy as prototype
  * store old own keys in side object
  */
Object.hijack = (obj) {
  let _shadow = Object.create(Object.getPrototypeOf(obj))
  Object.defineProperties(_shadow, Object.getOwnPropertyDescriptors(obj))
  Object.setPrototypeOf(obj, proxy)
}
