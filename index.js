var express = require("express"),
    session = require("express-session"),
    FileStore = require('session-file-store')(session),
    app = express(),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    server = app.listen(process.env.PORT || 3000, listen),
    router = express.Router();
var api = require('./api.js')
console.log(api)
function listen() {
    return console.log('Server is listening');
}
function genSessionSecret() {
    return Math.floor(Math.random() * 100 ** 7).toString(16);
}
let gened = genSessionSecret()
console.log(gened)
app.use(
    session({
        store: new FileStore(),
        secret: gened,
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static("public")); // Page itself
app.route("/api/v1/users").get(api.showUsers); // For individual user requests!
app.route("/api/v1/users").post(api.createUser); // For creation of users
app.route("/api/v1/anims/popular").get(api.getAnims.popular); // Get popular anims
app.route("/api/v1/anims/new").get(api.getAnims.new); // Get popular anims
app.route("/api/v1/anims").get(api.getAnims.byId); // Get anim by id
app.route('/api/v1/anims/:animId/comments').get(api.getAnimComments)
app.route("/api/v1/login").post(api.login);