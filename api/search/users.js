const User = require('../../models/User')
async function users(req, res) {
    //   search for users
    console.log(req.query)
    if (req.query.q.length < 3) return res.status(400).json({
        status: 400,
        message: '400 Bad Request: Search query too short'
    })

    let users = await User.find({
        'name.text': {
            $regex: req.query.q,
            // search globally with "g" flag and case-sensitive
            $options: 'i'
        },
    }).then(users => {
        let stat
        users ? stat = 200 : stat = 204
        let tosend = []
        for (let i = 0; i < users.length; i++) {
            tosend.push({
                id: users[i].name.id,
                username: users[i].name.text.replaceAll(req.query.q, '<b>' + req.query.q + '</b>'),
                display: users[i].name.display,
                avatar: users[i].avatar ? users[i].avatar : '/public/imgs/profile.png',
            })
        }
        return res.status(stat).json({
            status: stat,
            message: '200 OK',
            data: tosend
        });
    }).catch(err => {
        console.error(err)
        return res.status(500).json({
            status: 500,
            message: 'Internal Server Error',
        });
    })
}

module.exports = users