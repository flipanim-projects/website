const passport = require('passport'),
    captchaHandler = require('../utils/captcha');
async function login(req, res, next) {
    // if (!req.body['h-captcha-response']) return res.status(400).json({
    //     status: 400,
    //     message: '400 Bad Request: Invalid Captcha'
    // })
    new captchaHandler().send({
        hcaptcha: req.body['h-captcha-response'],
        invalid: function () {
            res.status(400).json({
                status: 400,
                message: '400 Bad Request: Invalid Captcha'
            })
        }, next: function () {
            console.log('Captcha.')
            auth(req, res, next)
        }
    })
    // configure passport.js to use the local strategy
    let auth = passport.authenticate('local', (err, user, info) => {
        if (info) { return res.send(info) }
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.login(user, (err) => {
            console.log(err)
            return res.status(302).json({
                status: 302,
                message: '302 Found, Redirecting'
            })
        })
    });
}
module.exports = login