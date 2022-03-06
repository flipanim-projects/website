const { response } = require("express");

var express = require("express"),
  session = require("express-session"),
  app = express(),
  fs = require("fs"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  server = app.listen(process.env.PORT || 3000, listen),
  router = express.Router();

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

function listen() {
  return console.log('Server is listening');
}
var sha256 = function r(t) {
  function n(r, t) {
    return (r >>> t) | (r << (32 - t));
  }
  for (
    var o,
      e,
      f = Math.pow,
      h = f(2, 32),
      a = "",
      l = [],
      g = 8 * t.length,
      c = (r.h = r.h || []),
      i = (r.k = r.k || []),
      u = i.length,
      v = {},
      s = 2;
    u < 64;
    s++
  )
    if (!v[s]) {
      for (o = 0; o < 313; o += s) v[o] = s;
      (c[u] = (f(s, 0.5) * h) | 0), (i[u++] = (f(s, 1 / 3) * h) | 0);
    }
  for (t += ""; (t.length % 64) - 56; ) t += "\0";
  for (o = 0; o < t.length; o++) {
    if ((e = t.charCodeAt(o)) >> 8) return;
    l[o >> 2] |= e << (((3 - o) % 4) * 8);
  }
  for (l[l.length] = (g / h) | 0, l[l.length] = g, e = 0; e < l.length; ) {
    var k = l.slice(e, (e += 16)),
      d = c;
    for (c = c.slice(0, 8), o = 0; o < 64; o++) {
      var p = k[o - 15],
        w = k[o - 2],
        A = c[0],
        C = c[4],
        M =
          c[7] +
          (n(C, 6) ^ n(C, 11) ^ n(C, 25)) +
          ((C & c[5]) ^ (~C & c[6])) +
          i[o] +
          (k[o] =
            o < 16
              ? k[o]
              : (k[o - 16] +
                  (n(p, 7) ^ n(p, 18) ^ (p >>> 3)) +
                  k[o - 7] +
                  (n(w, 17) ^ n(w, 19) ^ (w >>> 10))) |
                0);
      (c = [
        (M +
          ((n(A, 2) ^ n(A, 13) ^ n(A, 22)) +
            ((A & c[1]) ^ (A & c[2]) ^ (c[1] & c[2])))) |
          0,
      ].concat(c))[4] = (c[4] + M) | 0;
    }
    for (o = 0; o < 8; o++) c[o] = (c[o] + d[o]) | 0;
  }
  for (o = 0; o < 8; o++)
    for (e = 3; e + 1; e--) {
      var S = (c[o] >> (8 * e)) & 255;
      a += (S < 16 ? 0 : "") + S.toString(16);
    }
  return a;
};

function showComments(req, res) {
  let file = fs.readFileSync("data/comments.json", "utf-8");
  res.send(JSON.parse(file));
}

function showUsers(req, res) {
  console.log("received request");
  let file = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
  console.log("parsed file");
  if (!req.query) {
    res.status(400);
    res.send("400 Bad Request");
  } else {
    let user = file.findIndex((obj) => {
      return obj.name.id === req.query.user;
    });
    console.log("found index");
    if (user == -1) {
      res.status(404);
      res.send("404 User Not Found");
      return;
    }
    res.send(file[user]);
  }
}

function createUser(req, res) {
  function idGen() {
    let t = "abcdef1234567890-_",
      e = "";
    for (let n = 0; n < 6; n++) e += t[Math.floor(Math.random() * t.length)];
    return e;
  }
  console.log(req.headers);
  let date = new Date();
  let user = {
    name: {
      text: "",
      id: idGen(),
    },
    email: "",
    avatar: "false",
    stats: {},
    anims: [],
    notifications: [
      {
        title: "Welcome to FlipAnim!",
        description: "Placeholder text.",
        read: false,
      },
    ],
    status: {
      name: "",
      type: 0,
    },
    following: [],
    followers: [],
    password: "",
    bio: "",
    creation: {
      unix: Date.now() / 1000,
      text: date.toISOString().split("T")[0],
    },
  };
  console.log(req.body);
  user.name.text = req.body.username;
  user.password = sha256(req.body.password);
  let file = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
  let check = file.findIndex((obj) => {
    return obj.name.text.toLowerCase() === req.body.username.toLowerCase();
  });
  if (check !== -1) {
    res.status(409);
    res.send("409 Username Taken");
    return;
  }
  file.push(user);
  fs.writeFileSync("data/users.json", JSON.stringify(file));
  res.send(user);
}

var getAnims = {
  popular: function (req, res) {
    let resu = [];
    let file = JSON.parse(fs.readFileSync("data/anims.json", "utf-8"));
    for (let i = 0; i < file.length; i++) {
      let now = Date.now() / 1000;
      console.log();
      let animCreation = file[i].creation.unix;
      let diff = now - animCreation;
      // Filter anims: If the anim is too new or too old
      // do not show it on popular page
      if (diff < 10 * 60 || diff > 12 * 60 * 60) continue;
      file[i].unpopularity = Math.round(
        ((file[i].stats.views - file[i].stats.likes) / file[i].stats.views) *
          100
      );
      resu.push(file[i]);
    }
    resu.sort((b, a) => {
      return a.unpopularity - b.unpopularity;
    });
    res.status(200);
    res.send(resu);
  },
  new: function (req, res) {
    let file = JSON.parse(fs.readFileSync("data/anims.json", "utf-8"));
    file.sort((b, a) => {
      return a.creation.unix - b.creation.unix;
    });
    if (file.length > 12) file.length = 12;
    console.log(file);
  },
  byId: function (req, res) {
    console.log(req.query);
    if (!req.query.id) {
      res.status(400);
      res.send("400 Bad Request");
      return;
    }
    let file = JSON.parse(fs.readFileSync("data/anims.json", "utf-8"));
    let check = file.findIndex((obj) => {
      console.log(obj);
      return obj.id === req.query.id;
    });
    if (check === -1) {
      res.status(404);
      res.send("404 Anim Not Found");
    }
    res.send(file[check]);
  },
};

function login(req, res) {
  let username = req.body.username,
    password = req.body.password;
  console.log(req.body);
  if (username && password) {
    password = sha256(password);
    let file = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
    let user =
      file[
        file.findIndex((obj) => {
          return obj.name.text.toLowerCase() === username.toLowerCase();
        })
      ];
    if (!user) return incorrect();
    if (sha256(password) === sha256(user.password)) {
      res.status(200);
      res.send("200 OK");
      console.log(req.session)
      req.session.loggedin = true;
      req.session.username = username
      console.log(req.session)
      return;
    } else return incorrect();
  } else {
    res.status(400);
    res.send("400 Bad Request: No Username or no Password");
    return;
  }

  function incorrect() {
    res.status(401);
    res.send("401 Username or Password Incorrect");
    return;
  }
}
app.use(express.static("public")); // Page itself
app.route("/api/v1/users").get(showUsers); // For individual user requests!
app.route("/api/v1/users").post(createUser); // For creation of users
app.route("/api/v1/anims/popular").get(getAnims.popular); // Get popular anims
app.route("/api/v1/anims/new").get(getAnims.new); // Get popular anims
app.route("/api/v1/anims").get(getAnims.byId); // Get anim by id
app.route("/api/v1/login").post(login);

/*****************
 * Static Routes!!
 */