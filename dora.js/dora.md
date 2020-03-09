# dora - DO Remote Action
Dora is VERY incomplete.

Dora is intended to be a way of sharing references between different js environments across websockets. A client could for example subscribe to events server side in a very convenient way. Serious security considerations exist and must be evaluated.

Dora, recursively and without side effects, collects "path.on.dora.object" whenever someone gets a property. This is the main feature but other [traps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Terminology) will likely trigger different behaviours as the project develops. 

## Intended example usage - not currently functional
```js
let d = Dora("ws://server.domain:port")

/**
* Here, dora will sub to new news
*/
d.news.on("new:PieceOfNews", (pon) => {
  console.log(`Breaking: ${pon}`)
})

```

## Triggers
Currently function calls and assignments trigger a log action.

```js
let d = dora()
d.name.set("alice") //{trigger: "apply", path: ["name","set"], args: ["alice"]}
d.hello() //{trigger: "apply", path: ["hello"], args: []}
```

# Ideas
* Variable name patterns (d.$hello triggers remote get of hello) 
* When a promise is returned, it should be possible to either await, or keep chaining
  * Actions after a sent one is buffered and dependent on the first one being successful
  * Buffer locally or send to server? Server needs to know that an action is dependent on another one succeeding
* Dora actions should be defined server-side with a data structure that mirrors actions
* Cycles should not be a problem (d.friends["john"].friends["jane"])
  * Requires some kind of object types
  * Can definitions be downloaded to client?
* Some data can be pushed to client as not to have to fetch everything all the time
  * Requires some thought on how to structure
  * Shadow object could be good. When action triggers, if shadow object has the prop, exec/fetch there.
  * Observables
* Look at d3 selections with selectAll and select, enter and exit
* Special operators:
  * $ - fetch/update
  * .. - go back
    * alt: __
  * . - noop
    * alt: _
  * () call
  * something that switches modes. fetch every step vs fetch on $
  * $$ - observe - returns observable
  * .get() simple as that?
  * .get , .observe , .send - words can be triggers. Risk of conflict with serverside.
* Graph db? Syntax seems like it's made for traversing graphs.
* Extend promise to be able to keep collecting
* Getting a stream returns a stream to client
  * .filter etc, functional stuff
* Server data structures like huge arrays and db's can be exposed by exposing a simple api- For example paging (access huge array as 2d array, chunks). d.query('').redults[0] ... n etc
* Use iteratábles with a hidden block fetch functionality (paging)
* check yield syntax
* garbage collection. reference count on server, send garbage collect msg when 0

# Sketches
```js
await d.$channels //{trigger: "$rule", path: ["$channels"]} -> returns array via ws
d.users.search("dave") //search for user dave

let channels = d.channels
console.log(await channels["#nodejs"]) //logs the channel object once received

await d.login("uname", "pw")
d.name = "Alice"  //{trigger: "set", path: ["name"]}
console.log(await d.$) //see options on what one can do

await d.$.some.leaf.in.a.huge.tree.$ //ability to control when fetch happens to avoid fetching unnecessary data. in this case I want a tree leaf, not the whole tree and I don't want to wait inbetween every single step


let d = Dora("ws://...", {set: {predicate: (prop) => (prop.substring(0,1) == "$"), trigger: function() .....}})

d.login("uname","pw").channels["#nodejs"].join() // should be able to stack actions. some actions might clear the collector, others not. login() clears, channels["#nodejs"] does not. .join() clears itself but not the channel etc

await d.login("uname","pw").channels["#nodejs"].$ //<- fetches actions possible
let deepinstructure = d.d.as.s.ds.dsda
let root = deepinstructure[".."][".."][".."][".."]... //special get .. clears one step in the collector

let almonds = d.almonds
almonds = "hello" //Does not work. Add ['.'] as no-op.
```

//Server-client structure
Client:
Proxy
Assumes undefined value for any path
"Assumes everything exists" on server

//Server:
Client is given access to an object.
Client can set own (local)functions as properties or pass to server side functions (creates an interface where server can call async back to client, "generalized event listenr") on server side object. Server can do the same on client.

WANTS:
Client-server observe
Client-server calls
Client-server set properties (including own functions, callbacks/event listeners)
Enable server to have a shared data structure many clients interact with, safely 
Smart, standard operation like apis (d.name = "hannah")


HOW TO:
* Passing functions across barrier: client sends function reference as a function id. server creates function with proxy that will handler calling back to client.
* Observer - ? standard solution
* Make use of read only recursive proxies to expose protected functions
* Pass user data along everywhere
* Make use of valueOf. When promise returns, set valueOf() - makes vars work in calculation

Serialization:
The core of all this is passing cross-process references. 

obj = { foo : { 1: 2 }}
//client
await d.$ //to client -> {foo: [cross net reference]}
d.bar = () => console.log("hej") //to server -> obj.bar = [cross net reference]

needs a notion of literals. when pass literal, when pass cross reference? only functions as cross? unroll one level? etc...

Idea for style:
const D = Dora()
D.foo.bar._ // returns promise
D.foo.bar() // returns promise
D.foo.bar //cross net reference