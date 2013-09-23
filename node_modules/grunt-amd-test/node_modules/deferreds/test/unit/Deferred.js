define(function(require){

	var Deferred = require('Deferred');


	module('Deferred');


	test('New Deferred', function() {

		expect(19);


		var defer = Deferred();
		defer.resolve().done(function() {
			ok( true, 'Success on resolve' );
			strictEqual(defer.state(), 'resolved', 'Deferred is resolved (state)');
		}).fail(function() {
			ok( false, 'Error on resolve' );
		}).always(function() {
			ok( true, 'Always callback on resolve' );
		});


		defer = Deferred();
		defer.reject().done(function() {
			ok( false, 'Success on reject' );
		}).fail(function() {
			ok( true, 'Error on reject' );
			strictEqual(defer.state(), 'rejected', 'Deferred is rejected (state)');
		}).always(function() {
			ok( true, 'Always callback on reject' );
		});


		defer = new Deferred();
		var promise = defer.promise();
		strictEqual(defer.promise(), promise, 'promise is always the same');


		'resolve reject'.split(' ').forEach(function(change) {
			var defer = new Deferred();

			strictEqual(defer.state(), 'pending', 'pending after creation');

			var checked = 0;
			defer.progress(function(value) {
				strictEqual(value, checked, 'Progress: right value (' + value + ') received');
			});

			for (checked = 0; checked < 3; checked++) {
				defer.notify(checked);
			}
			strictEqual(defer.state(), 'pending', 'pending after notification');

			defer[change]();
			notStrictEqual( defer.state(), 'pending', 'not pending after ' + change );
			defer.notify();
		});

	});


	test('Resolved values passed as-is', function() {
		expect(4);

		var defer = Deferred().then(function(result) {
			deepEqual(result, [1, 2, 3]);
		});
		defer.resolve([1, 2, 3]);

		defer = Deferred().then(function(result) {
			deepEqual(result, {'a': 1, 'b': 2});
		});
		defer.resolve({'a': 1, 'b': 2});

		defer = Deferred().then(function(arg1, arg2) {
			strictEqual(arg1, 'a');
			strictEqual(arg2, 'b');
		});
		defer.resolve('a', 'b');
	});


	test('Deferred - chainability', function() {
		var defer = new Deferred();

		expect(8);

		'resolve reject notify then done fail progress always'.split(' ').forEach(function(method) {
			strictEqual(defer[method](), defer, method + ' is chainable' );
		});
	});


	test('Deferred.then - done', function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.done(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		defer.resolve( 2, 3 );

		strictEqual( value1, 2, 'first resolve value ok' );
		strictEqual( value2, 3, 'second resolve value ok' );
	});


	test('Deferred.then - fail', function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.fail(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		defer.reject( 2, 3 );

		strictEqual( value1, 2, 'first reject value ok' );
		strictEqual( value2, 3, 'second reject value ok' );
	});


	test('Deferred.then - progress', function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.progress(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		defer.notify( 2, 3 );

		strictEqual( value1, 2, 'first progress value ok' );
		strictEqual( value2, 3, 'second progress value ok' );
	});


	test('Deferred.then - resolve, done', function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.resolve( 2, 3 );

		defer.done(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		strictEqual( value1, 2, 'first resolve value ok' );
		strictEqual( value2, 3, 'second resolve value ok' );
	});


	test('Deferred.then - reject, fail', function() {
		expect(2);

		var value1;
		var value2;
		var defer = new Deferred();

		defer.reject( 2, 3 );

		defer.fail(function( a, b ) {
			value1 = a;
			value2 = b;
		});

		strictEqual( value1, 2, 'first reject value ok' );
		strictEqual( value2, 3, 'second reject value ok' );
	});


	asyncTest('Deferred - throw (not swallow!) errors', function() {
		expect(1);

		var defer = new Deferred();

		defer.then(function() {
			throw 'test';
		});

		setTimeout(function() {
			throws(function() {
				defer.resolve();
			}, 'Error propagates');
			start();
		}, 10);
	});


	asyncTest('pipe', function() {
		expect(1);

		var deferred = new Deferred();
		var results = [];

		deferred.pipe(function() {
			var sub = new Deferred();
			setTimeout(function() {
				results.push(1);
				sub.resolve();
			}, 30);
			return sub.promise();
		}).pipe(function() {
			var sub = new Deferred();
			setTimeout(function() {
				results.push(2);
				sub.resolve();
			}, 20);
			return sub.promise();
		}).pipe(function() {
			var sub = new Deferred();
			setTimeout(function() {
				results.push(3);
				sub.resolve();
			}, 10);
			return sub.promise();
		}).then(function() {
			deepEqual(results, [1, 2, 3], 'processed in correct order, each pipe waiting for the previous pipe to resolve');
			start();
		});

		deferred.resolve();
	});


	test('pipe - reject', function() {
		var deferred = new Deferred();

		deferred.pipe(function() {
			return Deferred().reject();
		}).pipe(function() {
			ok(false, 'Should not propagate past rejected pipe');
		}).then(function() {
			ok(false, 'Should not call success callbacks registered after rejected pipe');
		}).fail(function() {
			ok(true, 'Should call fail callbacks registered after rejected pipe');
		});

		deferred.resolve();
	});


	asyncTest('pipe - passing values', function() {
		var deferred = new Deferred();

		deferred.pipe(function(arg) {
			var sub = new Deferred();
			setTimeout(function() {
				sub.resolve(arg.concat('B'));
			}, 30);
			return sub.promise();
		}).pipe(function(arg) {
			var sub = new Deferred();
			setTimeout(function() {
				sub.resolve(arg.concat('C'));
			}, 30);
			return sub.promise();
		}).then(function(arg) {
			deepEqual(arg, ['A', 'B', 'C']);
			start();
		});

		deferred.resolve(['A']);
	});

});
