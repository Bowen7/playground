Component({
	data: {
		prop1: 1
	},
	onLoad: function() {},
	pageLifetimes: {
		show: function() {
			console.log("show");
		}
	},
	handleAddTap: function(e) {
		this.setData({
			prop1: this.data.prop1 + 1
		});
	}
});
