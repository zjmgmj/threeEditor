import * as THREE from "../../../build/three.module.js"; // 引用基本的three.js库
import THREEMeshLine from "../../../build/THREEMeshLine.js";
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
		const id = `spot_${Math.random() * 100}`;
		dom.innerHTML = `<div class="del-spot" id="${id}">删除</div>`;
		base.createLabel({
			dom,
			position,
			editor,
			parent,
			name,
		});
		document.getElementById(id).addEventListener("click", (e) => {
			console.log("------------------parent", parent);
			const spotModel = parent.getObjectByName(name);
			editor.removeObject(spotModel, parent);
			let idx = Number(name.split("_")[1]);
			// const names = [`spot_${idx}`, `line_${idx}`, `label_${idx}`];
			// const models = parent.children.filter((item) => {
			// 	return names.indexOf(item.name) !== -1;
			// });
			// models.map((item) => {
			// 	editor.removeObject(item, parent);
			// });

			if (idx === 0) {
				removeRangingSpot(parent, idx);
			} else {
				const ids = [idx - 1, idx];
				ids.map((num) => {
					removeRangingSpot(parent, num);
				});
			}
		});
	}
	function removeRangingSpot(parent, idx) {
		if (idx === 0) {
			const spotModel = parent.getObjectByName(`spot_${idx}`);
			if (spotModel) editor.removeObject(spotModel, parent);
		}
		const lineModel = parent.getObjectByName(`line_${idx}`);
		if (lineModel) {
			editor.removeObject(lineModel, parent);
			const labelModel = parent.getObjectByName(`label_${idx}`);
			editor.removeObject(labelModel, parent);
		}
		const lineModelNext = parent.getObjectByName(`line_${idx + 1}`);
		if (!lineModelNext) {
			const spotModel = parent.getObjectByName(`spot_${idx + 1}`);
			if (spotModel) editor.removeObject(spotModel, parent);
		}
		// const lineModelPrev = parent.getObjectByName(`line_${idx - 1}`);
		// if (!lineModelPrev) {
		// 	const spotModel = parent.getObjectByName(`spot_${idx - 1}`);
		// 	if (spotModel) editor.removeObject(spotModel, parent);
		// }
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
	function removeLabel({ name, parent }) {
		const model = parent.getObjectByName(name);
		if (model) editor.removeObject(model);
	}
	return { line, rangingSpot, createLabel, removeLabel, createLine };
}
export default Draw;
