// GOAL: Allow messing with execution context, scope, etc

function contextualizedCall (f, context, ...args) {
  // allow a function to be bound to an entire context {lala:1 ......, this: something} instead of just 'this'
  // will be slow due to eval() but should be powerful
  // possibly all variables can be obtained from code and set in parent scope once, then modified using setters?
  // if we could mess with scopes we could go deeper and allow setting the scope chain (doing something like object.onion even but for scope) - this context changing is essentially injecting another scope at the top of the scope chain

  for (let key in context) {
    eval(`var ${key} = context.${key}`) // Sets context as standard scope variables.
  }
  // Sets context as standard scope variables.
  // Worst case use recursion to avoid block scope shit
  // Needs defineproperty n shit to be exact probably. const/let/var etc.

  eval(`var ______f = ${f.toString()}`)
  return ______f(...args)
}
function produceContextualized (f) {
  // f = f.bind({})? clone operation
  f.___contextHack___ = {}
  /* f.setContext(context) {
    this.___contextHack___ =
  } */
  return new Proxy(f, {
    apply (target, thisArg, args) {
      return contextualizedCall(target, target.___contextHack___, ...args)
    }
  })
}

function efficientContextedFunction (func, context) {
  return (function () {
    for (let key in context) {
      eval(`var ${key} = context.${key}`) // Sets context as standard scope variables.
    }
    return eval(func)
  })()
}

/*
TODO
Add "run in this scope" functionality - will likely look like func.evaluateHere(arguments)
-returns eval, hijacks -depends on Object.hijack- argument reference by proxy (or just toString?), once, then reverts it to old state? Also depends on one argument at least
-or use get() intercept somehow (return eval), does it preceede apply()? Then, in apply, modify arguments..
-or returns eval with toString being some kind of apply() thing
-or eval(func.toString())
-or func.evaluateHere(arguments)()
-or func.evaluateHere({})
-or func.inThisContext()
-eval is tricky to get to in another scope - likely blocked but investigate
-"eval breaks lexical scoping" - google - there was some bug
-overwrite eval.arguments somehow?

+++Function is similar to eval.. consider that. can it be bound etc? <- only global scope :(

Babel plugin for access to scope chain.
-For each function, add an evaler inside it that can get/set. Access using f.__scope__. f.__scope__.eval() works
-For each call, add prepending argument that that shows caller, OR for each call, set caller prop on callee function [array that pops on return if need be for recursion support]
-Callee can the access parent scope by something like arguments.callee.caller
Goals for babel plugin:
-func.$scope
-func.$scope.eval() <- should run func, eval and do nothing else (execute no code the function carries)
-func.$scope = ... (move function)
-func.toLocal() - evals locally
-allow child scopes to stay unaffected if needed (rebind scope for f but f2 created in f sees old scope)
-allow "yanking" a function (children assigned to grandparent, parent's grandchildren now children)
-allow full control over how scopes overlap and cascade. merge two scopes for a func? done
-100% dynamic
-include block scopes or not.
Method:
-strip all "naked" variable references
-create scope at top of every function (proto is parent scope)
--may be more efficient to only handle special cases though

BABEL plugin goals:
* All name resolution goes through an object which can thus be modified, proxied, etc (const needs to be handled using defineProp)
** Block scoped variables?
** Main problem to be solved - it interferes with many things such as destructing etc.
* Scope chain as obj ([[Scopes]] in chrome)
* Global access to scope tree
* Global access to AST
* Access to [[FunctionLocation]] as in chrome (got returned function, where in the ast/code was it created? -> allows modifying the source of a function that was returned, so that next time another func is returned)
* Allow changing scope for a function
* Lexical/dynamic scope setting inline
Eg:
DynamicScope {
  functionA() //executes function a as if it was created here. Equivalent to functionA.setScope(thisScope);functionA();functionA.setOriginalScope()
}
* All functions have access to "themselves", their parent etc through context/scope chain
* Runtime AST modification library
* Pointers
** Transparent: Acts like the object it points to but can be repointed. Basically Vroxy with no handlers and the setTarget attached to the object.
** Explicit: Has to be accessed using special operator (p@pointer -> returns the pointed to value)
** Basically needed to allow runtime modification of a function AST
** Basically Object.hijack. Allows one to repoint an object, so that every other reference to that object is repointed.
** Allows snapshotting Objects. b = obj.snapshot() -> obj is repointed to a fresh object that inherits from obj, same with b.
** Creates problems with object equality
* Object creation location (same as for functions, useful in going to the source to modify AST)
* Operator overloading, operator creation etc.
** Same reservations as before, overload in this scope, global scope, etc
* [[ExecutionLocation]] -> points to AST position of "this line"
-> All this will support mixing code from different projects for "genetic js programs" that borrow code from all over to use.
-> Need powerful AST modification library. Babel probably has this. Also need pattern matching/searching AST with indices and shit.
-> Runtime/Static interactions need investigating. If modify one AST of a func returned from some place, maybe I want to modify all functions with the same source.
Scopifying, simple using eval (no reassign scopes/"moving functions"):
function test() {
  let hej11 = 11
  function hej(){
   //<SCOPIFY>
   const $scope = arguments.callee.$scope
   if(arguments[0] === Symbol.for('$scope_get')){
    return eval(arguments[1])
   }else if(arguments[0] === Symbol.for('$scope_set')){
    return eval(`${arguments[1]} = arguments[2]`)
   }else if(arguments[0] === Symbol.for('$scope_eval')){
    return eval(arguments[1])
   }
   //</SCOPIFY>
  }
  attach$Scope(hej)
  return hej
}
//<SCOPIFY>
function attach$Scope(func) {
  func.$scope = new Proxy({}, {
    get(t,prop,caller){
      switch(prop){
        case "$parent":
          return $scope || window
        case "$eval":
          return (evalStr) => func(Symbol.for('$scope_eval'), evalStr)
        case "$pointer":
          return (variableName) => func.$scope[variableName]
        default:
          return func(Symbol.for('$scope_get'), prop)
      }
    },
    set(t,prop,value,caller){
      return func(Symbol.for('$scope_set'), prop, value)
    },
    //hasownproperty -> check parent
    //defineProperty ......
  })
}
test()
//hej.$scope.parent = $scope || window //if no parent scope we're in window
//$scope.children.add(hej.$scope)
//</SCOPIFY>

*/
