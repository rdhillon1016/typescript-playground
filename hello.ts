interface Point = number | string;

function printName(obj: { first: string; last?: { a, b } }) {
    console.log(obj.last.a);
}