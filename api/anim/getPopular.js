const Anim = require('../../models/Anim')
async function getPopular(req, res) {
    console.log('Request to get popular anims')
    let result = [];
    await Anim.find({})
        .then(anims => {
            for (let i = 0; i < anims.length; i++) {
                // let now = Date.now() / 1000;
                // let animCreation = anims[i].creation.unix;
                // let diff = now - animCreation;
                // // Filter anims: If the anim is too new or too old
                // // do not show it on popular page
                // if (diff < 10 * 60 || diff > 12 * 60 * 60) continue;
                // anims[i].unpopularity = Math.round(
                //     ((anims[i].stats.views - anims[i].stats.likes) / anims[i].stats.views) *
                //     100
                // );
                result.push(anims[i]);
            }
            // result.sort((b, a) => {
            //     return a.unpopularity - b.unpopularity;
            // });
            res.status(200);
            res.send(result);
        })
}
module.exports = getPopular