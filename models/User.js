const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
	{
		name: {
			display: String,
			text: String,
			id: String,
		},
		avatar: false,
		stats: {
			likes: Number,
			views: Number,
		},
		anims: [
			{
				name: String,
				id: String,
				stats: {
					likes: Number,
					views: Number,
				},
				comments: [
					{
						id: String,
					},
				],
				creation: {
					unix: Number,
					text: String,
				},
			},
		],
		notifications: [
			{
				title: String,
				description: String,
				read: Boolean,
			},
		],
		status: Object,
		following: Array,
		followers: Array,
		notes: Object,
		password: String,
		bio: String,
		badges: Array,
		email: String,
		preferences: {
			theme: String,
		},
		creation: {
			unix: Number,
			text: String,
		},
	},
	{
		collection: "users",
	}
);
let User = mongoose.model("User", userSchema, "users");
module.exports = User;
