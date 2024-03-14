/**
 * @template T
 * @param {T[]} items
 * @returns {T}
 */
export function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}

/**
 * This isn't cryptographically secure, but it doesn't need to be, it needs to be fast.
 * @param {number} length
 * @param {string} alphabet
 * @returns {string}
 */
export function randomBytes(length, alphabet = "abcdef0123456789") {
	if (length <= 0) {
		throw new Error("Invalid length " + length);
	}

	length *= 2;

	let randomString = "";
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * alphabet.length);
		randomString += alphabet.charAt(randomIndex);
	}

	return randomString;
}
