//index.js
//获取应用实例
const app = getApp();

Page({
	data: {
		propCount: 0
	},
	onLoad() {},
	addPropCount() {
		this.setData({
			propCount: this.data.propCount + 1
		});
	}
});
