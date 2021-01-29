import * as THREE from "../../libs/three.module.js"; // 引用基本的three.js库
import THREEMeshLine from "../../libs/THREEMeshLine.js";
import base from "./base.js";
const { MeshLine, MeshLineMaterial } = new THREEMeshLine(THREE);

function Draw(editor) {
	// Object.assign(this, base);
	const _self = this;
	function createLine({ vertices, color, pointNum = 1, name, parent }) {
		var geometry = new THREE.Geometry();
		geometry.vertices = vertices;
		color = color || 0x009bff;
		var material = new MeshLineMaterial({
			side: THREE.DoubleSide,
			useMap: false,
			color: new THREE.Color(color),
			opacity: 1,
			resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
			sizeAttenuation: false,
			lineWidth: 5,
			depthTest: false,
		});
		const meshLine = new MeshLine();
		meshLine.setGeometry(geometry);

		const lineModal = new THREE.Mesh(meshLine.geometry, material);
		lineModal.name = name;

		editor.addObject(lineModal, parent);
		// return lineModal
	}
	function line({ color = 0x009bff, vertices, name, parent }) {
		// 直线
		const material = new THREE.LineBasicMaterial({ color });
		const geometry = new THREE.Geometry();
		geometry.vertices = vertices;
		const line = new THREE.Line(geometry, material);
		line.name = name;
		editor.addObject(line, parent);
		return line;
	}
	function rangingSpot({ position, parent, name }) {
		const dom = document.createElement("div");
		dom.className = "spot";
		const id = name;
		dom.innerHTML = `<div class="del-spot" id="${id}">删除</div>`;
		base.createLabel({
			dom,
			position,
			editor,
			parent,
			name,
		});
		document.getElementById(id).addEventListener("click", (e) => {
			const spotModel = parent.getObjectByName(name);
			editor.removeObject(spotModel, parent);
			const names = name.split("_");
			let idx = Number(names[names.length - 1]);

			if (idx === 0) {
				removeRangingSpot(parent, idx);
			} else {
				const ids = [idx - 1, idx];
				ids.map((num) => {
					removeRangingSpot(parent, num);
				});
				const lineModelNext = parent.getObjectByName(`${base.tempNameTag}line_${idx + 1}`);
				if (!lineModelNext) {
					const spotModel = parent.getObjectByName(`${base.tempNameTag}spot_${idx + 1}`);
					if (spotModel) editor.removeObject(spotModel, parent);
				}
				const lineModelPrev = parent.getObjectByName(`${base.tempNameTag}line_${idx - 2}`);
				if (!lineModelPrev) {
					const spotModel = parent.getObjectByName(`${base.tempNameTag}spot_${idx - 1}`);
					if (spotModel) editor.removeObject(spotModel, parent);
				}
			}
		});
	}
	function removeRangingSpot(parent, idx) {
		if (idx === 0) {
			const spotModel = parent.getObjectByName(`${base.tempNameTag}spot_${idx}`);
			if (spotModel) editor.removeObject(spotModel, parent);
		}
		const lineModel = parent.getObjectByName(`${base.tempNameTag}line_${idx}`);
		if (lineModel) {
			editor.removeObject(lineModel, parent);
			const labelModel = parent.getObjectByName(`${base.tempNameTag}label_${idx}`);
			if (labelModel) editor.removeObject(labelModel, parent);
		}
	}
	function createLabel({ position = new THREE.Vector3(0, 0, 0), parent, content, name }) {
		const dom = document.createElement("div");
		dom.className = "label";
		dom.textContent = content;
		base.createLabel({
			dom,
			position,
			editor,
			parent,
			content,
			name,
		});
	}
	// function removeLabel({ name, parent }) {
	// 	const model = parent.getObjectByName(name);
	// 	if (model) editor.removeObject(model);
	// }
	return { line, rangingSpot, createLabel, removeLabel: base.removeLabel, createLine };
}
export default Draw;
