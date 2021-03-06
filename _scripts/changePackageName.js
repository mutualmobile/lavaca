var name = process.argv[2];
var chunks = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  chunks.push(chunk);
});

process.stdin.on('end', function() {
  var pkg = JSON.parse(chunks.join());
  pkg.name = name;
  delete pkg.devDependencies;
  delete pkg.scripts;
  process.stdout.write(JSON.stringify(pkg, false, 4) + '\n');
});
