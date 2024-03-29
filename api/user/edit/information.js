const User = require("../../../models/User"),
	CaptchaHandler = require("../../utils/captcha");
async function information(req, res) {
	if (!req.isAuthenticated())
		return res.status(401).json({
			status: 401,
			message: "401 Unauthorized: User not logged in",
		});

	if (!req.body["displayName"] && !req.body["bio"])
		return res.status(400).json({
			status: 400,
			message: "400 Bad Request: No data provided",
		});
	if (req.body["displayName"].length > 20)
		return res.status(413).json({
			status: 413,
			message: "413 Payload Too Large: Display name too long",
		});
	if (req.body["bio"].length > 120)
		return res.status(413).json({
			status: 413,
			message: "413 Payload Too Large: Bio too long",
		});

	let hcaptcha = req.body["h-captcha-response"];
	if (require("../../config").captcha)
		new CaptchaHandler().send({
			hcaptcha: hcaptcha,
			invalid: function () {
				res.status(400).json({
					status: 400,
					message: "400 Bad Request: Invalid Captcha",
				});
			},
			next: function () {
				editUser();
			},
		});
	function sanitize(input) {
		let map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};
		return input.replace(/[&<>"']/g, function (m) {
			return map[m];
		});
	}
	async function editUser() {
		await User.findById(req.session.passport.user).then(async (user) => {
			let toupdate = {};
			toupdate.name = user.name;
			toupdate.bio = user.bio;
			toupdate.preferences = { theme: user.preferences.theme };
			if (req.body["bio"]) toupdate.bio = sanitize(req.body["bio"]);
			if (req.body["displayName"])
				toupdate.name.display = sanitize(req.body["displayName"]);
			if (req.body["theme"])
				toupdate.preferences.theme = sanitize(req.body["theme"]);
			await User.findByIdAndUpdate(req.session.passport.user, toupdate)
				.then(() => {
					res.status(200).json({
						status: 200,
						message: "200 OK User Updated",
					});
				})
				.catch((err) => {
					console.log(err);
					return res.status(500).json({
						status: 500,
						message: "Internal Server Error",
					});
				});
		});
	}
}
module.exports = information;
