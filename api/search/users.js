const User = require("../../models/User");
async function users(req, res) {
	//   search for users
	console.log(req.query);
	if (!req.query.q || req.query.q.length < 3)
		return res.status(400).json({
			status: 400,
			message: "400 Bad Request: Search query too short or nonexistent",
		});

	await User.find({
		"name.text": { $regex: req.query.q, $options: "i" },
	})
		.exec()
		.then((users) => {
			let stat;
			users.length > 0 ? (stat = 200) : (stat = 204);
			let tosend = [];
			console.log(users);
			for (let i = 0; i < users.length; i++) {
				tosend.push({
					id: users[i].name.id,
					username: users[i].name.text.replaceAll(
						req.query.q,
						"<b>" + req.query.q + "</b>"
					),
					display: users[i].name.display,
					avatar: users[i].avatar
						? users[i].avatar
						: "/public/imgs/profile.png",
				});
			}
			return res.status(stat).json({
				status: stat,
				message: stat.toString() + " OK",
				data: tosend,
			});
		});
}

module.exports = users;
