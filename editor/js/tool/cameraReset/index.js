import { EditorControls } from "../../EditorControls.js";
function CameraReset(editor, viewport) {
	this.editor = editor;
	this.viewport = viewport;
	return this;
}
CameraReset.prototype = {
	constructor: CameraReset,
	reset() {
		this.editor.camera.position.set(0, 50, 50);
		this.editor.camera.lookAt(new THREE.Vector3());
		this.editor.viewportCamera.position.set(0, 50, 50);
		this.editor.viewportCamera.lookAt(new THREE.Vector3());
		this.editor.focus(this.editor.scene);
	},
};
export default CameraReset;
