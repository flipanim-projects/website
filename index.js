var express = require("express"),
    session = require("express-session"),
    app = express(),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    server = app.listen(process.env.PORT || 3000, listen),
    router = express.Router();
var api = require('./api.js')
function listen() {
    return console.log('Server is listening');
}
function genSessionSecret() {
    return Math.floor(Math.random() * 100 ** 7).toString(16);
}
app.use(
    session({
        secret: genSessionSecret(),
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
app.route("/api/v1/users").get(api.functions.showUsers); // For individual user requests!
app.route("/api/v1/users").post(api.functions.createUser); // For creation of users
app.route("/api/v1/anims/popular").get(api.functions.getAnims.popular); // Get popular anims
app.route("/api/v1/anims/new").get(api.functions.getAnims.new); // Get popular anims
app.route("/api/v1/anims").get(api.functions.getAnims.byId); // Get anim by id
app.route('/api/v1/anims/:animId/comments').get(api.functions.getAnimComments)
app.route("/api/v1/login").post(api.functions.login);