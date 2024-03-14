const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
/** @type {Object<string, number>} */
const CHARSET_MAP = CHARSET.split("").reduce(function (previousValue, currentValue, currentIndex) {
	previousValue[currentValue] = currentIndex;
	return previousValue;
}, {});

const Loader = {
	/**
	 * @param {number[]} numbers
	 * @param {number} srcBase
	 * @param {number} dstBase
	 * @returns {number[]}
	 */
	Process: function (numbers, srcBase, dstBase) {
		/** @type {number[]} */
		const res = [];

		let quotient;
		let remainder;
		while (numbers.length) {
			quotient = [];
			remainder = 0;
			for (let i = 0; i < numbers.length; i++) {
				let accumulator = numbers[i] + remainder * srcBase;
				let digit = (accumulator / dstBase) | 0;
				remainder = accumulator % dstBase;
				if (quotient.length || digit) quotient.push(digit);
			}
			res.push(remainder);
			numbers = quotient;
		}

		return res.reverse();
	},

	/**
	 * @param {string} str
	 * @param {number} srcBase
	 * @param {number} dstBase
	 * @returns {string}
	 */
	Conv: function (str, srcBase, dstBase) {
		const s = srcBase <= 36 ? str.toUpperCase() : str;
		const num = s.split("").map(function (x) {
			return CHARSET_MAP[x];
		});

		return Loader.Process(num, srcBase, dstBase)
			.map(function (x) {
				return CHARSET[x];
			})
			.join("");
	},

	/**
	 * @param {string} str
	 * @returns {string}
	 */
	Split: function (str) {
		let strOut = "";
		for (let x = 0; x < str.length; x += 2) {
			strOut += String.fromCharCode(parseInt(str.substr(x, 2), 16));
		}

		return strOut;
	},

	/**
	 * @param {string} data
	 * @returns {string}
	 */
	DC: function (data) {
		let output = "";
		for (let i = 0; i < data.length; i += 11) {
			const chunk = data.slice(i, i + 11);
			// const len = Math.floor((chunk.length * 6) / 8);
			const y = Loader.Conv(chunk, 62, 16);
			output += Loader.Split(y);
		}

		return output;
	},
};

export default Loader;
