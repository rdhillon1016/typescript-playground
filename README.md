- [Intro](#intro)
- [Everyday Types](#everyday-types)
- [Narrowing](#narrowing)
- [Functions](#functions)
- [Object Types](#object-types)
- [Type Manipulation](#type-manipulation)
- [Compiler](#compiler)


# Intro

TypeScript adds static type checking to JavaScript. TypeScript's tooling is especially great, as the core type-checker, which has information about what properties are in a type, can provide error messages and code completion as you type.

You can have JavaScript classes that implicitly implement an interface, just by having the right properties.

In addition to JavaScript's primitives, you can use `any` (allow anything), `unknown` (similar to the `any` type, but is safer because it’s not legal to do anything with an `unknown` value), `never` (this type can never happen), and `void` (a function which returns `undefined` or has no return value).

You’ll see that there are two syntaxes for building types: Interfaces and Types. You should prefer interface. Use type when you need specific features.

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

TypeScript has a structural type system, so when comparing two types, e.g. to see if a `Producer<Cat>` can be used where a `Producer<Animal>` is expected, the usual algorithm would be structurally expand both of those definitions, and compare their structures. However, variance allows for an extremely useful optimization: if `Producer<T>` is covariant on `T`, then we can simply check `Cat` and `Animal` instead, as we know they’ll have the same relationship as `Producer<Cat>` and `Producer<Animal>`. TypeScript automatically infers the variance of every generic type. However, it may be useful to note that TypeScript has **variance annotations** (to enforce covariance, contravariance, or invariance) that should be used in extremely rare cases. For more info on the concept of variance, see [this great video](https://www.youtube.com/watch?v=zmvznP1lv3E). 

# Compiler

After downloading the TypeScript compiler as a dev dependency, we can run `npx tsc hello.ts` to transpile it.

The TypeScript compiler will still transpile TypeScript to JavaScript despite errors so not to get in your way (think about a migration from JavaScript to TypeScript and the mountain of type errors that may ensue). To make the compiler more strict, you can use `tsc --noEmitOnError hello` so it doesn't emit the JavaScript code on errors.

By default, the compiler targets ES5 (old) as output.

There are two big strictness flags that can be turned on in `tsoncfig.json`: 
- `noImplicitAny`, which prevents TypeScript from falling back to the most lenient type `any` for type inference.
- `strictNullChecks`, which makes sure you handle `null` and `undefined`, as they are assignable to any other type by default. Handling such values is a form of narrowing.