const { j } = require('jscodeshift');

module.exports = function transformer(file, api) {
  const root = j(file.source);

  root
    .find(j.CallExpression, {
      callee: {
        name: 'createMutation',
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 1 && j.isObjectExpression(args[0])) {
        path.node.arguments = [
          j.arrowFunctionExpression([], j.blockStatement([j.returnStatement(args[0])])),
        ];
      }
    });

  return root.toSource();
};