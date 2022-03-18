const User = require('../../../models/User'),
    sha256 = require('../../sha256'),
    CaptchaHandler = require('../../utils/captcha');
function auth(req, res) {
    if (!req.session.passport.user) return res.status(401).json({
        status: 401,
        message: '401 Unauthorized'
    })
    let user = await User.findById(req.session.passport.user).then(user => {
        if (!user) return res.status(400)
    })
    console.log(CaptchaHandler)
    new CaptchaHandler().send({
        captcha: req.body['h-captcha-response'],
        invalid: function () {
            res.status(400).json({
                status: 400,
                message: '400 Bad Request: Invalid Captcha'
            })
        }, next: function () {
            editUserAuth(req.body)
        }
    })
    async function editUserAuth(d) {
        let cur = d['currentPassword']
        if (sha256(cur) === user.password) {
            if (d['newPassword'] === d['confirmNewPassword']) {
                user.password = sha256(d['newPassword'])
                await User.findByIdAndUpdate(req.session.passport.user, user).then(user => {
                    res.status(200).json({
                        status: 200,
                        message: '200 OK Password Changed'
                    })
                })
            } else return res.status(403).json({
                status: 403,
                message: '403 Forbidden: Passwords Do Not Match'
            })
        }
    }
}
module.exports = auth