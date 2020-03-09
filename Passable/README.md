# Overview
Experiment with mixins for any type that allows chaining without terminal operator, at the cost of explicitly using `pass` for each call. Primarily for functional-style operations (input / output, no mutations) but supports binding with `boundCall` and pretty much anything you would want to do in a chain style as long as the function returns the value you're after and it's not a number. For that, go for a full chaining library.

Main drive: Read left-to-right, remove paranthesis- and indentation hell, no explicit chaining setup.

Can be mixed in to any type but will then obviously only work as long as the object is and instance of that type. Intended to extend `Object`. 

## [obj].pass
### Before
```js
//paranthesis hell
let result = func3( func2( func1(obj, "foo"), 11111, 123), "ohno" )

//indentation hell
let result = 
func3(
  func2(
    func1(obj, "foo"),
    11111,
    123
  ),
  "ohno"
)
```

### After
```js
import {_o, extendPassable} from 'Passable'
extendPassable(Object.prototype)


let result = obj.pass(func1, "foo").pass(func2, 11111, 123).pass(func3, "ohno")

```

## [obj].passAt
Allows passing the object at a specific argument position in a _readable_ way.
### Before
```js

//paranthesis hell
let result = func3( func2( 11111, func1(obj, "foo"), 123), "ohno" )

//indentation hell
let result = 
func3(
  func2(
    11111,
    func1(obj, "foo"),
    123
  ),
  "ohno"
)
```

### After
```js
import {_o, extendPassable} from 'Passable'
extendPassable(Object.prototype)


let result = obj.pass(func1, "foo").passAt(func2, [11111, _o, 123]).pass(func3, ["ohno"])

```


# [obj].boundCall
Allows calling a function with arbitrary arguments.

## Before
```js
let result = func2.apply(func1.apply(obj, [args1]), [args2]) //etc
```

## After
```
import {_o, extendPassable} from 'Passable'
extendPassable(Object.prototype)

let result = obj.boundCall(func1, [args1]).boundCall(func2, [args2])
```