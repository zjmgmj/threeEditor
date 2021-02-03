import { UIPanel } from "../../libs/ui.js";
import { $get } from "../load.js";
function ModelDetail(editor) {
	this.editor = editor;
	this.isShow = false;
	return this;
}

ModelDetail.prototype = {
	constructor: ModelDetail,
	init: function () {
		this.panel();
	},
	panel: function () {
		const _self = this;
		const container = new UIPanel();
		container.setClass("model-detail");
		container.setId("modelDetail");
		container.dom.style = "transform: translateX(305px);";
		this.container = container;
		document.body.appendChild(this.container.dom);
		this.editor.signals.objectSelected.add(function (object) {
			console.log("object", object);
			if (!_self.isShow) return false;
			_self.update(object);
		});
		return this;
	},
	update: function (model) {
		if (!model) return false;
		let temp = "";
		$get("/models/420bd3c8-3bbd-486e-b39e-1d3193ef89ba/json/0a4e4806-c09a-416f-8065-4e1cbcf39bc6.json").then(
			(res) => {
				const resData = res.Value.paramsMap["其他参数"];
				resData.map((item) => {
					temp += `<div class="model-detail-item">
              <div class="model-detail-name">${item.paramNameCn}</div>
              <div class="model-detail-val">${item.paramValue}</div>
            </div>`;
				});
				document.getElementById("modelDetail").innerHTML = temp;
			}
		);
	},
	show: function () {
		this.update(this.editor.selected);
		this.isShow = true;
		this.container.dom.style = "transform: translateX(0);";
		return this;
	},
	hide: function () {
		this.isShow = false;
		this.container.dom.style = "transform: translateX(305px);";
		this.hideAfter();
		return this;
	},
	toggle: function () {
		this.isShow ? this.hide() : this.show();
		return this;
	},
	hideAfter: function () {},
};
export default ModelDetail;
