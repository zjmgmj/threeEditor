import { EditorControls } from "../../EditorControls.js";
import * as THREE from "../../../libs/three.module.js"; // 引用基本的three.js库
function CameraReset(editor, viewport) {
	this.editor = editor;
	this.viewport = viewport;
	this.filters = ["AmbientLight", "DirectionalLight", "GridHelper"];
	return this;
}
CameraReset.prototype = {
	constructor: CameraReset,
	reset() {
		let group = new THREE.Group();
		const models = this.editor.scene.children;
		let skyLand = null;
		for (let i = 0; i < models.length; i++) {
			const item = models[i];
			if (this.filters.indexOf(item.constructor.name) !== -1) continue;
			group.add(item.clone());
			item.name === "天空盒土地" ? (skyLand = item) : group.add(item.clone());
		}
		this.editor.camera.position.set(0, 50, 50);
		this.editor.camera.lookAt(new THREE.Vector3());
		this.editor.viewportCamera.position.set(0, 50, 50);
		this.editor.viewportCamera.lookAt(new THREE.Vector3());
		debugger;
		// const groupBox = new THREE.Box3();
		// const skyLandBox = new THREE.Box3();
		// const groupSize = groupBox.setFromObject(group);
		// const groupBoxSize = [groupSize.max.x - groupSize.min.x, groupSize.max.z - groupSize.min.z];
		// const skyLandSize = skyLandBox.setFromObject(skyLand);
		// const skyLandBoxSize = [skyLandSize.max.x - skyLandSize.min.x, skyLandSize.max.z - skyLandSize.min.z];
		// const x = groupBoxSize[0] / skyLandBoxSize[0];
		// const z = groupBoxSize[1] / skyLandBoxSize[1];
		// let multiple = x > z ? x : z;
		// if (multiple > 1) multiple = multiple * 2;
		// skyLand.scale.set(multiple, multiple, multiple);
		// group.add(skyLand);
		this.editor.focus(group);
		group = null;
	},
};
export default CameraReset;
