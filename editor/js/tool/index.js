import Ranging from "./ranging.js";
import Draw from "./draw.js";
import base from "./base.js";
import LockControl from "./lockControl.js";

function Tool(editor) {
	const ranging = new Ranging(editor);
	const draw = new Draw(editor);
	return { ranging, base, draw, LockControl };
}

export { Tool };
