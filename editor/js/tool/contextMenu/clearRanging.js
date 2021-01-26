import { UIPanel } from "../../libs/ui.js";
function ClearRanging(editor, viewpoint) {
	this.editor = editor;
	this.viewpoint = viewpoint;
	return this;
}

ClearRanging.prototype = {
	constructor: ClearRanging,
	init: function () {
		this.panel();
		return this;
	},
	panel: function () {
		console.log(this);
		const _self = this;
		const container = new UIPanel();
		container.setClass("title");
		container.setTextContent("清除测距");
		container.onClick(_self.clickEvent());
		this.container = container;
		return this;
	},
	clear: function () {
		const list = this.editor.scene.children;
		const ids = [];
		for (let i = 0; i < list.length; i++) {
			const item = list[i];
			if (item.constructor.name === "Group" && item.name.indexOf("temp_测距") === 0) {
				ids.push(item.id);
			}
		}
		this.editor.removeAll(ids);
	},
	clickEvent: function () {
		console.log("清除");
		return () => {
			this.clear();

			this.clickAfter();
			return this;
		};
	},
	clickAfter: function () {},
};

export default ClearRanging;
