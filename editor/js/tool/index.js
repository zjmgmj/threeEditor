import Ranging from "./ranging.js";
import Draw from "./draw.js";
import base from "./base.js";
import LockControl from "./lockControl.js";
import Contextmenu from "./contextMenu/index.js";
import ModelNode from "./modelNode/index.js";
function Tool(editor, viewport) {
	const ranging = new Ranging(editor);
	const draw = new Draw(editor, viewport);
	const contextmenu = new Contextmenu(editor, viewport);
	const modelNode = new ModelNode(editor);
	return { ranging, base, draw, LockControl, contextmenu, modelNode };
}

export { Tool };
