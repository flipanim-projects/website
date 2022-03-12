let got, formData
import('got').then(data => got = data.got);
import('formdata-node').then(data => formData = data.FormData)
const sha256 = require('../sha256'),
    User = require('../../models/User')
async function createUser(req, res) {
    function invalidCaptcha(res) {
        res.redirect('./create?error=1')
        return
    }
    let hcaptcha = req.body['h-captcha-response']
    if (!hcaptcha) {
        invalidCaptcha(res)
        return;
    } else {
        const form = new formData()
        form.set('secret', '0xC5B6Bd0750C259aa60648bd42Fd44C6974172b31')
        form.set('response', hcaptcha)
        await got.post('https://hcaptcha.com/siteverify', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            form: {
                secret: "0xC5B6Bd0750C259aa60648bd42Fd44C6974172b31",
                response: hcaptcha
            }
        }).json().then(resp => {
            if (resp.success === false) return invalidCaptcha(res)
            else sendToAPI()
        })
    }

    function idGen() {
        let t = "abcdef1234567890-_",
            e = "";
        for (let n = 0; n < 6; n++) e += t[Math.floor(Math.random() * t.length)];
        return e;
    }
    async function sendToAPI() {
        let date = new Date();
        let userOpts =
        {
            "name": { "text": req.body.username, "display": req.body.display, "id": idGen() }, "avatar": false, "stats": {}, "anims": [], "notifications": [{ "title": "Welcome to FlipAnim!", "description": "Placeholder text.", "read": false }], "status": { "name": false, "type": 0 }, "following": [], "followers": [], "preferredTheme": "dark", "password": sha256(req.body.password), "bio": "", "creation": { "unix": Date.now() / 1000, "text": date.toISOString() }
        }
        let check = await User.findOne({
            'name.text': userOpts.name.text
        }).then(fin => {
            if (fin) {
                res.status(409).json({
                    status: 409,
                    message: '409 Username Taken',
                });

            } else {
                let user = new User(userOpts)
                user.save()
                res.redirect('/profile?user=' + userOpts.name.id + '&justCreated=true')
            }
        })
    }
}
module.exports = createUser