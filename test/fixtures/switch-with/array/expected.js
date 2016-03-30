var _switchVar = [1, 2.0, "3", null];

var _switchResult;

if (_switchVar.constructor === Array && _switchVar.length === 4) {
    var a = _switchVar[0];
    var b = _switchVar[1];
    var c = _switchVar[2];
    var d = _switchVar[3];
    _switchResult = a;
} else if (_switchVar.constructor === Array && _switchVar.length > 1 && _switchVar[0] === 1) {
    var x = _switchVar.slice(1);

    _switchResult = x;
} else if (_switchVar.constructor === Array && _switchVar.length > 2 && _switchVar[0] === 1 && _switchVar[1] === 2.0) {
    var x = _switchVar.slice(2);

    _switchResult = x;
} else if (_switchVar.constructor === Array && _switchVar.length > 2 && _switchVar[1] === 1) {
    var a = _switchVar[0];

    var x = _switchVar.slice(2);

    _switchResult = x;
} else if (_switchVar.constructor === Array && _switchVar.length === 4 && _switchVar[3] === null) {
    _switchResult = "asdf";
}

var x = _switchResult;
