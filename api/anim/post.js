const User = require('../../models/User'),
    Anim = require('../../models/Anim')
    
async function post(req, res) {
    if (!req.isAuthenticated()) return res.status(401).json({
        status: '401',
        message: '401 Unauthorized'
    })
    function idGen() {
        let t = "abcdef1234567890-_",
            e = "";
        for (let n = 0; n < 6; n++) e += t[Math.floor(Math.random() * t.length)];
        return e;
    }
    let animName = req.body.name,
        animAuthor = req.body.author,
        animAuthorId = req.body.id,
        animId = idGen()
    let auser
    await User.findOne({
        'name.id': animAuthorId
    }).then(resp => {
        auser = resp
    })
    if (!auser) return res.send('Invalid user')
    let animTemplate = {
        "name": animName,
        "id": animId,
        "stats": { "likes": 0, "views": 0 },
        "comments": [],
        "author": { "text": animAuthor, "id": animAuthorId },
        "creation": { "unix": Date.now() / 1000, "text": new Date().toISOString() }
    }
    let anim = new Anim(animTemplate)
    anim.save()
    res.redirect('/anim/?id=' + animId)
}
module.exports = post