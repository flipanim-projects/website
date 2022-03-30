const User = require('../../../models/User'),
    CaptchaHandler = require('../../utils/captcha')
async function information(req, res) {
    if (!req.body['displayName'] && !req.body['bio']) return res.status(400).json({
        status: 400,
        message: '400 Bad Request: No data provided'
    })

    let hcaptcha = req.body['h-captcha-response']
    new CaptchaHandler().send({
        hcaptcha: hcaptcha,
        invalid: function () {
            res.status(400).json({
                status: 400,
                message: '400 Bad Request: Invalid Captcha'
            })
        }, next: function () {
            editUser()
        }
    })

    let toupdate = req.user

    async function editUser() {
        req.body['bio'] ? toupdate.bio = req.body['bio'] : null
        if (req.body['displayName']) toupdate.name.display = req.body['displayName']
        if (req.body['theme']) toupdate.preferences.theme = req.body['theme']
        await User.findByIdAndUpdate(req.session.passport.user, toupdate).then(() => {
            res.status(200).json({
                status: 200,
                message: "200 OK User Updated"
            })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({
                status: 500,
                message: "Internal Server Error"
            })
        })
    }

}
module.exports = information