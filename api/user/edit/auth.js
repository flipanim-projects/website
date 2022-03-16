const sha256 = require('../../sha256')
function auth(req, res) {
    if (!req.session.passport.user) return res.status(401).json({
        status: 401,
        message: '401 Unauthorized'
    })
    
}
module.exports = auth