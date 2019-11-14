const computed = {};
const computedCache = {};
let watch = {};
let properties = {};
let waitUpdate = false;
let updateData = {};
module.exports = Behavior({
	created() {
		for (const dataKey in this.data) {
			defineProperty.call(this, dataKey);
		}
	},
	definitionFilter(defFields) {
		const { data = {}, computed: originComputed = {} } = defFields;
		({ watch, properties } = defFields);
		const propsAndData = {
			...properties,
			...data
		};
		for (let key in propsAndData) {
			const item = propsAndData[key];
			if (typeof item === "function") {
				propsAndData[key] = item();
			}
		}
		for (const computedKey in originComputed) {
			if (data.hasOwnProperty(computedKey)) {
				return;
			}
			const computedDef = originComputed[computedKey];
			const computedValue = computedDef.call(propsAndData);
			data[computedKey] = computedValue;
			computed[computedKey] = computedDef;
		}
		defFields.data = data;
	}
});
function defineProperty(key) {
	const isprop = properties.hasOwnProperty(key);
	if (isprop) {
		definePropsProperty.call(this, key);
		return;
	}

	let _value = this.data[key];
	Object.defineProperty(this, key, {
		configurable: true,
		enumerable: true,
		get() {
			if (computed.hasOwnProperty(key)) {
				return computed[key].call(this);
			}
			return _value;
		},
		set: newVal => {
			const oldVal = _value;
			_value = newVal;
			if (watch.hasOwnProperty(key)) {
				watch[key].call(this, newVal, oldVal);
			}
			if (waitUpdate) {
				updateData[key] = newVal;
			} else {
				updateData = {};
				updateData[key] = newVal;
				waitUpdate = true;
				Promise.resolve().then(executeUpdate.bind(this));
			}
			this.setData({
				[key]: newVal
			});
			diffComputed.call(this);
		}
	});
}

function definePropsProperty(key) {
	let _value = this.data[key];
	Object.defineProperty(this, key, {
		configurable: true,
		enumerable: true,
		get() {
			return _value;
		}
	});
	Object.defineProperty(this.data, key, {
		configurable: true,
		enumerable: true,
		get() {
			return _value;
		},
		set: newVal => {
			const oldVal = _value;
			_value = newVal;
			if (watch.hasOwnProperty(key)) {
				watch[key].call(this, newVal, oldVal);
			}
			diffComputed.call(this);
		}
	});
}

function executeUpdate() {
	waitUpdate = false;
	this.setData({
		...updateData
	});
}

function diffComputed() {
	for (const key in computed) {
		const oldVal = computedCache[key];
		const newVal = this[key];
		if (newVal !== oldVal) {
			if (isNaN(newVal) && isNaN(oldVal)) {
				continue;
			}
			computedCache[key] = newVal;
			this[key] = newVal;
		}
	}
}
