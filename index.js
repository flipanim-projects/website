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

// Set Pug as the view engine
app.set("view engine", "pug");

// Connect to the MongoDB database
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    store: new FileStore(),
    secret: config.sessionSecret || "wow look a secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 180 * 60 * 1000, // 3 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy for user authentication
passport.use(
  new LocalStrategy(
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
  )
);

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
app.put(
  "/api/v1/users/:userId/auth",
  api.user.edit.auth,
  limitShort(0.2, 1)
);
app
