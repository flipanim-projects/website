const User = require('../../../models/User')

async function get(req, res) {
    if (!req.isAuthenticated()) return res.status(401).json({
        status: 401,
        message: '401 Unauthorized: User not logged in'
    })

    User.findOne({ 'name.id': req.params.userId }).then(user => {
        if (!user) return res.status(404).json({
            status: 404,
            message: '404 Not Found: User not found'
        })
        User.find({
            'name.id': { $in: user.followers }
        }).then(users => {
            let tosend = []
            for (let i = 0; i < users.length; i++) {
                let topush = {
                    id: users[i].name.id,
                    name: users[i].name.text,
                    avatar: users[i].avatar,
                    display: users[i].name.display,
                }
                tosend.push(topush)
            }
            if (user.length < 1) return res.status(204).json({
                status: 204,
                message: '204 No Content: No followers'
            })
            res.status(200).json({
                status: 200,
                message: '200 OK',
                data: tosend
            })
        })
    })
}

module.exports = get