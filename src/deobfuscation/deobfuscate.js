import {parseScript} from "shift-parser";
import query from "shift-query";
import Loader from "./Loader.js";
import {webcrack} from "webcrack";

/**
 * @param {string} scriptContents
 * @returns {Promise<string>}
 */
export async function deobfuscate(scriptContents) {
	const ast = parseScript(scriptContents);

	const evalCall = query(ast, "CallExpression[callee.name='eval'] > CallExpression")[0];
	/** @type {string} */
	const templateString = evalCall.arguments[0].value;
	/** @type {string[]} */
	const characters = evalCall.arguments[3].callee.object.value.split("|");
	const funcShiftNum = 61;
	// let shiftNum2 = 61;

	const shufflesObjs = {};
	for (let shiftNum2 = funcShiftNum - 1; shiftNum2 >= 0; shiftNum2--) {
		// console.log("item:", characters[shiftNum2], " *** ", characters[shiftNum2] || getString(shiftNum2));
		shufflesObjs[getString(shiftNum2, funcShiftNum)] = characters[shiftNum2] || getString(shiftNum2, funcShiftNum);
	}
	// console.log("shufflesObjs:", shufflesObjs);

	// https://regex101.com/r/99vMWg/1
	/** @type {string} */
	const stage2 = templateString.replace(new RegExp(/\b\w+\b/g), (string) => {
		return shufflesObjs[string];
	});
	// console.log(stage2);

	// CallExpression[callee.property='DC']
	const stage3Re = stage2.match(/Loader\.DC\('(?<code>[a-zA-Z0-9]+)'\)/);
	if (!stage3Re) {
		throw new Error("Unable to find stage #3!");
	}
	const {code: stage3Encoded} = stage3Re.groups;
	// console.log("stage3Encoded:", stage3Encoded);
	const stage3Decoded = Loader.DC(stage3Encoded);

	const stage3Deobf = await webcrack(stage3Decoded);

	return stage3Deobf.code;
}

/**
 * @param {number} index
 * @param {number} funcShiftNum
 * @returns {string}
 */
function getString(index, funcShiftNum) {
	return (index < funcShiftNum ? "" : getString(Math.trunc(index / funcShiftNum), funcShiftNum)) + ((index = index % funcShiftNum) > 35 ? String.fromCharCode(index + 29) : index.toString(36));
}
