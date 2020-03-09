const defaultConfig = {
  promiseOperator: '_',
  // awaitOperator: '$',
  promiseOn: {
    apply: true,
    set: true
  }
}

/**
* Dora.js - DO Remote Action
*/
function Dora (conf = defaultConfig) { // variable triggers not implemented
  return CollectingProxy([], defaultConfig, getPromise)
}

function CollectingProxy (collector = [], conf) { // variable triggers not implemented
  let target = () => null // we want to be able to catch apply
  return new Proxy(target, {
    get (t, prop, caller) {
      if (prop === conf.promiseOperator) { // promise operator not pushed to collector
        return getPromise(collector) // FIXME: promise operator should be blocked from setting
      }

      let newCollector = collect(collector, 'get', [prop]) // omit caller for now

      if (conf.promiseOn['get']) {
        return getPromise(newCollector)
      }
      return CollectingProxy(newCollector, conf)
    },
    apply (t, thisArg, argumentList) {
      let newCollector = collect(collector, 'apply', [{}, argumentList]) // dummy thisArg for now

      if (conf.promiseOn['apply']) {
        return getPromise(newCollector)
      }
      return CollectingProxy(newCollector, conf)
    },
    set (t, prop, value) {
      let newCollector = collect(collector, 'set', [prop, value])

      if (conf.promiseOn['set']) {
        return getPromise(newCollector)
      }
      return CollectingProxy(newCollector, conf)
    }
  })
}

/**
* Util
*/
function getPromise (collector) {
  console.log('Getting promise: ', CommUtil.toMessage(collector))
  return mockPromise()
}

const CommUtil = {}
CommUtil.toMessage = function (collector) {
  return JSON.stringify(collector)
}

CommUtil.applyMessageTo = function (msg, obj) {
  let collector = JSON.parse(msg)
  let current = obj
  collector.forEach((action) => {
    console.log('Current', current)
    console.log(`Reflect.${action.trap}(${JSON.stringify(current)}, ${action.args.join(',')})`)

    current = Reflect[action.trap](current, ...action.args)
  })
  return current
}

async function mockPromise () {
  return 1
}

function collect (oldCollector, trap, args) {
  return [...oldCollector, { trap, args }]
}

function actionTrigger ({ trigger, path, args = [] }) {
  console.log(`[Action] ${trigger}: ${path.join('.')} (${args.join(',')})`)
}
