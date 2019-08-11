const tests = require("promises-aplus-tests");
const Promise = require("./index");

const deferred = function() {
	let resolve, reject;
	const promise = new Promise(function(_resolve, _reject) {
		resolve = _resolve;
		reject = _reject;
	});
	return {
		promise: promise,
		resolve: resolve,
		reject: reject
	};
};
const adapter = {
	deferred
};
tests.mocha(adapter);
