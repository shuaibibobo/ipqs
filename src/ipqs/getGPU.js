import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {randomItem} from "../utils.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const gpus = readFileSync(__dirname + "/../../resources/gpus.txt", "utf8")
	.replaceAll("\r\n", "\n")
	.trim()
	.split("\n");

export default function getGPU() {
	return randomItem(gpus);
}
