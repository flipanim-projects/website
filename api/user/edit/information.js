const User = require('../../../models/User')
let got, formData
import('got').then(data => got = data.got);
import('formdata-node').then(data => formData = data.FormData)
async function information(req, res) {
    if (!req.body['displayName'] && !req.body['bio']) return res.status(400).json({
        status: 400,
        message: '400 Bad Request'
    })
    function invalidCaptcha(res) {
        res.redirect('./settings?error=1')
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
            else editUser()
        })

        let toupdate = { bio: null, name: { display: null } }

        async function editUser() {
            if (req.body['bio']) toupdate.bio = req.body['bio']
            if (req.body['displayName']) toupdate.name.display = req.body['displayName']
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
}
module.exports = information