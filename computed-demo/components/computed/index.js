const computedBeh = require("./computed-min.js");
Component({
	behaviors: [computedBeh],
	properties: {
		prop1: Number
	},

	data: {
		count: 0,
		lastVal: 0
	},
	computed: {
		countAddOne() {
			return this.count + 1;
		},
		prop1AddOne() {
			// console.log(this.prop1);
			return this.prop1 + 1;
		}
	},
	watch: {
		count(newval, oldval) {
			this.lastVal = oldval;
		}
	},
	lifetimes: {
		attached: function() {},
		moved: function() {},
		detached: function() {}
	},

	// 生命周期函数，可以为函数，或一个在methods段中定义的方法名
	attached: function() {}, // 此处attached的声明会被lifetimes字段中的声明覆盖
	ready: function() {},
	pageLifetimes: {
		// 组件所在页面的生命周期函数
		show: function() {},
		hide: function() {},
		resize: function() {}
	},

	methods: {
		handleAddTap() {
			this.count += 1;
		}
	}
});
