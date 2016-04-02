"use strict";

var _switchVar = { a: "hello", b: "world" };

var _switchResult;

if (_switchVar !== null && _switchVar !== undefined && _switchVar.hasOwnProperty("a") && _switchVar.hasOwnProperty("b")) {
    var a = _switchVar.a;
    var b = _switchVar.b;
    _switchResult = a;
} else if (_switchVar !== null && _switchVar !== undefined && _switchVar.hasOwnProperty("b")) {
    var b = _switchVar.b;
    _switchResult = b;
} else if (_switchVar !== null && _switchVar !== undefined && _switchVar.hasOwnProperty("a") && _switchVar.hasOwnProperty("b")) {
    var c = _switchVar.a;
    var b = _switchVar.b;
    _switchResult = c;
} else if (_switchVar !== null && _switchVar !== undefined && _switchVar.hasOwnProperty("a") && _switchVar.a === "hello" && _switchVar.hasOwnProperty("b")) {
    var a = _switchVar.a;
    var b = _switchVar.b;
    _switchResult = a;
}

var x = _switchResult;
