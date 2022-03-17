const sha256 = require('../sha256'),
    User = require('../../models/User'),
    CaptchaHandler = require('../utils/captcha')
async function createUser(req, res) {
    new CaptchaHandler({
        hcaptcha: req.body['h-captcha-response'],
        invalid: function () {
            res.status(400).json({
                status: 400,
                message: '400 Bad Request: Invalid Captcha'
            })
        }, next: function () {
            sendToAPI()
        }
    })

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
            "name": { "text": req.body.username.toLowerCase(), "display": req.body.display, "id": idGen() }, "avatar": false, "stats": {}, "anims": [], "notifications": [{ "title": "Welcome to FlipAnim!", "description": "Placeholder text.", "read": false }], "status": { "name": false, "type": 0 }, "following": [], "followers": [], "preferredTheme": "dark", "password": sha256(req.body.password), "bio": "", "creation": { "unix": Date.now() / 1000, "text": date.toISOString() }
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