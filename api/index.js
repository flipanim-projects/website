var express = require("express"),
	app = express(),
	server = app.listen(process.env.PORT || 3000, listen);

function listen() {
	var e = server.address().address,
		s = server.address().port;
	console.log("Example app listening at http://" + e + ":" + s)
}
var fs = require("fs");

function showComments(req, res) {
	let file = fs.readFileSync("data/comments.json", "utf-8");
	res.send(JSON.parse(file))
}
app.get("/comments", showComments);

function showUsers(req, res) {
    console.log('received request')
    let file = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
    console.log('parsed file')
    if (!req.query) {
        res.status(400)
        res.send('Bad Request')
    }
    else {
        let user = file.findIndex(obj => {
            return obj.name.id === req.query.user
        })
        console.log('found index')
        if (user == -1) {
            res.status(404)
            res.send('User not found')
            return
        }
        res.send(file[user])
    }
}
app.get("/users", showUsers);