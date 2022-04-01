const User = require('../../models/User')
async function getUser(req, res) {
    if (!req.query.user) return res.status(400).json({
        status: 400,
        message: '400 Bad Request',
    });
    try {
        console.log(req.query.user)
        await User.findOne({
            'name.id': req.query.user
        }).then(user => {
            if (!user) res.status(404).json({
                status: 404,
                message: '404 User Not Found',
            });
            else res.send(user)
        }).catch(err => {
            console.log(err)
            res.status(400).json({
                status: 400,
                message: err.message,
            });
        })
    } catch (err) {
        console.log(err)
        res.status(400).json({
            status: 400,
            message: err.message,
        });
    }
}
module.exports = getUser