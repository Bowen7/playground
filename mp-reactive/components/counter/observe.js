const computed = {};
let watch = {};
let subscriber;
module.exports = Behavior({
	created() {
		for (const dataKey in this.data) {
			defineReactive.call(this, dataKey);
		}
	},
	definitionFilter(defFields) {
		const { data = {}, computed: originComputed = {} } = defFields;
		({ watch } = defFields);
		for (const computedKey in originComputed) {
			if (data.hasOwnProperty(computedKey)) {
				return;
			}
			const computedDef = originComputed[computedKey];
			const computedValue = computedDef.call(data);
			data[computedKey] = computedValue;
			computed[computedKey] = computedDef;
		}
		defFields.data = data;
	}
});
function defineReactive(key) {
	let _value;
	if (computed.hasOwnProperty(key)) {
		subscriber = key;
		_value = computed[key].call(this);
		subscriber = void 0;
	} else {
		_value = this.data[key];
	}
	const subscribers = [];
	Object.defineProperty(this, key, {
		configurable: true,
		enumerable: true,
		get() {
			if (subscriber) {
				subscribers.push(subscriber);
			}
			return _value;
		},
		set: newVal => {
			const oldVal = _value;
			_value = newVal;
			if (watch.hasOwnProperty(key)) {
				watch[key].call(this, newVal, oldVal);
			}
			updateDepends.call(this, subscribers);
			this.setData({
				[key]: newVal
			});
		}
	});
}

function updateDepends(subscribers) {
	subscribers.forEach(key => {
		const computedDef = computed[key];
		this[key] = computedDef.call(this);
	});
}
