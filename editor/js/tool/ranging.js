import Draw from "./draw.js";
import Base from "./base.js";
import * as THREE from "../../../build/three.module.js";
function Ranging(editor) {
	const _self = this;
	const draw = new Draw(editor);
	let lineStartPoint = null;
	let i = 0;
	let group = null;
	let lineName = null;
	let labelName = null;
	let spotName = null;
	let lineNum = 0;
	this.callback = function () {};
	this.start = function (position, callback = () => {}) {
		_self.callback = callback;
		lineName = `line_${lineNum}`;
		labelName = `label_${lineNum}`;
		spotName = `spot_${lineNum}`;
		group = editor.scene.getObjectByName(`测距${i}`);
		if (!group) {
			group = new THREE.Group();
			group.name = `测距${i}`;
			editor.addObject(group);
		}
		// position.y += 1;
		const isSpot = group.getObjectByName(spotName);
		if (!isSpot) draw.rangingSpot({ position, parent: group, name: spotName });
		if (lineStartPoint) {
			const oldLine = group.getObjectByName(lineName);
			oldLine.geometry.setPoints([lineStartPoint, position]);
			document.removeEventListener("mousemove", updateLine);
			lineNum++;
			lineStartPoint = null;
			_self.start(position, callback);
		} else {
			lineStartPoint = position;
			document.addEventListener("mousemove", updateLine);
			document.addEventListener("contextmenu", end);
		}
		return this;
	};
	function end() {
		const oldLine = group.getObjectByName(lineName);
		const labelModel = group.getObjectByName(labelName);
		if (oldLine) {
			editor.removeObject(oldLine, group);
			editor.removeObject(labelModel, group);
		}
		if (!lineNum) {
			const spotModel = group.getObjectByName(spotName);
			editor.removeObject(spotModel, group);
		}
		i++;
		lineStartPoint = null;
		group = null;
		lineNum = 0;
		document.removeEventListener("mousemove", updateLine);
		document.removeEventListener("contextmenu", end);
		_self.callback();
	}
	function getCenterPoint(start, end) {
		const x = (start.x + end.x) / 2;
		const y = (start.y + end.y) / 2;
		const z = (start.z + end.z) / 2;
		return new THREE.Vector3(x, y, z);
	}
	function updateLine(e) {
		const point = Base.screenToWorld({
			dom: document.getElementById("viewport"),
			x: e.clientX,
			z: e.clientY,
			editor,
		});
		const oldLine = group.getObjectByName(lineName);
		if (oldLine) {
			oldLine.geometry.setPoints([lineStartPoint, point]);
			const distance = lineStartPoint.distanceTo(point).toFixed(2);
			draw.removeLabel({ name: labelName, parent: group });
			const centerPoint = getCenterPoint(lineStartPoint, point);
			draw.createLabel({ parent: group, content: `${distance}mm`, position: centerPoint, name: labelName });
		} else {
			draw.createLine({ vertices: [lineStartPoint, point], name: lineName, parent: group });
		}
	}
	return this;
}

export default Ranging;
