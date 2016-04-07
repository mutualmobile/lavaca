global.expect = global.chai.expect;
var context = require.context('./unit', true, /-spec\.js$/);
context.keys().forEach(context);
console.log(context.keys());
