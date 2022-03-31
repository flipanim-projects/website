const User = require('../../../models/User'),
    sha256 = require('../../sha256'),
    CaptchaHandler = require('../../utils/captcha');
async function auth(req, res) {
    if (!req.session.passport.user) return res.status(401).json({
        status: 401,
        message: '401 Unauthorized'
    })
    let user
    // find the user in the database and set it to user variable to use later
    User.findById(req.session.passport.user).then(async resp => {
        user = resp
        if (sha256(req.body['curPassword']) === user.password) {
            if (req.body['newPassword'] === req.body['confirmNewPassword']) {
                new CaptchaHandler().send({
                    hcaptcha: req.body['h-captcha-response'],
                    invalid: function () {
                        res.status(400).json({
                            status: 400,
                            message: '400 Bad Request: Invalid Captcha'
                        })
                    }, next: function () {
                        editUserAuth()
                    }
                })
            } else return res.status(403).json({
                status: 403,
                message: '403 Forbidden: Passwords Do Not Match'
            });
        } else {
            return res.status(401).json({
                status: 401,
                message: '401 Unauthorized: Invalid Password'
            })
        }
    })

    async function editUserAuth() {
        user.password = sha256(req.body['newPassword'])
        await User.findByIdAndUpdate(req.session.passport.user, user).then(user => {
            res.status(200).json({
                status: 200,
                message: '200 OK Password Changed'
            })
        })
    }
}
module.exports = auth