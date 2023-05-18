require("dotenv").config();

const express = require("express");
const session = require("express-session");
const config = require("./config");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FileStore = require("session-file-store")(session);
const rateLimit = require("express-rate-limit");
const pug = require("pug");

const api = require("./api/index");
const User = require("./models/User");
const sha256 = require("./api/utils/sha256");

const app = express();
const port = process.env.PORT || 3000;

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  store: new FileStore(),
  secret: config.sessionSecret || "wow look a secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 180 * 60 * 1000, // 3 hours
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy for user authentication
passport.use(new LocalStrategy(
  { usernameField: "username", passwordField: "password" },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ "name.text": username });
      if (!user) {
        return done(null, false, {
          status: 400,
          message: "Username or password is incorrect",
        });
      }
      if (password === user.password) {
        return done(null, user);
      } else {
        console.log(password, user.password, "Incorrect password");
        return done(null, false, {
          status: 400,
          message: "Username or password is incorrect",
        });
      }
    } catch (err) {
      console.error(err);
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error(err);
    done(err);
  }
});

// Rate limiting middleware
const limitShort = (minutes, max, msg) => {
  minutes = minutes || 0.5;
  max = max || 2;
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max: max,
    message: msg || "You're being rate-limited",
    headers: true,
  });
};

// API routes
app.post("/api/v1/users", limitShort(30, 1), api.user.create);
app.put("/api/v1/users/:userId/auth", api.user.edit.auth, limitShort(0.2, 1));
app.put("/api/v1/users/:userId/status", limitShort(0.3, 2, "You cannot set your status as you are being rate limited"), api.user.edit.status);
app.put("/api/v1/users/:userId/information", limitShort(2, 2, "You are being rate limited"), api.user.edit.information);
app.put("/api/v1/users/:userId/followers", limitShort(0.2, 2, "You cannot follow this user as you are being rate limited"), api.user.followers.put);
app.get("/api/v1/search/users", limitShort(0.1, 2, "You cannot search as you are being rate limited"), api.search.users);
app.route("/api/v1/anims").post(api.anim.post, limitShort(2, 1));
app.post("/api/v1/login", limitShort(0.3, 3, "You are being rate-limited, try again later"), api.session.login);
app.route("/api/v1/logout").post(api.session.logout);

// Page routes
const pageRoute = (url, page, args) => {
  app.get(url, async (req, res) => {
    try {
      let pg = page;
      if (!page.a) pg = { a: page, ua: page };
      if (req.isAuthenticated()) {
        const user = await User.findById(req.session.passport.user);
        const tosend = {
          name: {
            display: user.name.display,
            text: user.name.text,
            id: user.name.id,
          },
          preferences: {
            theme: user.preferences.theme,
          },
          bio: user.bio,
          status: { name: user.status.name, type: user.status.type },
        };
        res.render(pg.a[0], { title: pg.a[1], user: JSON.stringify(tosend) });
      } else {
        res.render(pg.ua[0], { title: pg.ua[1] });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("oh shit there's an error.");
    }
  });
};

pageRoute("/", { a: ["browse/index", "FlipAnim | Home"], ua: ["index", "FlipAnim | Home"] });
pageRoute("/account/login", { a: ["account/alreadyin", "FlipAnim | Already logged in"], ua: ["account/login", "FlipAnim | Login"] });
pageRoute("/account/create", { a: ["account/alreadyin", "FlipAnim | Already logged in"], ua: ["account/create", "FlipAnim | Create account"] });
pageRoute("/profile", ["profile/index", "FlipAnim | Profile"]);
pageRoute("/editor", ["editor/index", "FlipAnim | Editor"]);
pageRoute("/settings", { a: ["settings/index", "FlipAnim | Settings"], ua: ["account/login", "FlipAnim | Log in"] });
pageRoute("/info/team", ["info/team/index", "FlipAnim Team"]);
pageRoute("/info/terms", ["info/terms/index", "FlipAnim | Terms of Service"]);
pageRoute("/info/privacy", ["info/privacy/index", "FlipAnim | Privacy Policy"]);
pageRoute("/search", ["search/index", "FlipAnim | Search"]);
pageRoute("/anim", ["anim/index", "FlipAnim | Anim"]);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
