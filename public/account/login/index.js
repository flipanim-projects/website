(function () {
    const $ = document.querySelector.bind(document);
    var sha256 = function l(g) {
        const c = (a, b) => a >>> b | a << 32 - b
        for (var a, d, e = "length", q = "", f = [], r = 8 * g[e], b = l.h = l
            .h || [], m = l.k = l.k || [], n = m[e], s = {}, h = 2; n <
            64; h++)
            if (!s[h]) {
                for (a = 0; a < 313; a += h) s[a] = h;
                b[n] = 4294967296 * Math.pow(h, .5) | 0, m[n++] = 4294967296 *
                    Math.pow(h, 1 / 3) | 0
            } for (g += "\x80"; g[e] % 64 - 56;) g += "\0";
        for (a = 0; a < g[e]; a++) {
            if ((d = g.charCodeAt(a)) >> 8) return;
            f[a >> 2] |= d << (3 - a) % 4 * 8
        }
        for (d = 0, f[f[e]] = r / 4294967296 | 0, f[f[e]] = r; d < f[e];) {
            var i = f.slice(d, d += 16),
                v = b;
            for (a = 0, b = b.slice(0, 8); a < 64; a++) {
                var o = i[a - 15],
                    p = i[a - 2],
                    j = b[0],
                    k = b[4],
                    t = b[7] + (c(k, 6) ^ c(k, 11) ^ c(k, 25)) + (k & b[5] ^ ~
                        k & b[6]) + m[a] + (i[a] = a < 16 ? i[a] : i[a - 16] + (
                            c(o, 7) ^ c(o, 18) ^ o >>> 3) + i[a - 7] + (c(p,
                                17) ^ c(p, 19) ^ p >>> 10) | 0),
                    w = (c(j, 2) ^ c(j, 13) ^ c(j, 22)) + (j & b[1] ^ j & b[2] ^
                        b[1] & b[2]);
                (b = [t + w | 0].concat(b))[4] = b[4] + t | 0
            }
            for (a = 0; a < 8; a++) b[a] = b[a] + v[a] | 0
        }
        for (a = 0; a < 8; a++)
            for (d = 3; d + 1; d--) {
                var u = b[a] >> 8 * d & 255;
                q += (u < 16 ? 0 : "") + u.toString(16)
            }
        return q
    }
    let submit = $('#submit'), login = $('#login');
    let pw = $('#showPassword'), pwi = $('#password');
    let show = 0;
    pw.onclick = () => {
        show ^= 1;
        pw.style.backgroundImage = `url('/public/imgs/icon/icons8-${show ? 'eye' : 'hide'}-96.png')`
        pwi.setAttribute('type', show ? 'text' : 'password')
    }
    let badRequest = { invalidCaptcha() { } }
    submit.onclick = () => {
        login.classList.add('logging-in');
        var payload = {
            username: $('#username').value,
            password: pwi.value,
            // 'h-captcha-response': window.hcaptcha.getResponse()
        }
        let verification = verify(payload)
        if (verification) {
            verification.show();
            return login.classList.remove('logging-in');
        }
        
        payload.password = sha256(payload.password);
        fetch('/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(r => r.json())
            .then(r => {
                if (r.message === "400 Bad Request: Invalid Captcha") badRequest.invalidCaptcha();
                if (r.status === 302) {
                    login.classList.remove('logging-in');
                    login.classList.add('logged-in');
                } else if (r.message === '') { }
            })
    }
    function verify({ username, password }) {
        let not = username ? (password ? false : 'password') : 'username'
        if (not) return new Toast({
            title: `No ${not}`,
            description: `Please enter a ${not}`
        }).init();
        return false
    }
})()