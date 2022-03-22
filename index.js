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
    router = express.Router(),
    pug = require('pug'),
    rateLimit = require('express-rate-limit')

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

app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(express.static(path.join(__dirname + "/")));

app.set('view engine', 'pug')
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
const limitShort = (minutes) => {
    minutes = 0.5
    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: 2,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
}
app.route("/api/v1/users").get(api.user.get, limitShort()); // For individual user requests!
app.route("/api/v1/users").post(api.user.create); // For creation of users
app.route("/api/v1/users/:userId/auth").put(api.user.edit.auth); 
app.route('/api/v1/users/:userId/status').put(api.user.edit.status)
app.route('/api/v1/users/:userId/information').put(api.user.edit.information)
app.route("/api/v1/anims/popular").get(api.anim.getPopular); // Get popular anims
app.route("/api/v1/anims/new").get(api.anim.getNew); // Get popular anims
app.route("/api/v1/anims").get(api.anim.byId); // Get anim by id
app.route("/api/v1/anims").post(api.anim.post); // Get anim by id
// app.route('/api/v1/anims/:animId/comments').get(api.getAnimComments)
app.route("/api/v1/login").post(api.session.login);
app.route("/api/v1/logout").post(api.session.logout);

app.get('/api/v1', limitShort(), function (req, res) {
    console.log('asda')
    res.send('asda')
})
/*********************
 * STATIC PAGES with pug!
 ********************/
app.get('/', async (req, res) => {
    if (req.isAuthenticated()) await User.findById(req.session.passport.user).then(user => {
        res.render('browse/index', { title: 'FlipAnim | Home', loggedIn: user })
    })
    else res.render('index', { title: 'FlipAnim | Home' })
})

app.get('/account/login', async (req, res) => {
    if (req.isAuthenticated()) await User.findById(req.session.passport.user).then(user => {
        if (!user) res.render('account/login', { title: 'FlipAnim | Log in' })
        else res.render('account/alreadyin', { title: 'FlipAnim | Already logged in', loggedIn: user })
    })
    else if (!req.session.passport) res.render('account/login', { title: 'FlipAnim | Log in' })
})
app.get('/account/create', async (req, res) => {
    if (req.isAuthenticated()) await User.findById(req.session.passport.user).then(user => {
        if (!user) res.render('account/create', { title: 'FlipAnim | Create an account' })
        else res.render('account/alreadyin', { title: 'FlipAnim | Already logged in', loggedIn: user })
    })
    else if (!req.session.passport) res.render('account/create', { title: 'FlipAnim | Create an account' })
})
app.get('/profile', async (req, res) => {
    if (req.session.passport) await User.findById(req.session.passport.user).then(user => {
        res.render('profile/index', { title: 'FlipAnim | Profile', loggedIn: user })
    })
    else res.render('profile/index', { title: 'FlipAnim | Profile', loggedIn: false })
})
app.get('/editor', async (req, res) => {
    if (req.session.passport) await User.findById(req.session.passport.user).then(user => {
        res.render('editor/index', { title: 'FlipAnim | Editor', loggedIn: user })
    })
    else res.render('editor/index', { title: 'FlipAnim | Editor', loggedIn: false })
})
app.get('/settings', async (req, res) => {
    if (req.session.passport) await User.findById(req.session.passport.user).then(user => {
        if (!user) res.render('account/login', { title: 'FlipAnim | Log in', loggedIn: false })
        res.render('settings/index', { title: 'FlipAnim | Settings', loggedIn: user })
    })
    else res.redirect('/account/login')
})
app.get('/error', async (req, res) => {
    res.render('error/500', { title: 'FlipAnim | Error', loggedIn: false })
})