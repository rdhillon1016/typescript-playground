// Assuming we're compiling with 'strictFunctionTypes' enabled, why does this pass compilation
interface A {
    check(name: string): string;
}

let a: A = {
    check: (name: "something") => name,
}

// But this fails?
interface B {
    check: (name: string) => string;
}

let b: B = {
    check: (name: "something") => name,
}