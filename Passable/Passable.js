// NOTE: Does not work on Object.create(null) for 
obvious reasons
const PrototypeExtension = {}
const _o = Symbol.for('_o')
PrototypeExtension.pass = function (func, args = []) { // 1. Consider the name passedTo(). Very descriptive, and less likely than pass to be taken. 2. consider supporting both call and apply style syntax (with/without brackes)
  return func(this, ...args)
}
PrototypeExtension.passAt = function (func, args = []) { // Consider removing. pass(obj => func2(lala,obj,22,...)) is as good. There is no mapAt() for arrays. removes the need for the special symbol, which is very good as its not a very elegant solution
  args = args.map((arg) => arg === _o ? this : arg)
  return func(...args)
}
PrototypeExtension.boundCall = function (func, args = []) { // consider name
  return func.bind(this)(...args)
}
const extendPassable = function (obj) {
  Object.assign(obj, PrototypeExtension)
}
export { extendPassable, PrototypeExtension as PassableExtension, _o }
