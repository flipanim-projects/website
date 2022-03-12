async function logout(req, res) {
    req.session.destroy(err => {
        if (err) {
            console.log(err)
            res.status(400).send('Unable to log out')
        } else {
            res.send('Logout successful')
        }
    });
}
module.exports = logout