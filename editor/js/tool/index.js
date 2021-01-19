import Ranging from "./ranging.js";
import Draw from "./draw.js";
import base from "./base.js";
import LockControl from "./lockControl.js";
import Contextmenu from "./contextMenu/index.js";
// import loader from "./load.js";
function Tool(editor, viewport) {
	const ranging = new Ranging(editor);
	const draw = new Draw(editor, viewport);
	const contextmenu = new Contextmenu(editor, viewport);
	return { ranging, base, draw, LockControl, contextmenu };
}

export { Tool };
