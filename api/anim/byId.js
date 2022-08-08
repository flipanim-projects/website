const Anim = require("../../models/Anim");
async function byId(req, res) {
	if (!req.query.id) {
		res.status(400);
		res.send("400 Bad Request");
		return;
	}
	await Anim.findOne({
		id: req.query.id,
	})
		.then((anim) => {
			if (anim) {
				res.status(200);
				res.send(anim);
			} else {
				res.status(404).json({
					status: 404,
					message: `404 Not Found`,
				});
			}
		})
		.catch((err) => {
			res.status(500).json({
				status: 500,
				message: err.message,
			});
		});
}
module.exports = byId;
