const passport = require('passport'),
    captchaHandler = require('../utils/captcha');
async function login(req, res, next) {
    let auth = passport.authenticate('local', (err, user, info) => {
        if (info) { return res.status(400).json(info) }
        if (err) { return res.status(500).json({ status: 500 }) }
        if (!user) { return res.send('No user'); }
        req.login(user, (err) => {
            console.log(err)
            return res.status(302).json({
                status: 302,
                message: '302 Found, Redirecting'
            })
        })
    });
    if (require('../../config').captcha) new captchaHandler().send({
        hcaptcha: req.body['h-captcha-response'],
        invalid: function () {
            res.status(400).json({
                status: 400,
                message: '400 Bad Request: Invalid Captcha'
            })
        }, next: function () {
            auth(req, res, next)
        }
    });
    else auth(req, res, next)
    console.log('Request to login')
}
module.exports = login