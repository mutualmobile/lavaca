var fs = require('fs');
var path = require('path');

var json = fs.readFileSync(path.resolve(__dirname, '../package.json'));
var pkg = JSON.parse(json);
pkg.name = process.argv[2];
delete pkg.devDependencies;
delete pkg.scripts;
process.stdout.write(JSON.stringify(pkg, false, 4) + '\n');
