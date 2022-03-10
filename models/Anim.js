const mongoose = require('mongoose')
let Schema = mongoose.Schema

let animSchema = new Schema(
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
                "content": String,
                "author": {
                    "text": String,
                    "id": String
                },
                "reply": String
            }
        ],
        "author": {
            "text": String,
            "id": String
        },
        "creation": {
            "unix": Number,
            "text": String
        }
    }
);
let Anim = mongoose.model("anim", animSchema);
module.exports = Anim;