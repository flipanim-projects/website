const sha256 = require("../utils/sha256"),
	User = require("../../models/User"),
	CaptchaHandler = require("../utils/captcha"),
	idGen = require("../utils/idGen")
async function createUser(req, res) {
	if (require("../../config").captcha) {
		new CaptchaHandler().send({
			hcaptcha: req.body["h-captcha-response"],
			invalid: function () {
				return res.status(400).json({
					status: 400,
					message: "400 Bad Request: Invalid Captcha",
				});
			},
			next: sendToAPI
		});
	}

	if (req.body.username.length > 16)
		return res.status(413).json({
			status: 413,
			message: "413 Payload Too Large: Username too long",
		});

	
	async function sendToAPI() {
		let date = new Date();
		let userOpts = generateUserField();
		await User.findOne({
			"name.text": userOpts.name.text,
		}).then((fin) => {
			if (fin) {
				res.status(409).json({
					status: 409,
					message: "409 Username Taken",
				});
			} else {
				let user = new User(userOpts);
				user
					.save()
					.then(() => {
						return res.status(201).json({
							status: 201,
							message: "201 Created|" + userOpts.name.id,
						});
					})
					.catch((err) => {
						console.error(err);
						return res.status(500).json({
							status: 500,
							message: "Internal Server Error",
						});
					});
			}
		});
	}
}
function generateUserField(body) {
	let date = new Date();
	return {
		name: { text: body.username.toLowerCase(), display: "", id: idGen() },
		avatar: false,
		stats: {},
		anims: [],
		notifications: [
			{
				title: "Welcome to FlipAnim!",
				description: "Placeholder text.",
				read: false,
			},
		],
		status: { name: false, type: 0 },
		following: [],
		followers: [],
		preferences: { theme: "dark" },
		password: sha256(body.password),
		email: body.email,
		bio: "",
		creation: { unix: Date.now() / 1000, text: date.toISOString() },
	};
}
module.exports = createUser;
