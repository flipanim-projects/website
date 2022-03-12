const Anim = require('../../models/Anim')
async function getNew(req, res) {
    await Anim.find({})
        .then(anims => {
            anims.sort((b, a) => {
                return a.creation.unix - b.creation.unix;
            })
            if (anims.length > 12) anims.length = 12;
            res.status(200).json({
                status: 200,
                message: '200 OK',
            })
            res.send(anims)
        }).catch(err => {
            res.status(500).json({
                status: 500,
                message: "500 Internal Server Error"
            })
        })
}
module.exports = getNew