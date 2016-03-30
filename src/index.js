const SwitchWithVisitor = {
    SwitchWith(path) {
        let types = this.switchState.types;
        let file = this.switchState.file;
        let {node} = path;
        if (this.switchState.previousIf === null) {
            // Case where default is the only case - just assign to consequent
            if (node.test === null) {
                this.switchState.rootIf = node.consequent;
            } else {
                this.switchState.previousIf = createIf(path, node,
                        this.switchState.testName, this.switchState.resultName);
                this.switchState.rootIf = this.switchState.previousIf;
            }
        } else {
            if (node.test === null) {
                let consequent = createConsequent(node, this.switchState.resultName);
                this.switchState.previousIf.alternate = types.blockStatement(consequent);
            } else {
                this.switchState.previousIf.alternate = createIf(path, node,
                        this.switchState.testName, this.switchState.resultName);
                this.switchState.previousIf = this.switchState.previousIf.alternate;
            }
        }

        function createStringLiteral(node, testName) {
            let withTest = types.binaryExpression("===",
                    testName, node);
            let withAssigns = [];
            return [withTest, withAssigns];
        }

        function createIdentifier(node, testName) {
            // TODO: Hmmm... probably need a check to ensure that this case
            // is last and has no default case.  Alternatively just get rid
            // of the default option, Since it isn't really necessary.
            let withTest = types.booleanLiteral(true);
            let withAssigns = [types.variableDeclaration("var",
                    [types.variableDeclarator(node, testName)])];
            return [withTest, withAssigns];
        }

        function createTestAndAssigns(node, previousCondition, testName) {
            let condition = previousCondition;
            let assigns = [];
            for (let x = 0; x < node.elements.length; x++) {
                let element = node.elements[x];
                if (element !== null) {
                    switch (element.type) {
                        case "StringLiteral":
                        case "NumericLiteral":
                        case "NullLiteral":
                        case "BooleanLiteral":
                            let test = types.binaryExpression("===",
                                    types.memberExpression(testName, types.numericLiteral(x), true),
                                    element);
                            condition = types.logicalExpression("&&", condition, test);
                            break;
                        case "Identifier":
                            let idInit = types.memberExpression(testName, types.numericLiteral(x), true);
                            let idDeclaration = types.variableDeclarator(element, idInit);
                            assigns.push(types.variableDeclaration("var", [idDeclaration]));
                            break;
                        case "RestElement":
                            let restInit = types.callExpression(
                                    types.memberExpression(testName, types.identifier("slice")),
                                    [types.numericLiteral(node.elements.length-1)]);
                            let restDeclaration = types.variableDeclarator(element.argument, restInit);
                            assigns.push(types.variableDeclaration("var", [restDeclaration]));
                            break;
                    }
                }
            }

            return [condition, assigns];
        }

        function createArrayPattern(node, testName) {
            let hasRest = node.elements[node.elements.length-1].type === "RestElement";
            let typeTest = types.binaryExpression("===",
                    types.memberExpression(testName, types.identifier("constructor")),
                    types.identifier("Array"));

            let length, operator;
            if (hasRest) {
                length = node.elements.length-1;
                operator = ">";
            } else {
                length = node.elements.length;
                operator = "==="
            }
            let lengthTest = types.binaryExpression(operator,
                    types.memberExpression(testName, types.identifier("length")),
                    types.numericLiteral(length));
            let condition = types.logicalExpression("&&", typeTest, lengthTest);
            let [newCondition, assigns] = createTestAndAssigns(node, condition, testName);
            return [newCondition, assigns];
        }

        function createObjectPattern(node, testName) {
            let assigns = [];

            let nullTest = types.binaryExpression('!==',
                    testName,
                    types.nullLiteral()
                    );
            let undefinedTest = types.binaryExpression('!==',
                    testName,
                    types.identifier('undefined')
                    );
            let condition = types.logicalExpression("&&", nullTest,
                    undefinedTest);

            for (let element of node.properties) {
                let key = element.key;
                condition = types.logicalExpression("&&", condition,
                        types.callExpression(
                            types.memberExpression(testName,
                                types.identifier('hasOwnProperty')),
                            [types.stringLiteral(key.name)]));
                let value = element.value;
                switch(value.type) {
                    case "Identifier":
                        let idInit = types.memberExpression(testName, key);
                        let idDeclaration = types.variableDeclarator(value, idInit);
                        assigns.push(types.variableDeclaration("var", [idDeclaration]));
                        break;
                    case "AssignmentPattern":
                        condition = types.logicalExpression("&&", condition,
                                types.binaryExpression('===',
                                    types.memberExpression(testName, key),
                                    value.right
                                )
                            );
                        let assignInit = types.memberExpression(testName, key);
                        let assignDeclaration = types.variableDeclarator(key, assignInit);
                        assigns.push(types.variableDeclaration("var", [assignDeclaration]));
                        break;
                    default:
                        throw file.buildCodeFrameError(value,
                                `Can't handle pattern type ${value.type}`);
                }
            }

            return [condition, assigns];
        }

        function createConsequent(node, resultName) {
            let lastStatement = node.consequent[node.consequent.length-1];

            if (lastStatement.type == "ExpressionStatement") {
                let newConsequent = node.consequent.slice();
                lastStatement = newConsequent.pop();
                let newStatement = types.expressionStatement(
                        types.assignmentExpression("=", resultName,
                            lastStatement.expression));
                newConsequent.push(newStatement);
                return newConsequent;
            } else {
                return node.consequent;
            }
        }

        function createIf(path, node, testName, resultName) {
            let withTest, withAssigns = [];
            switch(node.test.type) {
                case "StringLiteral":
                    [withTest, withAssigns] = createStringLiteral(node.test, testName);
                    break;
                case "Identifier":
                    [withTest, withAssigns] = createIdentifier(node.test, testName);
                    break;
                case "ArrayPattern":
                    [withTest, withAssigns] = createArrayPattern(node.test, testName);
                    break;
                case "ObjectPattern":
                    [withTest, withAssigns] = createObjectPattern(node.test, testName);
                    break;
                case "RegExpLiteral":
                    //[withTest, withAssigns] = createArrayPattern(node.test, testName);
                    withTest = types.booleanLiteral(true);
                    break;
                    //case "MemberExpression":
                    //break;
                default:
                    throw file.buildCodeFrameError(node.test, `Can't handle pattern type ${node.test.type}`);
            }

            let consequent = createConsequent(node, resultName);
            return types.ifStatement(withTest,
                    types.blockStatement(withAssigns.concat(consequent)));
        }

    }
}

