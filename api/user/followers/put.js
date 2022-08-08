const User = require("../../../models/User");
async function put(req, res) {
	if (!req.isAuthenticated())
		return res.status(401).json({
			status: 401,
			message: "401 Unauthorized: User not logged in",
		});
	if (!req.params.userId)
		return res.status(400).json({
			status: 400,
			message: "400 Bad Request: No id provided",
		});
	console.log(req.body);
	if (req.body.follow === "true") {
		let user,
			sent = false;
		await User.findById(req.session.passport.user).then((resp) => {
			user = resp;
			if (user.following.includes(resp.name.id)) {
				sent = true;
				return res.status(409).json({
					status: 409,
					message: "409 Conflict: Already following",
				});
			}
		});
		if (sent === false)
			await User.updateOne(
				{
					"name.id": user.name.id.toString(),
				},
				{
					$push: {
						following: req.params.userId.toString(),
					},
				}
			)
				.then(async () => {
					await User.updateOne(
						{
							"name.id": req.params.userId.toString(),
						},
						{
							$push: {
								followers: user.name.id.toString(),
							},
						}
					)
						.then(() => {
							if (!res.headersSent)
								res.status(200).json({
									status: 200,
									message: "Followed",
								});
						})
						.catch((err) => {
							console.error(err);
							if (!res.headersSent)
								return res.status(500).json({
									status: 500,
									message: "Internal Server Error",
								});
						});
				})
				.catch((err) => {
					console.error(err);
					if (!res.headersSent)
						return res.status(500).json({
							status: 500,
							message: "Internal Server Error",
						});
				});
	} else if (req.body.follow === "false") {
		let user,
			sent = false;
		await User.findById(req.session.passport.user).then(async (resp) => {
			user = resp;
			console.log(user.following, req.params.userId);
			// If user is not following
			if (!user.following.includes(req.params.userId)) {
				sent = true;
				if (!res.headersSent)
					return res.status(409).json({
						status: 409,
						message: "409 Conflict: Not following",
					});
			}
			if (sent === false)
				await User.updateOne(
					{
						"name.id": user.name.id.toString(),
					},
					{
						$pull: {
							following: req.params.userId.toString(),
						},
					}
				)
					.exec()
					.then(async () => {
						if (!res.headersSent)
							await User.updateOne(
								{ "name.id": req.params.userId.toString() },
								{
									$pull: {
										followers: user.name.id,
									},
								}
							)
								.exec()
								.then(() => {
									res.status(200).json({
										status: 200,
										message: "Unfollowed",
									});
								})
								.catch((err) => {
									console.error(err);
									if (!res.headersSent)
										return res.status(500).json({
											status: 500,
											message: "Internal Server Error",
										});
								});
					})
					.catch((err) => {
						console.error(err);
						if (!res.headersSent)
							return res.status(500).json({
								status: 500,
								message: "Internal Server Error",
							});
					});
		});
	} else {
		if (!res.headersSent)
			return res.status(400).json({
				status: 400,
				message: "400 Bad Request: No follow value provided",
			});
	}
}
module.exports = put;
