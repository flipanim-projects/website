var express = require("express"),
    session = require("express-session"),
    app = express(),
    path = require('path'),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    FileStore = require('session-file-store')(session),
    server = app.listen(process.env.PORT || 3000, listen),
    rateLimit = require('express-rate-limit'),
    morgan = require('morgan')

var api = require('./api/index'),
    User = require('./models/User'),
    sha256 = require('./api/sha256')

const dbUrl = 'mongodb+srv://root:flipanimapipass@flipanim.z85ki.mongodb.net/flipanim?retryWrites=true&w=majority'

// Connect to data server
mongoose.connect(dbUrl, {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    useUnifiedTopology: true,
}, (err) => {
    if (err) console.log(err);
});

function listen() {
    return console.log('Server is listening');
}

function genSessionSecret() {
    return Math.floor(Math.random() * 100 ** 7).toString(16);
}
let gened = genSessionSecret()
app.use(
    session({
        store: new FileStore(),
        secret: 'DevelopmentSecret (replace during public beta)',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.static(path.join(__dirname + "/")));

/**Pug Config*/
app.set('view engine', 'pug')
app.set("views", path.join(__dirname, "public"));


passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done,) => {
        await User.findOne({
            'name.text': username
        }).then(user => {
            console.log(`Attempting to log in with user ` + username + '. Returned ' + user)
            if (!user) return done(null, false, { message: 'Invalid username or password\n' })
            if (username === user.name.text && sha256(password) === user.password) {
                console.log('Local strategy returned true')
                return done(null, user)
            } else {
                console.log('Incorrect')
                return done(null, false, { message: 'Invalid credentials.\n' })
            }
        }).catch(err => {
            console.error(err)
        })

    }
));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    await User.findOne({
        id: id
    }).then(user => {
        done(null, user);
    }).catch(err => {
        console.error(err)
    })
});
const limitShort = (minutes, max, msg) => {
    minutes = minutes || 0.5
    max = max || 2
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: max,
        message: 'You are being rate limited' || msg,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
}
app.get("/api/v1/users", limitShort(0.2, 2, 'You cannot get a user as you are being rate limited'), api.user.get); // For individual user requests!
app.route("/api/v1/users").post(api.user.create, limitShort(30, 1)); // For creation of users
app.route("/api/v1/users/:userId/auth").put(api.user.edit.auth, limitShort(0.2, 1));
app.route('/api/v1/users/:userId/status').put(api.user.edit.status)
app.route('/api/v1/users/:userId/information').put(api.user.edit.information)
app.route("/api/v1/anims/popular").get(api.anim.getPopular); // Get popular anims
app.route("/api/v1/anims/new").get(api.anim.getNew); // Get popular anims
app.route("/api/v1/anims").get(api.anim.byId); // Get anim by id
app.route("/api/v1/anims").post(api.anim.post, limitShort(2, 1)); // Get anim by id
// app.route('/api/v1/anims/:animId/comments').get(api.getAnimComments)
app.route("/api/v1/login").post(api.session.login);
app.route("/api/v1/logout").post(api.session.logout);
/*********************
 * STATIC PAGES with pug!
 ********************/
const pageRoute = (url, page, args) => {
    app.get(url, async (req, res) => {
        let pg
        if (!page.a) pg = { a: [page[0], page[1]], ua: [page[0], page[1]] }
        else pg = page
        if (req.isAuthenticated()) await User.findById(req.session.passport.user).then(user => {
            let tosend = {
                name: {
                    display: user.name.display,
                    text: user.name.text,
                    id: user.name.id
                }, preferences: {
                    theme: user.preferences.theme
                }, bio: user.bio,
                status: { name: user.status.name, type: user.status.type }
            }
            res.render(pg.a[0], { title: pg.a[1], user: JSON.stringify(tosend) })
        })
        else res.render(pg.ua[0], { title: pg.ua[1] })
    })
}
pageRoute('/', { a: ['browse/index', 'FlipAnim | Home'], ua: ['index', 'FlipAnim | Home'] })
pageRoute('/account/login', { a: ['account/alreadyin', 'FlipAnim | Already logged in'], ua: ['account/login', 'FlipAnim | Login'] })
pageRoute('/account/create', { a: ['account/alreadyin', 'FlipAnim | Already logged in'], ua: ['account/create', 'FlipAnim | Create account'] })
pageRoute('/profile', ['profile/index', 'FlipAnim | Profile'])
pageRoute('/editor', ['editor/index', 'FlipAnim | Editor'])
pageRoute('/settings', { a: ['settings/index', 'FlipAnim | Settings'], ua: ['account/login', 'FlipAnim | Log in'] })
pageRoute('/info/team', ['info/team/index', 'FlipAnim Team'])