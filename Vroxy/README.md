# Vroxy
A mutable, revocable `Proxy`.

## Usage 
```js
let v = Vroxy.create(obj)
console.log(v.proxy) //transparent proxy to obj
v.target(obj2)
console.log(v.proxy) //transparent proxy to obj
```