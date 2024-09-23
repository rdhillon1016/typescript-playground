- [Intro](#intro)
- [Everyday Types](#everyday-types)
- [Narrowing](#narrowing)
- [Functions](#functions)
- [Object Types](#object-types)
- [Type Manipulation](#type-manipulation)
  - [Variance](#variance)
- [Classes](#classes)
- [Modules](#modules)
- [Compiler](#compiler)
- [Theory](#theory)


# Intro

TypeScript adds static type checking to JavaScript. TypeScript's tooling is especially great, as the core type-checker, which has information about what properties are in a type, can provide error messages and code completion as you type.

You can have JavaScript classes that implicitly implement an interface, just by having the right properties.

In addition to JavaScript's primitives, you can use `any` (allow anything), `unknown` (similar to the `any` type, but is safer because it’s not legal to do anything with an `unknown` value), `never` (this type can never happen), and `void` (a function which returns `undefined` or has no return value).

You’ll see that there are two syntaxes for building types: Interfaces and Types. You should prefer interface. Use type when you need specific features. You cannot provide default values for interfaces or type aliases as they are compile time only and default values need runtime support

# Everyday Types

For specifying array types, use the syntax `Type[]`. You can also use `Array<SomeType>`.

You can do anything with a variable of type `any`. No restrictions on what properties you can try to access, etc...

TypeScript has type inference by default if you don't explicitly declare a type. Here, it will infer a type with the properties `name: string` and `id: number`.
```ts
const user = {
  name: "Hayes",
  id: 0,
};
```

Note how type annotations go to the right of the variable/property name.

```ts
function doSomething(word: string): Promise<number> {
    // ...
}
```

**Contextual typing** occurs when the context in which a variable is being used determines the type it should have. E.g:

```ts
const names = ["Alice", "Bob", "Eve"];
 
// Contextual typing for function - parameter s inferred to have type string
names.forEach(function (s) {
  console.log(s.toUpperCase());
});
```

You can have optional properties in type annotations that are objects:
```ts
function printName(obj: { first: string; last?: string }) {
  // ...
}
```
But you have to make sure you check whether its undefined before doing an operation that assumes it to be a non-undefined value (like accessing a property on it), or the compiler will throw an error.

**Union types** allow you to form types out of two or more other types, like `let someType: number | string;`. TypeScript only allows operations that are valid for every member of the union. The only way to do this is to **narrow** the union:
```ts
function printId(id: number | string) {
  if (typeof id === "string") {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else {
    // Here, id is of type 'number'
    console.log(id);
  }
}
```

A **type alias** is a name for any type, like `type Point = number | string;` or:
```ts
type Point = {
    x: number;
    y: number;
};
```
Aliased types are treated as equivalent to the aliasing type.

An **interface** is another way to name an object type, like
```ts
interface Point {
    x: number;
    y: number;
}
```
An object doesn't have to explicitly declare that it implements an interface, as TypeScript is a **structurally typed** system. If the object has the expected properties, it is compatible with that type. Contrast this with Java, where two different classes can have the exact same members as each other, but are not considered type compatible. This is called **nominal typing**.

You may notice that structural typing is similar to **duck typing**. The difference is that structural typing is a static typing system that determines type compatibility and equivalence by a type's structure, whereas duck typing is dynamic and determines type compatibility by only htat part of a type's structure that is accessed during runtime.

The key difference between type aliases and interfaces in the context of object types is that you can add new properties to existing interfaces. There are a few other minor differneces.

Use interface until you need to use features from type (e.g. renaming primitives).

If you have more specific information about the type of a value that TypeScript can't know about, you can use **type assertions**. See this example, where TypeScript otherwise only knows that the return value is some kind of HTMLElement:
```ts
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```
TypeScript disallows "impossible" type assertions. Sometimes this disallows more complex coercions that might be valid, in which case you would first assert to `any` and then to your desired type.

We can refer to specific strings and numbers in type positions, like `type Direction = "north" | "west" | "east" | "south";`

Literal inference works on primitives assigned to constant variables.
```ts
const something = "what";
```
TypeScript can be sure that some the type of `something` is the string literal `"what"`, since it can't be changed.

Literal inference does not however work on objects assigned to constant variables, since the values of the properties of that object may change.
```ts
const something = { word: "what" };
```
Since `word` can change, TypeScript can only infer that it is some `string`, rather than literally `"what"`. There are a few ways to enforce it to be typed as a literal:
- Add a type assertion to the property to prevent it from being changeable in the future.
  ```ts
  const something = { word: "what" as "what" };
  ```
- Add a type assertion on usage of the property.
  ```ts
  someFunction(something.word as "what");
  ```
- Add `as const` to convert the entire object to be type literals.
  ```ts
  const something = { word: "what" } as const;
  ```

Writing `!` after any expression is effectively a type assertion that the value isn’t null or undefined.

**Enums** exist.

# Narrowing

TypeScript recognizes type guards like `typeof someVariable === "number"` and uses that to **narrow** (gaining information that a type is more specific than what is declared) the type. For example:
```ts
function something(someVariable: number | string) {
  if (typeof someVariable === "number") {
    // TypeScript knows that someVariable must be a number, and
    // thus won't throw errors when doing numeric operations on someVariable
  }
}
```

**Truthiness narrowing** happens when TypeScript gains information about the type of a variable based on whether it is truthy. For example. For example, by checking if a variable is truthy, you can be sure that it is non-null, non-undefined, not equal to 0, etc...

**Equality narrowing** happens when TypeScript gains info about the type of a variable based on whether it is equal or not to another variable/type/literal. This type of narrowing happens for both strict (triple equals) and loose (double equals) equality.

**`in` operator narrowing** happens when you use the `in` operator to determine if an object or its prototype chain has a property with the specified name.

In JavaScript `x instanceof Foo` checks whether the prototype chain of `x` contains `Foo.prototype`.  TypeScript uses this as a type guard for narrowing.

Variable assignability is always checked against the **declared type**. For example, if a variable has declared type `string | number`, assigning it to a number doesn't mean the type changes to `number` only.

More generally, TypeScript analyzes and narrows types based on code reachability in what is called **control flow analysis**.

So far, we've used existing JavaScript constructs to handle narrowing. If you want more direct control over how types change throughout your code, you can use a user-defined type guard. Simply define a function whose return type is a **type predicate**. A predicate takes the form `parameterName is Type`. For example:
```ts
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```
If the function returns true, we can be sure that the pet is a Fish.

Types can also be narrowed using assertion functions.

When every type in a union contains a common property with literal types, TypeScript considers that to be a **discriminated union**, and can narrow out the members of the union based on the value of that common property.

When narrowing, you can reduce the options of a union to a point where you have removed all possibilities and have nothing left. In those cases, TypeScript will use a `never` type to represent a state which shouldn’t exist.

# Functions

You can assign **function type expressions** to variables:
```ts
function greeter(fn: (a: string) => void) {
  fn("Hello, World");
}
```

Since functions are objects in JavaScript, it can have properties. Function type expression syntax doesn't allow for declaring properties. To declare properties on functions, we can write a **call signature** in an object type:
```ts
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
```

To indicate that a function is a constructor, you can use a **construct signature**:
```ts
type SomeConstructor = {
  new (s: string): SomeObject;
};
```

Some objects, like JavaScript’s `Date` object, can be called with or without `new`. You can combine call and construct signatures in the same type arbitrarily.

**Generics** are used when we want to describe a correspondence between two values. We do this by declaring a type parameter in the function signature:
```ts
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
```

We can use a **constraint** to limit the kinds of types that a type parameter can accept:
```ts
function longest<Type extends { length: number }>(a: Type, b: Type) {
  // ...
}
```

You can have optional parameters in functions, like
```ts
function f(x?: number) {
  // ...
}
```
Here the type of `x` is `number | undefined`. You can provide a parameter default as well, like `function f(x: number | string = 10) {}`.

In JavaScript, if you call a function with more arguments than there are parameters, the extra arguments are simply ignored. TypeScript behaves the same way.

You can overload functions by using **overload signatures**, like so:
```ts
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
```

Note that the function signature for the implementation (i.e the **implementation signature**) may lead you to believe that you can call the function with two arguments, but this is actually not allowed. TypeScript will throw an error if you try to call `makeDate(5, 5)`.

TypeScript can only resolve a function call to a single overload. For example:
```ts
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}
len(Math.random() > 0.5 ? "hello" : [0]);
```
will fail, as the type of the argument must be either `string` or `any[]`, not both (`"hello" | number[]`) like it is in the call. For this reason, always prefer parameters with union types instead of overloads when possible.

TypeScript lets you declare the type for `this` in the function body, like `let filter: (this: User) => boolean;`. Note that arrow functions don't have their own bindings for `this` (it will be the global object), so you need to use `function` for the implementation of the function signature.

You can use **rest parameters** for functions that take an unbounded number of arguments.
```ts
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}
```
The type annotation must be an array or a tuple type.

Note that in general, TypeScript does not assume that arrays are immutable (TypeScript assumes they can be of arbitrary length). To enforce immutability, you can use a `const` context:
```ts
// Inferred as 2-length tuple
const args = [8, 5] as const;
```

You can use destructuring syntax with type annotations:
```ts
function sum({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
```

Contextual typing with a return type of `void` does not force functions to not return something. Another way to say this is a contextual function type with a `void` return type (`type voidFunc = () => void`), when implemented, can return any other value, but it will be ignored. All of the following implementations are valid:
```ts
type voidFunc = () => void;
 
const f1: voidFunc = () => {
  return true;
};
 
const f2: voidFunc = () => true;
 
const f3: voidFunc = function () {
  return true;
};
```

There is one other special case to be aware of, when a literal function definition has a void return type, that function must not return anything:
```ts
function f2(): void {
  // @ts-expect-error
  return true;
}
```

Let's say you have two functions. To determine whether they are type-compatible with each other (and thus assignable to each other), you must look at the parameters and return values. When comparing the types of function parameters, assignment succeeds if either the source parameter is assignable to the target parameter, or vice versa. This is called **function parameter bivariance** (see [Variance](#variance) -- we can think of a function as being a type that is generic on its parameters and return value). This is unsound because a caller might end up being given a function that takes a more specialized type, but invokes the function with a less specialized type. In practice, this sort of error is rare, and allowing this enables many common JavaScript patterns. A brief example:
```ts
enum EventType {
  Mouse,
  Keyboard,
}
interface Event {
  timestamp: number;
}
interface MyMouseEvent extends Event {
  x: number;
  y: number;
}
interface MyKeyEvent extends Event {
  keyCode: number;
}
function listenEvent(eventType: EventType, handler: (n: Event) => void) {
  /* ... */
}
// Unsound, but useful and common
listenEvent(EventType.Mouse, (e: MyMouseEvent) => console.log(e.x + "," + e.y));
// Undesirable alternatives in presence of soundness
listenEvent(EventType.Mouse, (e: Event) =>
  console.log((e as MyMouseEvent).x + "," + (e as MyMouseEvent).y)
);
listenEvent(EventType.Mouse, ((e: MyMouseEvent) =>
  console.log(e.x + "," + e.y)) as (e: Event) => void);
// Still disallowed (clear error). Type safety enforced for wholly incompatible types
listenEvent(EventType.Mouse, (e: number) => console.log(e));
```

You can have TypeScript raise errors when this happens via the compiler flag `strictFunctionTypes`. This flag will enforce function parameter contravariance. Function return values, on the other hand, are covariant. 

However, the `strictFunctionTypes` flag does not apply to functions declared in **method syntax** (for [historical reasons](https://www.typescriptlang.org/tsconfig/#strictFunctionTypes)). A method (in the stricter JavaScript sense -- not the general object oriented programming sense of a function defined on an object) is a function that was defined through the concise method syntax in an object literal or as a class method in a class declaration / expression. Additionally, "methods" come with [some specificities](https://stackoverflow.com/a/54961371). Here are some examples of the syntax:
```ts
// In object literals:
const obj = {
    method() {}
};
// In class declarations:
class MyClass {
    method() {}
}
```

For example, the following code, even though the object literal's `check` function parameters are stricter than the interface's `check` parameters and thus it shouldn't be assignable to a variable of type `A`, will pass the compile step even with `strictFunctionTypes` enabled since the function in `A` is defined using method syntax:
```ts
interface A {
    check(name: string): string;
}

let a: A = {
    check: (name: "something") => name,
}
```
But this code will fail to compile:
```ts
interface B {
    check: (name: string) => string;
}

let b: B = {
    check: (name: "something") => name,
}
```

For more on type compatibility, [see this documentation](https://www.typescriptlang.org/docs/handbook/type-compatibility.html).

# Object Types

Properties can be marked `readonly` (can't be re-assigned).
```ts
interface SomeType {
  readonly prop: string;
}
```

TypeScript doesn’t factor in whether properties on two types are readonly when checking whether those types are compatible, so *`readonly` properties can also change via aliasing*. That is, you can assign a read only variable to a writable variable and then write to it.

Sometimes you don’t know all the names of a type’s properties ahead of time, but you do know the shape of the values.

In those cases you can use an **index signature** to describe the types of possible values, for example:
```ts
interface StringArray {
  [index: number]: string;
}
```
This reads: "when a StringArray is indexed with a `number`, it will return a `string`.

You can make index signatures `readonly`.

Object literals get special treatment and undergo **excess property checking** when assigning them to other variables, or passing them as arguments. If an object literal has any properties that the “target type” doesn’t have, you’ll get an error. To get around this restriction, you can use a type assertion. Another way it to use a string index signature in the target type definition if you're sure that the object can have some extra properties. A third way is to assign the object to another variable first. This workaround only works if you have a common property between the object and the target type. All three ways are shown below:
```ts
interface SquareConfig {
  color?: string;
  width?: number;
}
 
function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}

// Throws error, as "colour" doesn't exist in target type
let mySquare = createSquare({ colour: "red", width: 100 });

// Workaround 1
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);

// Workaround 2
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: any;
}

// Workaround 3
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
// However, the following will fail as there is no common property
let squareOptions = { colour: "red" };
let mySquare = createSquare(squareOptions);
```

Interfaces can extend other interfaces.

TypeScript provides another construct called intersection types that is mainly used to combine existing object types using the `&` operator, like `type ColorfulCircle = Colorful & Circle;`. Note that the resultant includes all properties of both types -- not just properties common to both (the term "intersection" in this context refers to the intersection of the sets of valid objects for both objects, including excess properties).

This gives us two ways to combine two interfaces -- by extending both of them, or by using an intersection type. The difference here is in the "extending" case, TypeScript will attempt to merge the two interfaces, unless there is a common property amongst them but with incompatible types, in which case it'll throw an error. If this same scenario exists in the intersection type case, TypeScript will not throw an error, but the common property on instances of that intersection type will be `never` possible.

We can make a generic Box type which declares a type parameter:
```ts
interface Box<Type> {
  contents: Type;
}
```
You might read this as "A `Box` of `Type` is something whose contents have type `Type`". Type aliases can only be generic.

This allows us to avoid the following boilerplate:
```ts
interface NumberBox {
  contents: number;
}
 
interface StringBox {
  contents: string;
}
 
interface BooleanBox {
  contents: boolean;
}
```

`ReadonlyArray<Type>` exists, and its shorthand is `readonly Type[]`. Unlike the `readonly` property modifier, assignability isn't bidirectional between regular `Array`s and `ReadonlyArray`s.
```ts
let x: readonly string[] = [];
let y: string[] = [];
 
x = y;
// The following will throw an array, as the type 'readonly string[]' cannot
// be assigned to the mutable type 'string[]'
y = x;
```

A `tuple` type is another sort of Array type that knows exactly how many elements it contains, and exactly which types it contains at specific positions. Optional tuple elements can only come at the end, and the type of `length` thus becomes a union. 

Tuples can also have rest (`...Type[]`) elements, placed wherever. Tuples types can be used in rest parameters and arguments.

Array literals with const assertions will be inferred with readonly tuple types:
```ts
let point = [3, 4] as const;
```

# Type Manipulation

You can have generic classes.

You can have **generic parameter defaults**:
```ts
declare function create<T extends HTMLElement = HTMLDivElement, U extends HTMLElement[] = T[]>(
  element?: T,
  children?: U
): Container<T, U>;
```

The `keyof` operator produces a string or numeric literal union of an object type's keys. `type P = keyof { x: number; y: number };` is the same as `type P = "x" | "y"`.

TypeScript already has a `typeof` operator, but TypeScript has one that you can use in a type context, like `let n: typeof s;`.

There is a built-in type called `ReturnType`. If we try to use `ReturnType` on a function name, we will see a compile-time error:
```ts
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<f>;
// ERROR: 'f' refers to a value, but is being used as a type here. Did you mean 'typeof f'?
```

Remember that *values and types aren't the same thing*. Instead, use `typeof` to get the type:
```ts
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>;
```

Specifically, it’s only legal to use typeof on identifiers (i.e. variable names) or their properties. This helps avoid the confusing trap of writing code you think is executing, but isn’t:
```ts
// Meant to use = ReturnType<typeof msgbox>
let shouldContinue: typeof msgbox("Are you sure you want to continue?");
// ERROR: ',' expected.
```

We can use an indexed access type to look up a specific property on another type:
```ts
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"];
```
You can do unions, use `keyof`, or other types in this index.

You can index with "number" in conjunction with `typeof` to get the type of an array's elements:
```ts
const MyArray = [
  { name: "Alice", age: 15 },
];
 
type Person = typeof MyArray[number];
```

You can have conditional types:
```ts
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;
```

Here, we use the `infer` keyword to declaratively introduce a new generic type variable named `Item` instead of specifying how to retrieve the element type of `Type` within the true branch. This frees us from having to think about how to dig through and probing apart the structure of the types we’re interested in:
```ts
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
// vs
type Flatten<T> = T extends any[] ? T[number] : T;
type Str = Flatten<string[]>; // type Str = string
```

When conditional types act on a generic type, they become **distributive** when given a union type. That is, the coonditional type is applied individually to each member and creates a union of the results.

A **mapped type** is a generic type which uses a union of PropertyKeys (frequently created via a keyof) to iterate through keys to create a type:
```ts
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
```
You can add (`+`) or remove (`-`) `readonly` and `?` (optionality) modifiers for mapped types.
```ts
// Removes 'readonly' attributes from a type's properties
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};
```

You can have template literal types:
```ts
type World = "world";
type Greeting = `hello ${World}`;
```

To help with string manipulation, TypeScript includes a set of types which can be used in string manipulation, like `Uppercase<StringType>`. These types come built-in to the compiler for performance and can’t be found in the `.d.ts` files included with TypeScript.

## Variance

**Covariance** and **contravariance** are type theory terms that describe what the relationship between two generic types is. The main concepts of covariance and contravariance can be displayed in the following examples. Assume `Cat` is a subtype of `Animal`. First:
```ts
interface Producer<T> {
  make(): T;
}
```
In this case, we would say the generic type `Producer<T>` is covariant, since you can use `Producer<Cat>` whereever a `Producer<Animal>` is required (i.e the relationship is the same as the relationship between a `Cat` and an `Animal`). Why can we do this? Well, you have to look at the structure of the interface. We have the function `make`, which simply states that it must be a function that outputs something of type `T`. A `Producer<Animal>` must have a function `make()` that outputs an `Animal`. We can see that a `Producer<Cat>` also satisfies this requirement! A `Producer<Cat>` has a function `make()` that outputs an `Animal` (more specifically, a `Cat`), so it can be used as a valid substitute.

Now, take a look at a second example:
```ts
interface Consumer<T> {
  consume: (arg: T) => void;
}
```
Looking at the structure of the interface, we see that the sole function `consume` *takes in a parameter this time*. If I require a `Consumer<Animal>` (say, as a function argument), then, by extension, I require a function `consume` that should be able to take in any `Animal` I pass to it. This is why you can't use `Consumer<Cat>` as a substitute, as its `consume` function can only take in a `Cat`, rather than any `Animal`. Thus, this interface is not covariant. However, let's say we had a superclass of `Animal` called `LivingThing`. We would be able to subtitute `Consumer<LivingThing>` for `Consumer<Animal>`, because `Consumer<LivingThing>` has a function `consume` that can accept any `Animal` (and further, any `LivingThing`). 

TypeScript has a structural type system, so when comparing two types, e.g. to see if a `Producer<Cat>` can be used where a `Producer<Animal>` is expected, the usual algorithm would be structurally expand both of those definitions, and compare their structures. However, variance allows for an extremely useful optimization: if `Producer<T>` is covariant on `T`, then we can simply check `Cat` and `Animal` instead, as we know they’ll have the same relationship as `Producer<Cat>` and `Producer<Animal>`. TypeScript *automatically infers the variance of every generic type*. However, it may be useful to note that TypeScript has [variance annotations](https://www.typescriptlang.org/docs/handbook/2/generics.html#variance-annotations) (to enforce covariance, contravariance, or invariance) that should be used in extremely rare cases. For more info on the concept of variance, see [this great video](https://www.youtube.com/watch?v=zmvznP1lv3E).

# Classes

Properties in classes can have types. Prefixing with a `readonly` modifier prevents assignments to fields outside of the constructor.

Just as in JavaScript, if you have a base class, you’ll need to call `super()`. TypeScript will catch this common error.

TypeScript has some special inference rules for accessors:
- If `get` exists but no `set`, the property is automatically `readonly`
- If the type of the setter parameter is not specified, it is inferred from the return type of the getter

Classes can implement TypeScript interfaces using `implements`. It’s important to understand that an `implements` clause is only a check that the class can be treated as the interface type. It doesn’t change the type of the class or its methods at all.

TypeScript has its own `public` (default), `private` and `protected` keywords (not the native JavaScript private prefix `#`). `private` and `protected` are only enforced during type checking, and thus JavaScript runtime constructs like `in` can still access a `private` or `protected` member.

`private` also allows access using bracket notation during type checking. This makes `private`-declared fields potentially easier to access for things like unit tests, with the drawback that these fields are soft private and don’t strictly enforce privacy.

Static members can also use the same visibility modifiers.

It’s generally not safe/possible to overwrite properties from the `Function` prototype. Because classes are themselves functions that can be invoked with `new`, certain static names can’t be used. Function properties like `name`, `length`, and `call` aren’t valid to define as static members.

Classes, much like interfaces, can be generic.

We can statically type the implicit `this` parameter in JavaScript methods/functions.

Addtionally, in classes, a special TypeScript type called `this` refers dynamically to the type of the current class.

You can use `this is Type` in the return position for methods in classes and interfaces. When mixed with a type narrowing (e.g. `if` statements) the type of the target object would be narrowed to the specified `Type`:
```ts
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
}
```
This reads: "if the function `isFile()` returns `true`, then `this` is a `FileRep`". This is useful for narrowing:
```ts
if (fso.isFile()) {
  fso.content; // TypeScript now knows fso is a FileRep
}
```

TypeScript offers special syntax for turning a constructor parameter into a class property with the same name and value. These are called **parameter properties** and are created by prefixing a constructor argument with one of the visibility modifiers `public`, `private`, `protected`, or `readonly`.
```ts
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // No body necessary
  }
}
```

Class expressions exist and can be assigned to variables.

The TypeScript `InstanceType` helper type exists because a class name can represent two things:
- Class name as the constructor function at runtime: `typeof MyClass`.
- Class name as the return type of the constructor function, at compile time. (including the `prototype` of the constructor function and optionally some instance fields): `MyClass` (a kind of interface which contains fields/methods).

`InstanceType` is used in cases like when you pass a class itself (i.e the constructor function) in as a parameter to a generic function, and the function needs to extract the instance type from that dynamically passed-in class ([source](https://stackoverflow.com/a/70368495)).

`abstract` classes, methods, and fields exist in TypeScript. They can't be instantiated.

# Modules

TypeScript has extended the `import` syntax with two concepts for declaring an import fo a type:
- `import type` which is an import statement that can only import types
- Inline type imports:
  ```ts
  import { createCatName, type Cat, type Dog } from "./animal.js";
  ```

# Compiler

After downloading the TypeScript compiler as a dev dependency, we can run `npx tsc hello.ts` to transpile it.

The TypeScript compiler will still transpile TypeScript to JavaScript despite errors so not to get in your way (think about a migration from JavaScript to TypeScript and the mountain of type errors that may ensue). To make the compiler more strict, you can use `tsc --noEmitOnError hello` so it doesn't emit the JavaScript code on errors.

By default, the compiler targets ES5 (old) as output.

There are two big strictness flags that can be turned on in `tsoncfig.json`: 
- `noImplicitAny`, which prevents TypeScript from falling back to the most lenient type `any` for type inference.
- `strictNullChecks`, which makes sure you handle `null` and `undefined`, as they are assignable to any other type by default. Handling such values is a form of narrowing.

# Theory

One question you may have is: Why explicitly declare types at all, if TypeScript has static inference?
- TypeScript's inference has limitations, and may choose a more general type than expected, like `any`. For example, function argument types are often not inferred from their usage inside the function, like:
  ```ts
  function hello(r) {
    return r.what;
  }
  ```
  Here, `r` is inferred as `any`, when it could be more specifically an object with a `what` property.
- Explicit types provide a clear contract for users and other developers in a shared repository. For example, if you explicitly set a function return type, you can be sure that changes to the body that accidentally change the return type will be immediately caught, localized to the function. Contrast that with an inferred return type -- you can change the body and the return type will change automatically through inference, and may propogate to cause issues elsewhere in the code or even change the contract of an API you're exposing.
- It turns out full, complete type inference is [really hard](https://qr.ae/p24ig2), and requires the language to be designed in a particular way. This is a good [talk](https://www.youtube.com/watch?v=BMT6MZ5zuvw&t=1s). For more info if interested, learn about Hindley-Milner type inference and the lambda calculus.