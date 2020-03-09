Dump for interesting ES concepts

# Complete

## Vroxy
Mutable, revocable proxy. In addition to standard proxy features, handler and target can be changed.

```js
let v = Vroxy.create(obj)
someLibraryObject.setSomething(v.proxy)
v.target(otherObj) //reflected in what someLibraryObject sees
```

## HookedProxy
Want to see how an object is accessed for debug? If something is acting up, wrap an object in this before passing it.

```js
/**
* Create transparent proxy with a default hook that logs trap name
* get, set also logs prop name
*/
let obj = {foo:"bar", baz: "oof"}
let getSetLogger = {
    get(t,prop,caller){ console.log(`get: ${prop} (${t[prop]})`) },
    set(t,prop,value){ console.log(`set: ${prop} = ${value}`) }
}
let h = HookedProxy(obj, getSetLogger, (trap,args) => console.log(`${trap}: ping`))

someFunc(h) //logs all read, modified properties, instanceof checks etc
```

The above functionality is exported as `SensibleDebugLogger(obj)`

## ScopeReader
Lets you console.log an object that gives dynamic access to a certain scope.

```js
import default as ScopeReader from 'ScopeReader'

function deepInThereIwannaHaveALook(){
    let a = "baz"
    console.log(eval(ScopeReader))
}

//Logged object can now read from the scope where the object was created. Not a snapshot, changes will be reflected.
```

# WIPs
## Dora
A proxy that collects the "path" used. Intended to be used with websockets and to share references between js environments. Details being ironed out.
See [dora.md](./dora.js/dora.md)

```js
d = Dora()
d.a.b.c //collected: a.b.c
```