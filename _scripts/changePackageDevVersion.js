var hash = process.argv[2];
var chunks = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  chunks.push(chunk);
});

process.stdin.on('end', function() {
  var pkg = JSON.parse(chunks.join());
  var version = pkg.version.match(/(\d+\.\d+\.\d+).*/)[1];
  pkg.version = version + '-alpha-' + hash + '.0';
  process.stdout.write(JSON.stringify(pkg, false, 4) + '\n');
});

