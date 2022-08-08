module.exports = function r(t) {
	function n(r, t) {
		return (r >>> t) | (r << (32 - t));
	}
	for (
		var o,
			e,
			f = Math.pow,
			h = f(2, 32),
			a = "",
			l = [],
			g = 8 * t.length,
			c = (r.h = r.h || []),
			i = (r.k = r.k || []),
			u = i.length,
			v = {},
			s = 2;
		u < 64;
		s++
	)
		if (!v[s]) {
			for (o = 0; o < 313; o += s) v[o] = s;
			(c[u] = (f(s, 0.5) * h) | 0), (i[u++] = (f(s, 1 / 3) * h) | 0);
		}
	for (t += ""; (t.length % 64) - 56; ) t += "\0";
	for (o = 0; o < t.length; o++) {
		if ((e = t.charCodeAt(o)) >> 8) return;
		l[o >> 2] |= e << (((3 - o) % 4) * 8);
	}
	for (l[l.length] = (g / h) | 0, l[l.length] = g, e = 0; e < l.length; ) {
		var k = l.slice(e, (e += 16)),
			d = c;
		for (c = c.slice(0, 8), o = 0; o < 64; o++) {
			var p = k[o - 15],
				w = k[o - 2],
				A = c[0],
				C = c[4],
				M =
					c[7] +
					(n(C, 6) ^ n(C, 11) ^ n(C, 25)) +
					((C & c[5]) ^ (~C & c[6])) +
					i[o] +
					(k[o] =
						o < 16
							? k[o]
							: (k[o - 16] +
									(n(p, 7) ^ n(p, 18) ^ (p >>> 3)) +
									k[o - 7] +
									(n(w, 17) ^ n(w, 19) ^ (w >>> 10))) |
							  0);
			(c = [
				(M +
					((n(A, 2) ^ n(A, 13) ^ n(A, 22)) +
						((A & c[1]) ^ (A & c[2]) ^ (c[1] & c[2])))) |
					0,
			].concat(c))[4] = (c[4] + M) | 0;
		}
		for (o = 0; o < 8; o++) c[o] = (c[o] + d[o]) | 0;
	}
	for (o = 0; o < 8; o++)
		for (e = 3; e + 1; e--) {
			var S = (c[o] >> (8 * e)) & 255;
			a += (S < 16 ? 0 : "") + S.toString(16);
		}
	return a;
};
