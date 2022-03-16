const User = require('../../../models/User')

async function status(req, res) {
    if (!req.session.passport.user) return res.status(401).json({
        status: 401,
        message: '401 Unauthorized'
    }) 
    // Get status from the request body
    let status = req.body['status']
    let statusType = req.body['statusType']
    await User.findById(req.session.passport.user).then(async (user) => {
        // Fetch user from the database
        // If new status is the same as old status 
        // AND new status TYPE is the same, don't change anything
        if (status === user.status.name && statusType === user.status.type) return res.status(204).json({
            status: 204,
            message: '204 No Content'
        })
        user = { status: { type: null, name: null }}
        // Change status type
        user.status.type = parseInt(statusType)
        // Change status name
        user.status.name = status
        await User.findByIdAndUpdate(user._id, user).then(() => {
            return res.status(200).json({
                status: 200,
                message: '200 OK Status Changed'
            })    
        }).catch(err => {
            res.status(500).json({
                status: 500, message: '500 Internal Server Error'
            })
        })
    }).catch(err => {
        res.status(500).json({
            status: 500, message: '500 Internal Server Error'
        })
    })
}
module.exports = status