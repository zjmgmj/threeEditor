/**
 * 轨迹
 */
import Draw from "../draw.js";
import Base from "../base.js";
import * as THREE from "../../../libs/three.module.js";
function Trajector(editor, viewport) {
	this.editor = editor;
	this.viewport = viewport;
	this.lineName = "";
	this.spotName = "";
	this.dom = viewport.container.dom;
	this.draw = new Draw(editor);
	this.$self = this;
	// this.editor.trajector = [];
	this.editor.isTrajector = false;
	return this;
}
Trajector.prototype = {
	constructor: Trajector,
	init: function () {
		// this.dom.addEventListener("click", this.start);
	},
	getPosition: function (e) {
		const _self = this;
		const postition = Base.screenToWorld({
			dom: _self.dom,
			x: e.clientX,
			z: e.clientY,
			editor: this.editor,
		});
		return postition;
	},
	getStartPosition: function (e) {
		const _self = this;
		_self.lineStartPoint = this.getPosition(e);
		const point = new THREE.Vector3();
		point.copy(_self.lineStartPoint);
		point.y += 1;
		// _self.editor.trajector.push(point);
		_self.num++;
		_self.spotName = `${Base.tempNameTag}spot_${_self.num}`;
		_self.draw.rangingSpot({ position: _self.lineStartPoint, parent: _self.group, name: _self.spotName });
		_self.dom.removeEventListener("mousemove", _self.mousemoveEvent);
		_self.mousemoveEvent = _self.updateLine.bind(_self);
		_self.dom.addEventListener("mousemove", _self.mousemoveEvent);
		e.stopPropagation();
	},
	start: function () {
		const _self = this;
		this.group = new THREE.Group();
		this.group.name = `${Base.tempNameTag}trajector`;
		this.editor.addObject(this.group);
		this.num = -1;
		_self.clickEvent = _self.getStartPosition.bind(_self);
		_self.dom.addEventListener("click", _self.clickEvent);
		_self.contextmenuEvent = _self.end.bind(_self);
		_self.dom.addEventListener("contextmenu", _self.contextmenuEvent);
		return this;
	},
	end: function () {
		const _self = this;
		const oldLine = this.group.getObjectByName(this.lineName);
		if (oldLine) {
			editor.removeObject(oldLine, _self.group);
		}
		_self.dom.removeEventListener("click", _self.clickEvent);
		_self.dom.removeEventListener("mousemove", _self.mousemoveEvent);
		_self.dom.removeEventListener("contextmenu", _self.contextmenuEvent);
		if (this.group.children.length > 0) this.editor.isTrajector = true;
		this.endAfter();
		return this;
	},
	updateLine: function (e) {
		const _self = this;
		const lineStartPoint = _self.lineStartPoint;
		const group = _self.group;
		_self.lineName = `${Base.tempNameTag}line_${_self.num}`;
		const point = Base.screenToWorld({
			dom: _self.dom,
			x: e.clientX,
			z: e.clientY,
			editor,
		});
		const oldLine = group.getObjectByName(_self.lineName);
		if (oldLine) {
			oldLine.geometry.setPoints([lineStartPoint, point]);
			_self.viewport.render();
		} else {
			_self.draw.createLine({ vertices: [lineStartPoint, point], name: _self.lineName, parent: group });
		}
	},
	endAfter: function () {},
};
export default Trajector;
