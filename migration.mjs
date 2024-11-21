// Save this as migration.mjs


export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { name: 'createMutation' },
      arguments: [{ type: 'ObjectExpression' }],
    })
    .forEach((path) => {
      const objectArg = path.node.arguments[0];
      path.node.arguments[0] = j.arrowFunctionExpression([], j.blockStatement([
        j.returnStatement(objectArg),
      ]));
    })
    .toSource();
}

// Example test case (optional)
/* defineInlineTest(
  transformer,
  {},
  `createMutation({ action: 'update', name: name, quantity: quantity });`,
  `createMutation(() => { return { action: 'update', name: name, quantity: quantity }; });`,
  'Transforms createMutation object argument to function that returns object'
); */
