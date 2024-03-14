import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {Library} from "ffi-napi";
import {execSync} from "child_process";
import {existsSync} from "node:fs";
import {randomUUID} from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const library = createWrapper();

/**
 * @typedef {object} RequestParams
 * @property {import("https-proxy-agent").HttpsProxyAgent} [agent]
 * @property {Record<string, string>} [headers]
 */

/**
 * @param {URL|RequestInfo} url
 * @param {RequestParams & RequestInit} [init]
 * @returns {Promise<Response>}
 */
export default async function request(url, init) {
	const sessionId = randomUUID().toString();
	const resp = await requestAsync({
		requestUrl: url.toString(),
		requestMethod: init?.method || "GET",
		requestBody: init?.body || "",
		headers: init.headers,
		headerOrder: ["accept", "user-agent", "accept-encoding", "accept-language"],
		proxyUrl: init.agent?.proxy.toString() || "",
		tlsClientIdentifier: "chrome_120",
		insecureSkipVerify: false,
		followRedirects: true,
		sessionId: sessionId,
		timeoutSeconds: 20,
		withoutCookieJar: true,
		catchPanics: true,
	});

	library.freeMemory(resp.id);

	// const destroySessionResponse = library.destroySession(
	library.destroySession(
		JSON.stringify({
			sessionId: sessionId,
		}),
	);
	// const destroySessionResponseParsed = JSON.parse(destroySessionResponse);
	// console.log("destroySessionResponseParsed:", destroySessionResponseParsed);

	if (resp.status === 0) {
		throw new Error(`TLS client error: ${resp.body}`);
	}

	/** @type {[string, string][]} */
	const responseHeaders = [];
	if (resp.headers) {
		for (const [header, value] of Object.entries(resp.headers)) {
			for (const h of value) {
				responseHeaders.push([header, h]);
			}
		}
	}

	return new Response(resp.body, {
		headers: responseHeaders,
		status: resp.status,
	});
}

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function requestAsync(payload) {
	return new Promise((resolve) => {
		library.request.async(JSON.stringify(payload), (error, response) => {
			const clientResponse = JSON.parse(response);

			resolve(clientResponse);
		});
	});
}

/**
 * @param {string} libVersion
 */
function createWrapper(libVersion = "v1.7.2") {
	let sharedLibraryFilename;
	if (process.platform === "darwin") {
		// macOS
		sharedLibraryFilename = `tls-client-darwin-${process.arch === "x64" ? "amd64" : "arm64"}-${libVersion}.dylib`;
	} else if (process.platform === "win32") {
		sharedLibraryFilename = `tls-client-windows-${process.arch.replace("x", "")}-${libVersion}.dll`;
	} else if (process.platform === "linux") {
		const osRelease = execSync("cat /etc/*release*").toString();

		// Check if Ubuntu or Alpine
		let prefix = "";
		if (process.arch !== "arm64") {
			if (osRelease.includes("ID=ubuntu") || osRelease.includes("ID=debian")) {
				prefix = "ubuntu-";
			} else if (osRelease.includes("ID=alpine")) {
				prefix = "alpine-";
			} else {
				throw new Error(`Invalid OS Release: ${osRelease}`);
			}
		}

		sharedLibraryFilename = `tls-client-linux-${prefix}${process.arch === "x64" ? "amd64" : "arm64"}-${libVersion}.so`;
	} else {
		throw new Error("Invalid platform!");
	}

	const libFile = `${__dirname}/../lib/${sharedLibraryFilename}`;
	if (!existsSync(libFile)) {
		throw new Error("Shared library not found!");
	}

	return Library(libFile, {
		request: ["string", ["string"]],
		getCookiesFromSession: ["string", ["string"]],
		addCookiesToSession: ["string", ["string"]],
		freeMemory: ["void", ["string"]],
		destroyAll: ["string", []],
		destroySession: ["string", ["string"]],
	});
}
