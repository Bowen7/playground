const reactiveBeh = require("./reactive");
Component({
	behaviors: [reactiveBeh],
	properties: {
		propCount: Number
	},
	data: {
		count1: 0
	},
	computed: {
		count2() {
			return this.count1 + 1;
		},
		count3() {
			return this.propCount + 1;
		}
	},
	watch: {
		count1(newVal, oldVal) {
			console.log(`count1 has changed, from ${oldVal} to ${newVal}`);
		}
	},
	methods: {
		addCount1() {
			this.count1 = this.count1 + 1;
		},
		addPropCount() {
			this.triggerEvent("addPropCount");
		}
	},
	attached() {}
});
