const app = getApp();

Page({
	data: {
		prop1: 1
	},
	onLoad: function() {},
	handleAddTap: function(e) {
		this.setData({
			prop1: this.data.prop1 + 1
		});
	}
});
