const User = require('../../models/User')
async function follow(req, res) {
    if (!req.params.userId) return res.status(400).json({
        status: 400,
        message: '400 Bad Request: No id provided'
    })
    console.log(req.body)
    if (req.body.follow === 'true') {
        let user, sent = false
        await User.findById(req.session.passport.user).then(resp => {
            user = resp
            let ifHas = user.following.filter(f => f.id.toString() === req.params.userId)
            if (ifHas.length > 0) {
                sent = true
                return res.status(409).json({
                    status: 409,
                    message: '409 Conflict: Already following'
                })
            }
        })
        if (sent === false) await User.updateOne(
            {
                'name.id': user.name.id.toString()
            }, {
            $push: {
                following: {
                    id: req.params.userId.toString(),
                    name: req.query.name.toString()
                }
            }
        }).then(async () => {
            await User.updateOne(
                {
                    'name.id': req.params.userId.toString()
                }, {
                $push: {
                    followers: {
                        id: user.name.id.toString(),
                        name: user.name.text.toString()
                    }
                }
            }).then(() => {
                if (!res.headersSent) res.status(200).json({
                    status: 200,
                    message: 'Followed'
                })
            }).catch(err => {
                console.error(err)
                if (!res.headersSent) return res.status(500).json({
                    status: 500,
                    message: ('Internal Server Error')
                })
            })
        }).catch(err => {
            console.error(err)
            if (!res.headersSent) return res.status(500).json({
                status: 500,
                message: 'Internal Server Error',
            })
        })
    } else if (req.body.follow === 'false') {
        let user
        await User.findById(req.session.passport.user).then(resp => {
            user = resp
            console.log(user.following, req.params.userId)
            let ifHas = user.following.filter(f => f.id.toString() === req.params.userId.toString())
            console.log(ifHas)
            // If user is not following
            if (ifHas.length < 1) {
                if (!res.headersSent) return res.status(409).json({
                    status: 409,
                    message: '409 Conflict: Not following'
                })
            }
        })
        await User.updateOne(
            {
                'name.id': user.name.id.toString()
            }, {
            $pull: {
                following: {
                    id: req.params.userId.toString()
                }
            }
        }).exec().then(async () => {
            if (!res.headersSent) await User.updateOne({ 'name.id': req.params.userId.toString() }, {
                $pull: {
                    followers: { id: user.name.id }
                }
            }).exec().then(() => {
                res.status(200).json({
                    status: 200,
                    message: 'Unfollowed'
                })
            }).catch(err => {
                console.error(err)
                if (!res.headersSent) return res.status(500).json({
                    status: 500,
                    message: 'Internal Server Error'
                })
            })
        }).catch(err => {
            console.error(err)
            if (!res.headersSent) return res.status(500).json({
                status: 500,
                message: 'Internal Server Error'
            })
        })
    } else {
        if (!res.headersSent) return res.status(400).json({
            status: 400,
            message: '400 Bad Request: No follow value provided'
        })
    }

}
module.exports = follow