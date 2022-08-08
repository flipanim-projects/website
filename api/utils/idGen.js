module.exports = () => {
	let t = "abcdef1234567890-_",
		e = "";
	for (let n = 0; n < 6; n++) e += t[Math.floor(Math.random() * t.length)];
	return e;
};