export default function ({types}) {
    function createAssign(path, varName, varInit) {
        let varId = path.scope.generateUidIdentifier(varName);
        let varDeclaration = types.variableDeclarator(varId, varInit);
        return [types.variableDeclaration("var", [varDeclaration]), varId];
    }

    // Reorder cases so that default is always last (having more
    // than one default doesn't parse)
    function reorderDefaultCase(path) {
        let cases = path.node.cases.slice();
        let defaultIdx = cases.find(x => x.test == null);
        let defaultCase = cases.pop(defaultIdx);
        cases.push(defaultCase);

        return cases;
    }

    return {
        inherits: require("babel-plugin-syntax-switch-with"),
        visitor: {
            SwitchWithStatement(path, state) {
                path.node.cases = reorderDefaultCase(path);
                let [testAssign, testName] = createAssign(path,
                        "switchVar", path.node.discriminant);
                let [resultAssign, resultName] = createAssign(path,
                        "switchResult");

                let switchState = {
                    rootIf: null,
                    previousIf: null,
                    testName,
                    resultName,
                    types: types,
                    file: state.file
                };

                path.traverse(SwitchWithVisitor, {switchState});
                path.parentPath.parentPath.insertBefore(testAssign);
                path.parentPath.parentPath.insertBefore(resultAssign);
                path.parentPath.parentPath.insertBefore(switchState.rootIf);
                path.replaceWith(resultName);
            }
        }
    }
}
