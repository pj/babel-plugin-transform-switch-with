var x = switch ({a: "hello", b: "world"}) {
    with {a, b}: a
    with {b}: b
    with {a:c, b}: c
    with {a="hello", b}: a
};
