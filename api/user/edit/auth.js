const sha256 = require('../../sha256')
const CaptchaHandler = require('../../utils/captcha')
function auth(req, res) {
    if (!req.session.passport.user) return res.status(401).json({
        status: 401,
        message: '401 Unauthorized'
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
            sendToAPI()
        }
    })
}
module.exports = auth