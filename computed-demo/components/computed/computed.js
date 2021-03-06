const data = {};
let subscriber;
module.exports = Behavior({
	lifetimes: {
		created() {
			for (const dataKey in data) {
				const dataItem = data[dataKey];
				const { watchDef, computedDef, isprop = false } = dataItem;
				defineReactive(this, dataKey, isprop, watchDef, computedDef);
			}
		}
	},
	definitionFilter(defFields) {
		const {
			watch = {},
			data: originData = {},
			computed = {},
			properties = {}
		} = defFields;

		for (const propKey in properties) {
			data[propKey] = {
				isprop: true
			};
		}

		for (const originDataKey in originData) {
			data[originDataKey] = {};
		}

		for (const computedKey in computed) {
			if (originData.hasOwnProperty(computedKey)) {
				console.warn(
					`${computedKey}在data或props中已声明，在computed中将被忽略`
				);
				break;
			}
			const computedDef = computed[computedKey];
			if (typeof computedDef !== "function") {
				console.error("computed值暂只支持函数");
			}
			const computedVal = computedDef.call(originData);
			originData[computedKey] = computedVal;
			data[computedKey] = {
				computedDef
			};
		}

		for (const watchKey in watch) {
			if (!data.hasOwnProperty(watchKey)) {
				console.erro(`watch: ${watchKey}在data和computed中未定义`);
				break;
			}
			data[watchKey].watchDef = watch[watchKey];
		}
	}
});

function defineReactive(scope, key, isprop, watchDef, computedDef) {
	let val;
	if (computedDef) {
		subscriber = key;
		val = computedDef.call(scope);
		subscriber = void 0;
	} else {
		val = scope.data[key];
	}
	const subscribers = [];
	Object.defineProperty(scope, key, {
		configurable: true,
		enumerable: true,
		get() {
			if (subscriber) {
				if (subscriber === key) {
					console.error(`请注意computed:${subscriber}中有循环依赖`);
				} else {
					subscribers.push(subscriber);
				}
			}
			return val;
		},
		set: isprop
			? void 0
			: function(newval) {
					if (newval === val) {
						return;
					}
					watchDef && watchDef.call(scope, newval, val);
					val = newval;
					updateDepends(scope, subscribers);
					scope.setData({
						[key]: val
					});
			  }
	});
	isprop &&
		Object.defineProperty(scope.data, key, {
			configurable: true,
			enumerable: true,
			set(newval) {
				if (newval === val) {
					return;
				}
				watchDef && watchDef.call(scope, newval, val);
				val = newval;
				updateDepends(scope, subscribers);
			}
		});
}

function updateDepends(scope, subscribers) {
	subscribers.forEach(key => {
		const computedDef = data[key].computedDef;
		scope[key] = computedDef.call(scope);
	});
}
