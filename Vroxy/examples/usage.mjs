import { Vroxy } from '../Vroxy.mjs'

const obj1 = { foo: 'bar',
  baz: 'oof',
  f () {
    console.log(`this.baz: ${this.baz}`)
  }
}
const obj2 = { FOO: 'BAR',
  BAZ: 'OOF',
  F () {
    console.log(`this.BAZ: ${this.BAZ}`)
  },
  mutate () {
    this.count = this.count || 0
    this.count++
    return this.count
  }
}

const v = Vroxy.create(obj1)
const proxiedObj = v.proxy

console.log('-----------')
console.log('vroxy:', v)
console.log('-----------')
console.log('[Changing target to obj2]')
v.target(obj2)
console.log('-----------')
console.log('vroxy:', v)
console.log('-----------')
console.log('calling proxiedObj.F():')
proxiedObj.F()
console.log('-----------')
console.log(`proxiedObj.BAZ: ${proxiedObj.BAZ}`)
console.log(`v.target().baz: ${v.target().BAZ}`)
console.log('[Setting handler with get trap that always returns 42]')
v.handler({
  get () {
    return 42
  }
})
console.log(`proxiedObj.BAZ: ${proxiedObj.BAZ}`)
console.log(`v.target().baz: ${v.target().BAZ}`)
console.log(`proxiedObj.asdf: ${proxiedObj.asdf}`)
console.log('-----------')
console.log('[Removing get:42 handler]')
delete v.handler().get
console.log(`proxiedObj.BAZ: ${proxiedObj.BAZ}`)
console.log(`v.target().baz: ${v.target().BAZ}`)
console.log(`proxiedObj.asdf: ${proxiedObj.asdf}`)
console.log('-----------')
console.log('[calling mutating function through proxy]')
console.log(`proxiedObj.mutate(): ${proxiedObj.mutate()}`)
console.log(`proxiedObj.mutate(): ${proxiedObj.mutate()}`)
console.log(`proxiedObj.mutate(): ${proxiedObj.mutate()}`)
console.log(`proxiedObj.mutate(): ${proxiedObj.mutate()}`)
console.log(`proxiedObj.count: ${proxiedObj.count}`)
console.log(`v.target().count: ${v.target().count}`)
console.log('-----------')
console.log('[target back to obj1]')
v.target(obj1)
console.log('v.proxy:', v.proxy)
console.log('v.target():', v.target())
