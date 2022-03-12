const passport = require('passport');
async function login(req, res, next) {
    // configure passport.js to use the local strategy
    passport.authenticate('local', (err, user, info) => {
        if (info) { return res.send(info.message) }
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.login(user, (err) => {
            return res.redirect('/')
        })
    })(req, res, next);
}
module.exports = login