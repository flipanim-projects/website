var express = require("express"),
	app = express(),
    fs = require("fs"),
	server = app.listen(process.env.PORT || 3000, listen),
    router = express.Router();

function listen(a,e) {return}

function showComments(req, res) {
	let file = fs.readFileSync("./data/comments.json", "utf-8");
	res.send(JSON.parse(file))
}
function showUsers(req, res) {
    console.log('received request')
    let file = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    console.log('parsed file')
    if (!req.query) {
        res.status(400)
        res.send('400 Bad Request')
    }
    else {
        let user = file.findIndex(obj => {
            return obj.name.id === req.query.user
        })
        console.log('found index')
        if (user == -1) {
            res.status(404)
            res.send('404 User Not Found')
            return
        }
        res.send(file[user])
    }
}
app.route('/api/v1/comments').get(showComments)
app.route('/api/v1/users').get(showUsers);