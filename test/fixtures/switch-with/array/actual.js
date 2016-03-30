var x = switch ([1,2.0,"3",null]) {
    with [a,b,c,d]: a
    with [1, ...x]: x
    with [1, 2.0, ...x]: x
    with [a, 1, ...x]: x
    with [, , , null]: "asdf"
};
