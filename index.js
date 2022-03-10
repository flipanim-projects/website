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
        secret: gened,
        resave: true,
        saveUninitialized: true,
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
        console.log('Inside local strategy callback')
        // here is where you make a call to the database
        // to find the user based on their username or email address
        // for now, we'll just pretend we found that it was users[0]
        await User.findOne({
            username: username
        }).then(user => {
            if (!user) return done(null, false, { message: 'Invalid credentials.\n' })
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

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here')
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('Inside deserializeUser callback')
    console.log(`The user id passport saved in the session file store is: ${id}`)
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
app.route("/api/v1/anims/popular").get(api.getAnims.popular); // Get popular anims
app.route("/api/v1/anims/new").get(api.getAnims.new); // Get popular anims
app.route("/api/v1/anims").get(api.getAnims.byId); // Get anim by id
app.route("/api/v1/anims").post(api.postAnim); // Get anim by id
app.route('/api/v1/anims/:animId/comments').get(api.getAnimComments)
app.route("/api/v1/login").post(api.login);

/*********************
 * STATIC PAGES with pug!
 ********************/
 app.get('/', (req, res) => {
    res.render('index', { title: 'Hey' })
})