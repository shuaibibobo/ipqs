import {DateTime} from "luxon";
import * as constants from "../constants.js";
import * as utils from "../utils.js";
import murmurHash3 from "murmurhash3js";
import getGPU from "./getGPU.js";
import request from "../request.js";
import queryString from "query-string";

/**
 * @see https://github.com/IPQualityScore/NodeJSIPQSDeviceTracker/blob/main/src/util/domManipulation.ts
 * @param {string} ipqsPublicKey
 * @param {Map<string, string>} store
 * @param {string} ipqsTracker
 * @param {string} ipqsDomain
 * @param {import("https-proxy-agent").HttpsProxyAgent|undefined} proxyAgent
 * @param {DateTime} tz
 * @param {string} userAgent
 * @returns {Promise<{udid: number, cookies: string, response: IPQSResponse}|null>}
 */
export async function sendTelemetry({
	ipqsPublicKey,
	store = new Map(),
	ipqsTracker = "*",
	ipqsDomain = "www.ipqualityscore.com",
	proxyAgent = undefined,

	tz = DateTime.local().setZone("America/Chicago"),
	userAgent = constants.USER_AGENT,
}) {
	const udidResp = await request("https://fn.us.ipqscdn.com/udid/udid.json", {
		method: "GET",
		headers: {
			"User-Agent": userAgent,
		},
		agent: proxyAgent,
	});
	if (!udidResp.ok) {
		throw new Error("Couldn't get session ID: " + (await udidResp.text()));
	}
	const {udid} = await udidResp.json();

	const storeValues = [];
	for (const item of store.entries()) {
		const [key, value] = item;
		storeValues.push(`{"key":"${key}","value":"${value}"}`);
	}

	const rendererName = getGPU();

	const payload = {
		// Storage.Runnable.length === 0 && Storage.Triggers.length === 0
		// fast: "1",

		// document.addEventListener("mousemove", myListener1, false);
		dtcu: "mousemove",

		// document.addEventListener("mousedown", myListener2, false);
		dtcv: "mousedown",

		// document.addEventListener("keydown", myListener3, false);
		dtcw: "keydown",

		// document.addEventListener("scroll", myListener4, false);
		dtcx: "scroll",

		// document.addEventListener("ontouchstart", myListener5, false);
		// dtcy: "ontouchstart",

		// document.addEventListener("ontouchmove", myListener6, false);
		// dtcz: "ontouchmove",

		// Startup.Store("website_section", "claim_free_proxies");
		// dta: ["{\"key\":\"website_section\",\"value\":\"example\"}"],
		dta: storeValues,

		// https://fn.us.ipqscdn.com/udid/udid.json
		// ipqsd: "268703392770040200",
		ipqsd: udid,

		// navigator.userAgent
		dtb: userAgent,

		// navigator.language / navigator.userLanguage / navigator.browserLanguage / navigator.systemLanguage
		dtc: "en-US",

		// screen.colorDepth or -1
		dtd: 24,

		// window.devicePixelRatio
		dte: 1.25,

		// window.navigator.hardwareConcurrency
		dtf: 6,

		// [screen.width, screen.height] (reversed for mobile)
		dtg: "[1920,1080]",

		// [screen.availWidth, screen.availHeight]
		dth: "[1920,1050]",

		// new Date().getTimezoneOffset();
		dti: -tz.offset,

		// HasSessionStorage
		dtj: 1,

		// HasLocalStorage
		dtk: 1,

		// HasIndexedDB
		dtl: 1,

		// navigator.cpuClass or "unknown"
		dtn: "unknown",

		// navigator.platform or "unknown"
		dto: "Win32",

		// navigator.doNotTrack / navigator.msDoNotTrack / window.doNotTrack
		dtp: "1",

		// navigator.plugins
		dtq: ['{"name":"PDF Viewer","description":"Portable Document Format","filename":"internal-pdf-viewer"}', '{"name":"Chrome PDF Viewer","description":"Portable Document Format","filename":"internal-pdf-viewer"}', '{"name":"Chromium PDF Viewer","description":"Portable Document Format","filename":"internal-pdf-viewer"}', '{"name":"Microsoft Edge PDF Viewer","description":"Portable Document Format","filename":"internal-pdf-viewer"}', '{"name":"WebKit built-in PDF","description":"Portable Document Format","filename":"internal-pdf-viewer"}'],

		// Canvas x64hash128
		dtr: utils.randomBytes(16),

		// WebGL
		// MAX_VIEWPORT_DIMS
		dtxv: "[32767, 32767]",
		// MAX_TEXTURE_SIZE
		dtyv: 16384,
		// MAX_TEXTURE_IMAGE_UNITS
		dtyvu: 16,
		// MAX_FRAGMENT_UNIFORM_VECTORS
		dtyvv: 1024,
		// MAX_VARYING_VECTORS
		dtyvm: 30,
		// ALIASED_POINT_SIZE_RANGE
		dtyvp: "[1, 1024]",
		// ALIASED_LINE_WIDTH_RANGE
		dtyvw: "[1, 1]",
		// UNMASKED_RENDERER_WEBGL
		dts: rendererName,
		// [
		//     "data:image/png;base64,iVBO...",
		//     "extensions:ANGLE_instanced_arrays;EXT_blend_minmax;EXT_color_buffer_half_float;EXT_disjoint_timer_query;EXT_float_blend;EXT_frag_depth;EXT_shader_texture_lod;EXT_texture_compression_bptc;EXT_texture_compression_rgtc;EXT_texture_filter_anisotropic;EXT_sRGB;KHR_parallel_shader_compile;OES_element_index_uint;OES_fbo_render_mipmap;OES_standard_derivatives;OES_texture_float;OES_texture_float_linear;OES_texture_half_float;OES_texture_half_float_linear;OES_vertex_array_object;WEBGL_color_buffer_float;WEBGL_compressed_texture_s3tc;WEBGL_compressed_texture_s3tc_srgb;WEBGL_debug_renderer_info;WEBGL_debug_shaders;WEBGL_depth_texture;WEBGL_draw_buffers;WEBGL_lose_context;WEBGL_multi_draw",
		//     "webgl aliased line width range:[1, 1]",
		//     "webgl aliased point size range:[1, 1024]",
		//     "webgl alpha bits:8",
		//     "webgl antialiasing:yes",
		//     "webgl blue bits:8",
		//     "webgl depth bits:24",
		//     "webgl green bits:8",
		//     "webgl max anisotropy:16",
		//     "webgl max combined texture image units:32",
		//     "webgl max cube map texture size:16384",
		//     "webgl max fragment uniform vectors:1024",
		//     "webgl max render buffer size:16384",
		//     "webgl max texture image units:16",
		//     "webgl max texture size:16384",
		//     "webgl max varying vectors:30",
		//     "webgl max vertex attribs:16",
		//     "webgl max vertex texture image units:16",
		//     "webgl max vertex uniform vectors:4095",
		//     "webgl max viewport dims:[32767, 32767]",
		//     "webgl red bits:8",
		//     "webgl renderer:WebKit WebGL",
		//     "webgl shading language version:WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)",
		//     "webgl stencil bits:0",
		//     "webgl vendor:WebKit",
		//     "webgl version:WebGL 1.0 (OpenGL ES 2.0 Chromium)",
		//     "webgl unmasked vendor:Google Inc. (NVIDIA)",
		//     "webgl unmasked renderer:ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Ti (0x00002486) Direct3D11 vs_5_0 ps_5_0, D3D11)",
		//     "webgl vertex shader high float precision:23",
		//     "webgl vertex shader high float precision rangeMin:127",
		//     "webgl vertex shader high float precision rangeMax:127",
		//     "webgl vertex shader medium float precision:23",
		//     "webgl vertex shader medium float precision rangeMin:127",
		//     "webgl vertex shader medium float precision rangeMax:127",
		//     "webgl vertex shader low float precision:23",
		//     "webgl vertex shader low float precision rangeMin:127",
		//     "webgl vertex shader low float precision rangeMax:127",
		//     "webgl fragment shader high float precision:23",
		//     "webgl fragment shader high float precision rangeMin:127",
		//     "webgl fragment shader high float precision rangeMax:127",
		//     "webgl fragment shader medium float precision:23",
		//     "webgl fragment shader medium float precision rangeMin:127",
		//     "webgl fragment shader medium float precision rangeMax:127",
		//     "webgl fragment shader low float precision:23",
		//     "webgl fragment shader low float precision rangeMin:127",
		//     "webgl fragment shader low float precision rangeMax:127",
		//     "webgl vertex shader high int precision:0",
		//     "webgl vertex shader high int precision rangeMin:31",
		//     "webgl vertex shader high int precision rangeMax:30",
		//     "webgl vertex shader medium int precision:0",
		//     "webgl vertex shader medium int precision rangeMin:31",
		//     "webgl vertex shader medium int precision rangeMax:30",
		//     "webgl vertex shader low int precision:0",
		//     "webgl vertex shader low int precision rangeMin:31",
		//     "webgl vertex shader low int precision rangeMax:30",
		//     "webgl fragment shader high int precision:0",
		//     "webgl fragment shader high int precision rangeMin:31",
		//     "webgl fragment shader high int precision rangeMax:30",
		//     "webgl fragment shader medium int precision:0",
		//     "webgl fragment shader medium int precision rangeMin:31",
		//     "webgl fragment shader medium int precision rangeMax:30",
		//     "webgl fragment shader low int precision:0",
		//     "webgl fragment shader low int precision rangeMin:31",
		//     "webgl fragment shader low int precision rangeMax:30"
		// ].join("~") → x64hash128
		dtt: utils.randomBytes(16),

		// Testing for adblocker? Injects a DOM element with the ".adsbox" class and checks the offsetHeight
		dtu: false,

		// navigator.languages
		dtls: ['"en-US"', '"en"'],
		// navigator.languages[0].substr(0, 2) !== navigator.language.substr(0, 2)
		dtv: false,

		// screen.width < screen.availWidth || screen.height < screen.availHeight
		dtw: false,

		// Checks for mobile(?) & Storage.Variables.dtx === undefined
		dtx: false,
		dty: false,

		// Storage.Variables.dtz = `[${maxTouchPoints},${touchEvent ? "true" : "false"},${touchStart ? "true" : "false"}]`
		dtz: "[0,false,false]",

		// Fonts
		// dtaa: `["Arial","Arial Black","Times New Roman","Clarendon","Franklin Gothic","MS Outlook","MYRIAD PRO","Minion Pro","Pristina","Adobe Fangsong Std","Adobe Ming Std","after 45'","Agency FB","Arial Narrow","Bailey'sCar","Baskerville","Baskerville Old Face","Bauhaus 93","Bernard MT Condensed","Bodoni MT","Book Antiqua","Bookman Old Style","Bookshelf Symbol 7","Brush Script MT","Cambria","Centaur","Century Gothic","Century Schoolbook","Colonna MT","Comic Sans MS","Courier","Courier New","Dad's Recipe","DingDong Signs o' the Times","Ebrima","Engravers' Gothic BT","Footlight MT Light","Forte","Franklin Gothic Medium","French Script MT","Garamond","Georgia","Haettenschweiler","Helvetica","Impact","Informal Roman","Kozuka Gothic Pr6N","Lato","Lucida Console","Lucida Grande","Lucida Handwriting","Lucida Sans","Lucida Sans Typewriter","Marlett","Microsoft Himalaya","Microsoft JhengHei","Microsoft Sans Serif","Microsoft YaHei","Mini Pics L'il Edibles Regular","Mistral","Monaco","Monotype Corsiva","Montserrat","MS PGothic","MS Reference Specialty","MS Serif","MS UI Gothic","MT Extra","NSimSun","Open Sans","Palatino Linotype","Papyrus","Roboto","Rockwell","Segoe UI","Segoe UI Historic","SimSun","Source Sans Pro","Sylfaen","Symbol","Tahoma","Tempus Sans ITC","Trebuchet MS","Tw Cen MT","Verdana","Webdings","Wide Latin'","Wingdings","Nirmala UI","Leelawadee UI","Sitka Display","Bebas Neue","Adobe Naskh Medium","OCR A Std"]`,
		dtaa: JSON.stringify(["Arial", "Arial Black", "Times New Roman", "Franklin Gothic", "after 45'", "Arial Narrow", "Bailey'sCar", "Cambria", "Comic Sans MS", "Courier", "Courier New", "Dad's Recipe", "DingDong Signs o' the Times", "Ebrima", "Engravers' Gothic BT", "Franklin Gothic Medium", "Georgia", "Helvetica", "Impact", "Lucida Console", "Marlett", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft Sans Serif", "Microsoft YaHei", "Mini Pics L'il Edibles Regular", "MS PGothic", "MS Serif", "MS UI Gothic", "NSimSun", "Palatino Linotype", "Segoe UI", "Segoe UI Historic", "SimSun", "Sylfaen", "Symbol", "Tahoma", "Trebuchet MS", "Verdana", "Webdings", "Wide Latin'", "Wingdings", "Nirmala UI", "Leelawadee UI", "Sitka Display"]),

		// document.cookie !== undefined → Storage.Variables.dtbb = document.cookie
		dtbb: "",

		// navigator.mediaDevices.enumerateDevices
		dtkk: "devices",
		dtsp: "microphone",
		dtsv: "webcam",
		dtsps: "speaker",

		// window.navigator.cookieEnabled
		dtee: true,

		// Checks for common browser automation telltale (e.g. window.webdriver)
		dtgg: false,

		// window.innerWidth x window.innerHeight
		dthh: "1536x770",
		// window.innerWidth x window.innerHeight but also use documentElement or getElementsByTagName("body")
		dthhB: "1536x770",

		// window.navigator.onLine
		dtxx: true,

		// Checks for mobile "ontouchstart" or window.orientation
		dtyy: false,

		// TODO: IndexedDB stuff
		dtii: [
			// "\"JqfD7NejgP-1704080429\"",
			// "\"JqfFjcpjWp-1704080465\"",
			// "\"JqfGEExNOW-1704080471\"",
			// "\"JqfamrGTLa-1704080750\"",
			// "\"Jqfcs8zk8O-1704080778\"",
			// "\"JqfhcOUyFd-1704080842\"",
			// "\"JqgiyWAxxg-1704081700\"",
			// "\"JqgjbGQCCB-1704081709\"",
			// "\"JqgkZTecUA-1704081722\"",
			// "\"JqgrbcJyfG-1704081817\"",
			// "\"JqgzOAhWHQ-1704081923\"",
		],

		// top != window
		dtrr: false,

		// document.hidden
		dtss: false,

		// navigator.javaEnabled()
		dtqq: false,

		// "not an object" = "s"
		// "TypeError: Cannot read properties of undefined (reading 'width')" = "c"
		// "e is undefined" = "f"
		// "Unable to get property 'width' of undefined or null reference" = "e" or "i"
		dttt: "c",

		// opera = "o"
		// firefox = "f" (typeof InstallTrigger)
		// internet explorer(?) = "i" (document.documentMode)
		// ??? = "e" (window.StyleMedia)
		// chrome = "c" (!!window.chrome && !!window.chrome.webstore)
		// default = false
		dtuu: false,

		// DPI
		dtdp: 120,

		// new Intl.DateTimeFormat().resolvedOptions()
		dtdt: `{"locale":"en-US","calendar":"gregory","numberingSystem":"latn","timeZone":"${tz.zoneName}","year":"numeric","month":"numeric","day":"numeric"}`,

		// window.navigator.deviceMemory
		dtme: 8,

		// window.openDatabase (WebSQL / Apache Cordova)
		// dtm: undefined,

		// document.body.addBehavior (Internet Explorer)
		// dtnn: undefined,

		// A bunch of window.matchMedia rules including :
		// (-webkit-transform-3d) = "3d:y"
		// (-webkit-transform-2d) = "2d:y"
		// (prefers-color-scheme: light) = "pcs:l"
		// (prefers-color-scheme: dark) = "pcs:d"
		// (prefers-color-scheme: no-preference) = "pcs:n"
		// (color-gamut: srgb) = "cg:srgb"
		// (color-gamut: p3) = "cg:p3"
		// (color-gamut: rec2020) = "cg:rec"
		// (pointer: fine) = "p:f"
		// (pointer: coarse) = "p:c"
		// (pointer: none) = "p:n"
		// (hover: none) = "h:n"
		// (hover: hover) = "h:h"
		// (inverted-colors:none) = "ic:n"
		// (inverted-colors:inverted) = "ic:i"
		// (display-mode:fullscreen) = "dm:f"
		// (display-mode:standalone) = "dm:s"
		// (display-mode:minimal-ui) = "dm:m"
		// (display-mode:browser) = "dm:b"
		// (prefers-reduced-motion:no-preference) = "prm:n"
		// (prefers-reduced-motion:reduce) = "prm:r"
		// (forced-colors:active) = "fc:a"
		// (forced-colors:none) = "fc:n"
		// (dynamic-range:standard) = "dr:s"
		// (dynamic-range:high) = "dr:h"
		// (min-monochrome: 0) = "mo:0"
		// (min-monochrome: 8) = "mo:8"
		// (min-monochrome: 12) = "mo:12"
		// (prefers-contrast:no-preference) = "pc:n"
		// (prefers-contrast:more) = "pc:m"
		// (prefers-contrast:less) = "pc:l"
		dtcm: '["3d:y","pcs:d","cg:srgb","p:f","h:h","dm:b","prm:n","fc:n","dr:s","mo:0","pc:n"]',

		// Test for 12hr or 24hr time
		dtam: "12",

		// video.canPlayType:
		// "ogg": 'video/ogg; codecs="theora"',
		// "ogg2": 'video/ogg;codecs="theora, vorbis"',
		// "h264": 'video/mp4; codecs="avc1.42E01E"',
		// "webm": 'video/webm; codecs="vp8, vorbis"',
		// "3gpp": 'video/3gpp;codecs="mp4v.20.8, samr"',
		// "vp9": 'video/webm; codecs="vp9"',
		// "hls": 'application/x-mpegURL; codecs="avc1.42E01E"',
		// "flac": "audio/ogg;codecs=flac",
		// "mp3": "audio/mpeg",
		// "aif": "audio/x-aiff",
		// "mp4": 'audio/mp4; codecs="mp4a.40.5"',
		// "aac": 'audio/mp4; codecs="mp4a.40.2"',
		dtcd: '["webm","h264","ogg","ogg2","vp9","mp3","mp4","aac","flac"]',

		// speechSynthesis.getVoices()
		dtsl: '["Microsoft David - English (United States)en-US","Microsoft Mark - English (United States)en-US","Microsoft Zira - English (United States)en-US","Google Deutschde-DE","Google US Englishen-US","Google UK English Femaleen-GB","Google UK English Maleen-GB","Google españoles-ES","Google español de Estados Unidoses-US","Google françaisfr-FR","Google हिन्दीhi-IN","Google Bahasa Indonesiaid-ID","Google italianoit-IT","Google 日本語ja-JP","Google 한국의ko-KR","Google Nederlandsnl-NL","Google polskipl-PL","Google português do Brasilpt-BR","Google русскийru-RU","Google 普通话（中国大陆）zh-CN","Google 粤語（香港）zh-HK","Google 國語（臺灣）zh-TW"]',

		// navigator.connection
		dtct: '{"downlink":10,"effectiveType":"4g","rtt":50,"saveData":false}',

		// CanvasRenderingContext2D.prototype.getImageData benchmark???
		dtfc: 0,

		// stringToHash → getClientRects()
		dtfr: 1778683805,

		// Speach stuff concat and hashed → StringToHash
		dtsss: 2009936189,

		// fullScreenProperties = [
		//  "fullscreen",
		//  "fullscreenEnabled",
		//  "fullscreenElement",
		//  "onfullscreenchange",
		//  "onfullscreenerror",
		//  "exitFullscreen",
		//  "onwebkitfullscreenchange",
		//  "onwebkitfullscreenerror",
		//  "webkitCancelFullScreen",
		//  "webkitCurrentFullScreenElement",
		//  "webkitExitFullscreen",
		//  "webkitFullscreenElement",
		//  "webkitFullscreenEnabled",
		//  "webkitIsFullScreen",
		//  "mozFullScreen",
		//  "mozFullScreenEnabled",
		//  "mozFullScreenElement",
		//  "onmozfullscreenchange",
		//  "onmozfullscreenerror",
		//  "mozCancelFullScreen",
		//  "msFullscreenEnabled",
		//  "msFullscreenElement",
		//  "msRequestFullscreen",
		//  "msExitFullscreen",
		//  "onMSFullscreenChange",
		//  "onMSFullscreenError",
		// ] → StringToHash
		dtsfs: -38050382,

		// Does this work?: document.createElement("canvas").getContext("webgl2");
		dtfl: true,

		// Zoom checking?
		dtsc: "z14",

		// JavaScript engine checks via math
		dtmt: 1106224042,

		// x64hash128 a bunch of values to create a visitor id
		// [
		//     "dtb",
		//     "dtc",
		//     "dtd",
		//     "dte",
		//     "dtf",
		//     "dtg",
		//     "dth",
		//     "dti",
		//     "dtj",
		//     "dtk",
		//     "dtl",
		//     "dtnn",
		//     "dtm",
		//     "dtn",
		//     "dto",
		//     "dtp",
		//     "dtq",
		//     "dtr",
		//     "dtt",
		//     "dtu",
		//     "dtv",
		//     "dtw",
		//     "dtx",
		//     "dty",
		//     "dtz",
		//     "dtaa",
		//     "dtqq"
		// ].join("~~~")
		dtoo: "71d7514e64cdaf71bc2eaa0361386c3e",

		// battery.level != 1 || battery.charging != true
		dtff: true,

		// Checks for permission for the follows values:
		// [
		//     "accelerometer",
		//     "accessibility",
		//     "ambient-light-sensor",
		//     "camera",
		//     "clipboard-read",
		//     "clipboard-write",
		//     "geolocation",
		//     "gyroscope",
		//     "background-sync",
		//     "magnetometer",
		//     "microphone",
		//     "midi",
		//     "notifications",
		//     "payment-handler",
		//     "persistent-storage",
		//     "push",
		// ]
		dtpc: '["accelerometer","clipboard-write","gyroscope","background-sync","magnetometer","midi","payment-handler"]',

		// AudioContext hash
		dtll: utils.randomBytes(16),

		// WebRTC leak
		dtmm: "",
	};

	payload.dtoo = murmurHash3.x64.hash128([payload.dtb, payload.dtc, payload.dtd, payload.dte, payload.dtf, payload.dtg, payload.dth, payload.dti, payload.dtj, payload.dtk, payload.dtl, payload.dtnn, payload.dtm, payload.dtn, payload.dto, payload.dtp, payload.dtq, payload.dtr, payload.dtt, payload.dtu, payload.dtv, payload.dtw, payload.dtx, payload.dty, payload.dtz, payload.dtaa, payload.dtqq].join("~~~"));

	const submitResp = await request(`https://${ipqsDomain}/api/${ipqsTracker}/${ipqsPublicKey}/learn/fetch`, {
		method: "POST",
		compress: true,
		body: queryString.stringify(payload, {
			arrayFormat: "bracket",
			encode: true,
		}),
		headers: {
			"Accept": "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			"Content-type": "application/x-www-form-urlencoded",
			"DNT": "1",
			"Origin": "https://www.ipqualityscore.com",
			"Referer": "https://www.ipqualityscore.com/",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-site",
			"User-Agent": userAgent,
			"sec-ch-ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": '"Windows"',
			"sec-gpc": "1",
		},
		agent: proxyAgent,
	});

	if (!submitResp.ok) {
		throw new Error("Submission error: " + (await submitResp.text()));
	}

	const rawContent = await submitResp.text();
	if (rawContent.substring(0, 1) !== "{") {
		// const ts = new Date().getTime();

		// return {
		// 	udid,
		// 	// cookies: `fingerprint_${ts}=${payload.dtoo}-${ts}; expires=${new Date(2032, 12, 31).toUTCString()}; path=/`,
		// 	cookies: `fingerprint_${ts}=${payload.dtoo}-${ts}`,
		// };

		// console.log("Failed, empty response!", rawContent);

		return null;
	} else {
		/** @type {IPQSResponse} */
		const content = JSON.parse(rawContent);
		// console.log("[!!!] content:", content);

		return {
			udid,
			cookies: `device_id_${content.time}=${content.request_id}-${content.time}`,
			response: content,
		};
	}
}

/**
 * @link https://www.ipqualityscore.com/documentation/device-fingerprint-api/overview
 * @typedef {Object} IPQSResponse
 * @property {"Success"} message
 * @property {boolean} success Status of the request.
 * @property {string} device_id The Device ID is generated as a hash from the user's device hardware and personal settings. This value can be used for tracking users, detecting duplicate accounts, or passed to our callback endpoint for confirmation (e.g. "5509247ee6eb5d67161fb62c585738d7746a4ef56dc9bc44db0483862f8397a3")
 * @property {string} guid Hardware tracking ID which uses a different algorithm for calculating a hash of the user's device. This value can overlap with other devices that share the same hardware configuration. Please use in conjunction with "guid_confidence" (e.g. "c058dae6f6ec75d5815c11aaf780da092859d0304f119ef2d6ecf20e250d07cd")
 * @property {number} guid_confidence Accuracy of the "guid" match which associates a GUID hardware profile with other users, where 0 = not likely, 100 = very likely. A result of 100 is a guaranteed match. Confidence levels below 100 use an intelligent "best guess" approach. Some "guid" results may overlap users, such as a device with factory settings for popular devices.
 * @property {number} fraud_chance How likely this device is to commit fraud or engage in abusive behavior. 0 = not likely, 100 = very likely. 25 is the median result. Fraud Scores >= 85 are suspicious, but not necessarily fraudulent. We recommend flagging or blocking traffic with Fraud Scores >= 90, but you may find it beneficial to use a higher or lower threshold (e.g. 100)
 * @property {boolean} is_crawler Is this device associated with being a confirmed crawler from a mainstream search engine such as Googlebot, Bingbot, Yandex, etc.
 * @property {"Residential"|"Mobile"|"Corporate"|"Data Center"|"Education"|null} connection_type
 * @property {boolean} proxy Returns true if the lookup is on a Proxy, VPN, or Tor connection.
 * @property {boolean} vpn 	Is this IP suspected of being a VPN connection? (proxy will always be true if this is true)
 * @property {boolean} tor 	Is this IP suspected of being a Tor connection? (proxy will always be true if this is true)
 * @property {string} active_vpn Identifies active VPN connections used by popular VPN services and private VPN servers.
 * @property {string} active_tor Identifies active TOR exits on the TOR network.
 * @property {string} recent_abuse This value will indicate if there has been any recently verified abuse across our network for this user. Abuse could be a confirmed chargeback, compromised device, fake app install, or similar malicious behavior within the past few days.
 * @property {string} bot_status Indicates if this device is a bot, spoofed device, or non-human request. Provides stronger confidence in decision-making.
 * @property {string} ssl_fingerprint TLS fingerprint (e.g. "4b54d79e576a9fae619a85f1736b6252adf19a6a900c4ca70d8ad4de7c2dc55c")
 * @property {string} high_risk_device Indicates devices with a high confidence of fraudulent activity including emulators, virtual devices, location spoofing, and automated behavior.
 * @property {string} isp Internet Service Provider of the IP address. If unavailable, then "N/A" (e.g. "Comcast Cable")
 * @property {string|null} country ISO 3166-1 alpha-2 country code (e.g. "GB")
 * @property {string|null} city City (e.g. "London")
 * @property {string|null} region (e.g. "England")
 * @property {string} timezone Timezone of IP address if available or "N/A" if unknown (e.g. "Europe/London")
 * @property {string} mobile Is this a mobile device?
 * @property {string} operating_system Operating system name and version or "N/A" if unknown (e.g. "Windows 10")
 * @property {string} browser Browser name and version or "N/A" if unknown (e.g. "Chrome 120.0")
 * @property {string} brand Brand name of the device or "N/A" if unknown (e.g. "N/A")
 * @property {string} model Model name of the device or "N/A" if unknown (e.g. "N/A")
 * @property {string} ip_address The IP Address associated with the device in IPv4 or IPv6 format.
 * @property {boolean} unique Returns false if this device ID has been seen on multiple IP addresses. Returns true if we haven't seen this ID on multiple IPs.
 * @property {string} canvas_hash A hash of the user's Canvas profile, calculated by the graphics card and other device hardware. This value is often not unique, so should not be used to identify a specific user (e.g. "c0f4f0816e79bbacfcb32289c0d1a3d4af6193fe30b3844c03e6d3534854d2f8")
 * @property {string} webgl_hash A hash of the user's WebGL profile, calculated by the graphics card and other device hardware. This value is often not unique, so should not be used to identify a specific user (e.g. "624ab4a35881c4a9ec4a83ff392450579d5836e28955edebdbed144bd53f404f")
 * @property {string} request_id A unique identifier for this request that can be used to look up the request details, interact with our API reports, or send a postback conversion notice (e.g. "Jrm7bw9ScS")
 * @property {string} click_date Time of this request (e.g. "2024-01-01 14:44:48")
 * @property {string} first_seen Time of this request (e.g. "2024-01-01 14:44:48")
 * @property {string} last_seen Time of the most recent request (e.g. "2024-01-01 14:44:48")
 * @property {number} time Request in epoch time (e.g. 1704138288)
 */
