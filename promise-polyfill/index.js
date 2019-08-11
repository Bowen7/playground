const IS_ERROR = {};
let ERROR = null;
// status
// 0 pending
// 1 resolved
// 2 rejected
function _Promise(fn) {
	this._status = 0;
	this._value = null;
	this._handlers = [];
	doFn(this, fn);
}

_Promise.prototype.then = function(onResolve, onReject) {
	const res = new _Promise(function() {});
	preThen(this, onResolve, onReject, res);
	return res;
};

function preThen(self, onResolve, onReject, res) {
	onResolve = typeof onResolve === "function" ? onResolve : null;
	onReject = typeof onReject === "function" ? onReject : null;
	const handler = {
		onResolve,
		onReject,
		promise: res
	};
	if (self._status === 0) {
		self._handlers.push(handler);
		return;
	}
	doHandler(self, handler);
}

function doThen(self) {
	const handlers = self._handlers;
	handlers.forEach(handler => {
		doHandler(self, handler);
	});
}

_Promise.prototype.resolve = function(value) {
	if (this._status !== 0) {
		return;
	}
	if (this === value) {
		return this.reject(new TypeError("cant's resolve itself"));
	}
	if (value && (typeof value === "function" || typeof value === "object")) {
		const then = getThen(value);
		if (then === IS_ERROR) {
			this.reject(ERROR);
			return;
		}
		if (value instanceof _Promise) {
			value.then(
				value => {
					this.resolve(value);
				},
				reason => {
					this.reject(reason);
				}
			);
			return;
		}
		if (typeof then === "function") {
			doFn(this, then.bind(value));
			return;
		}
	}
	this._status = 1;
	this._value = value;
	doThen(this);
};

_Promise.prototype.reject = function(reason) {
	if (this._status !== 0) {
		return;
	}
	this._status = 2;
	this._value = reason;
	doThen(this);
};

function doFn(self, fn) {
	let done = false;
	const ret = safeCallTwo(
		fn,
		function(value) {
			if (done) {
				return;
			}
			done = true;
			self.resolve(value);
		},
		function(reason) {
			if (done) {
				return;
			}
			done = true;
			self.reject(reason);
		}
	);
	if (ret === IS_ERROR) {
		if (done) {
			return;
		}
		done = true;
		self.reject(ERROR);
	}
}

function doHandler(self, handler) {
	setTimeout(() => {
		const { onReject, onResolve, promise } = handler;
		const { _status, _value } = self;
		const handlerFun = _status === 1 ? onResolve : onReject;
		if (handlerFun === null) {
			_status === 1 ? promise.resolve(_value) : promise.reject(_value);
			return;
		}
		const ret = safeCallOne(handlerFun, _value);
		if (ret === IS_ERROR) {
			promise.reject(ERROR);
			return;
		}
		promise.resolve(ret);
	});
}

function safeCallOne(fn, arg1) {
	try {
		return fn(arg1);
	} catch (error) {
		ERROR = error;
		return IS_ERROR;
	}
}

function safeCallTwo(fn, arg1, arg2) {
	try {
		return fn(arg1, arg2);
	} catch (error) {
		ERROR = error;
		return IS_ERROR;
	}
}

function getThen(self) {
	try {
		return self.then;
	} catch (error) {
		ERROR = error;
		return IS_ERROR;
	}
}

module.exports = _Promise;
