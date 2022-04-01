const mongoose = require('mongoose')
let Schema = mongoose.Schema

let userSchema = new Schema(
    {
        "name": {
            "display": String,
            "text": String,
            "id": String
        },
        "avatar": false,
        "stats": {
            "likes": Number,
            "views": Number
        },
        "anims": [
            {
                "name": String,
                "id": String,
                "stats": {
                    "likes": Number,
                    "views": Number
                },
                "comments": [
                    {
                        "id": String,
                    }
                ],
                "creation": {
                    "unix": Number,
                    "text": String
                }
            }
        ],
        "notifications": [
            {
                "title": String,
                "description": String,
                "read": Boolean
            }
        ],
        "status": Object,
        "following": Array,
        "followers": Array,
        "password": String,
        "bio": String,
        "badges": Array,
        "preferences": {
            "theme": String
        },
        "creation": {
            "unix": Number,
            "text": String
        }
    }
);
let User = mongoose.model("user", userSchema);
module.exports = User;