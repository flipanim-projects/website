const sha256 = require('../sha256')
async function editUser(req, res) {
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
            else authUser()
        })
        let fields = checkFields()
        if (!fields) return res.status(400).json({
            status: 400,
            message: '400 Bad Request'
        })
        /**If the user is trying to change username
         * or password, make sure they authenticate
         */
        if (fields.includes['username']) authUser()
        else if (fields.includes['password']) authUser()
        else editUser()
        let toupdate
        async function authUser() {
            let password = req.body['password']
            function noPass() {
                res.status(401).json({
                    status: 401,
                    message: '401 Unauthorized: You need to enter current password to update your user'
                });
            }
            if (!req.body['currentPassword']) {
                noPass();
            }
            await User.findOne({
                '_id': req.session.passport.user
            }).then(user => {
                if (!user) return noPass()
                if (req.isAuthenticated() && sha256(password) === user.password) {
                    toupdate = user
                    return editUser()
                }
                else return noPass
            }).catch(err => {
                console.error(err)
            })
        }
        async function editUser() {
            let oldusername = toupdate.name.text
            if (req.body['bio']) toupdate.bio = req.body['bio']
            if (req.body['status']) toupdate.status = req.status['status']
            if (req.body['displayName']) toupdate.name.display = req.body['displayName']
            await User.findOneAndUpdate({ 'name.text': oldusername }, toupdate).then(arg => {
                console.log(arg)
            })
        }
        function checkFields() {
            let allowed = ['name', 'password', 'avatarID', 'bio', 'status']
            let has = []
            for (const param of req.body) {
                if (!allowed.includes(req.body[param])) return false
                else if (allowed.includes(req.body[param])) has.push(param)
            }
            return has
        }
    }
}
module.exports = editUser