const User = require('../../models/User')
async function follow(req, res) {
    if (!req.params.userId) return res.status(400).json({
        status: 400,
        message: '400 Bad Request: No id provided'
    })
    console.log(req.body)
    if (req.body.follow === 'true') {
        let user
        await User.findById(req.session.passport.user).then(resp => {
            user = resp
            if (resp.following.includes(req.params.userId)) {
                return res.status(409).json({
                    status: 409,
                    message: '409 Conflict: Already following'
                })
            }
        })
        await User.updateOne(
            {
                'name.id': user.name.id.toString()
            }, {
            $push: {
                following: req.params.userId.toString()
            }
        }).then(async () => {
            await User.updateOne({ 'name.id': req.params.userId.toString() }, { $push: { followers: user.name.id } }).then(() => {
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
            if (!resp.following.includes(req.params.userId)) {
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
                following: req.params.userId.toString()
            }
        }).exec().then(async () => {
            if (!res.headersSent) await User.updateOne({ 'name.id': req.params.userId.toString() }, { $pull: { followers: user.name.id } }).exec().then(() => {
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
            if (!res.headersSent)return res.status(500).json({
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