# Intro

TypeScript adds static type checking to JavaScript. TypeScript's tooling is especially great, as the core type-checker, which has information about what properties are in a type, can provide error messages and code completion as you type.

You can have JavaScript classes that implicitly implement an interface, just by having the right properties.

In addition to JavaScript's primitives, you can use `any` (allow anything), `unknown` (ensure someone using this type declares what the type is), `never` (this type can never happen), and `void` (a function which returns `undefined` or has no return value).

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

# Compiler

After downloading the TypeScript compiler as a dev dependency, we can run `npx tsc hello.ts` to transpile it.

The TypeScript compiler will still transpile TypeScript to JavaScript despite errors so not to get in your way (think about a migration from JavaScript to TypeScript and the mountain of type errors that may ensue). To make the compiler more strict, you can use `tsc --noEmitOnError hello` so it doesn't emit the JavaScript code on errors.

By default, the compiler targets ES5 (old) as output.

There are two big strictness flags that can be turned on in `tsoncfig.json`: 
- `noImplicitAny`, which prevents TypeScript from falling back to the most lenient type `any` for type inference.
- `strictNullChecks`, which makes sure you handle `null` and `undefined`, as they are assignable to any other type by default. Handling such values is a form of narrowing.