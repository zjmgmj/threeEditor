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
		for (let i = 0; i < models.length; i++) {
			const item = models[i];
			if (this.filters.indexOf(item.constructor.name) !== -1) continue;
			group.add(item.clone());
		}
		this.editor.camera.position.set(0, 50, 50);
		this.editor.camera.lookAt(new THREE.Vector3());
		this.editor.viewportCamera.position.set(0, 50, 50);
		this.editor.viewportCamera.lookAt(new THREE.Vector3());
		this.editor.focus(group);
		group = null;
	},
};
export default CameraReset;
