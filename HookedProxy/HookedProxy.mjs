/**
* Proxy to check what traps are activated
*/
const validTrapKeys = new Set(Reflect.ownKeys(Reflect))
const isValidTrapKey = (trapKey) => validTrapKeys.has(trapKey)
const isString = thing => typeof thing === 'string'
const isFunction = thing => typeof thing === 'function'
/**
* Creates a transparent Proxy that, for each trap, calls a hook function
* Hook function receives all arguments from trap (watch out for infinite recursion)
* Default hook (run on all traps not specified in hooks object) can be specified in third argument
*/
function HookedProxy (object, hooks = {}, defaultHook) {
  let trapKeys = Object.keys(hooks)
  let trapHooks = Object.values(hooks)

  /**
  * Validation
  */
  if (!trapHooks.every(isFunction)) {
    throw new Error('Non-function hook')
  }
  if (!trapKeys.every(isString)) {
    throw new Error('Non-string trap key')
  }
  if (!trapKeys.every(isValidTrapKey)) {
    throw new Error('Invalid trap key')
  }

  let handler = {}
  // If we have default function, set it to trigger on all traps
  if (isFunction(defaultHook)) {
    handler = Reflect.ownKeys(Reflect).reduce((handler, trapKey) => {
      handler[trapKey] = (...args) => {
        defaultHook(trapKey, ...args)
        return Reflect[trapKey](...args)
      }
      return handler
    }, handler)
  }

  // insert hooks specified by trap key into handler
  // in case of default it will be overwritten as expected
  handler = trapKeys.reduce((handler, trapKey) => {
    handler[trapKey] = (...args) => {
      hooks[trapKey](...args)
      return Reflect[trapKey](...args)
    }
    return handler
  }, handler)
  return new Proxy(object, handler)
}

function SensibleDebugLogger (obj) {
  let getSetLogger = {
    get (t, prop, caller) { console.log(`get: ${prop} (${t[prop]})`) },
    set (t, prop, value) { console.log(`set: ${prop} = ${value}`) }
  }
  let defaultLogger = (trap, args) => console.log(`${trap}: ping`)
  return HookedProxy(obj, getSetLogger, defaultLogger)
}

export { HookedProxy, SensibleDebugLogger }
