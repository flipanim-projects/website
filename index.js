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
    pug = require('pug')

var api = require('./functions/index.js'),
    User = require('./models/User'),
    sha256 = require('./functions/sha256')

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
        secret: 'sess',
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
app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'pug')
passport.use(new LocalStrategy(
    { usernameField: 'username' },
    async (username, password, done,) => {
        await User.findOne({
            'name.text': username
        }).then(user => {
            console.log(`Attempting to log in with user `+username+'. Returned '+user)
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
//app.use(express.static("public")); // Page itself
app.route("/api/v1/users").get(api.showUser); // For individual user requests!
app.route("/api/v1/users").post(api.createUser); // For creation of users
app.route("/api/v1/users").put(api.editUser); // For creation of users
app.route("/api/v1/anims/popular").get(api.getAnims.popular); // Get popular anims
app.route("/api/v1/anims/new").get(api.getAnims.new); // Get popular anims
app.route("/api/v1/anims").get(api.getAnims.byId); // Get anim by id
app.route("/api/v1/anims").post(api.postAnim); // Get anim by id
app.route('/api/v1/anims/:animId/comments').get(api.getAnimComments)
app.route("/api/v1/login").post(api.login);
app.route("/api/v1/logout").post(api.logout);

/*********************
 * STATIC PAGES with pug!
 ********************/
app.get('/', async (req, res) => {
    console.log(req.session)
    if (req.isAuthenticated()) {
        await User.findById(req.session.passport.user).then(user => {
            res.render('browse/index', { title: 'FlipAnim | Home', loggedIn: user })
        }).catch(() => {
            //res.render('error/index')
            res.render('browse/index', { title: 'FlipAnim | Home' })
        })
    } else {
        res.render('index', { title: 'FlipAnim | Home' })
    }
})

app.get('/account/login', async (req, res) => {
    if (req.session.passport) {
        await User.findById(req.session.passport.user).then(user => {
            if (!user)  res.render('account/login', { title: 'FlipAnim | Log in' })
            else res.render('account/alreadyin', { title: 'FlipAnim', loggedIn: user })
        }).catch(() => {
            res.render('account/login', { title: 'FlipAnim | Log in' })
        })
    } else if (!req.session.passport) {
        res.render('account/login', { title: 'FlipAnim | Log in' })
    }
})
app.get('/account/create', async (req, res) => {
    if (req.session.passport) {
        await User.findById(req.session.passport.user).then(user => {
            if (!user)  res.render('account/create', { title: 'FlipAnim | Create account' })
            else res.render('account/alreadyin', { title: 'FlipAnim', loggedIn: user })
        }).catch(() => {
            res.render('account/create', { title: 'FlipAnim | Create account' })
        })
    } else if (!req.session.passport) {
        res.render('account/create', { title: 'FlipAnim | Create account' })
    }
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
app.get('/error', async (req, res) => {
    res.render('error/500', { title: 'FlipAnim | Error', loggedIn: false })
})

app.get('/settings', async (req, res) => {
    if (req.session.passport) await User.findById(req.session.passport.user).then(user => {
        if (!user) res.render('account/login', { title: 'FlipAnim | Log in', loggedIn: false })
        res.render('settings/index', { title: 'FlipAnim | Settings', loggedIn: user })
    })
    else res.redirect('/account/login')
})