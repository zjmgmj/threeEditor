import Ranging from "./ranging.js";
import Draw from "./draw.js";
import base from "./base.js";
import LockControl from "./lockControl.js";
import ModelNode from "./modelNode/index.js";
import ModelDetail from "./modelDetail/index.js";
import Trajector from "./trajector/index.js";
import CameraReset from "./cameraReset/index.js";
function Tool(editor, viewport) {
	const ranging = new Ranging(editor);
	const draw = new Draw(editor, viewport);
	const modelNode = new ModelNode(editor);
	modelNode.init();
	modelNode.sidebarScene.refreshUI();
	const modelDetail = new ModelDetail(editor, viewport);
	modelDetail.init();
	const trajector = new Trajector(editor, viewport);
	const cameraReset = new CameraReset(editor, viewport);
	return { ranging, base, draw, LockControl, modelNode, modelDetail, trajector, cameraReset };
}

export { Tool };
