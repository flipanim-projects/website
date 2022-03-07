const fs = require("fs");
let got, FormData
import('got').then(data => got = data.got), import('formdata-node').then(data => FormData = data.FormData)

setTimeout(function () { console.log(got, FormData) }, 2000)
/***********
 * Models       
 **********/
var Anim = require('./models/Anim'),
  User = require('./models/User')

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
  for (t += ""; (t.length % 64) - 56;) t += "\0";
  for (o = 0; o < t.length; o++) {
    if ((e = t.charCodeAt(o)) >> 8) return;
    l[o >> 2] |= e << (((3 - o) % 4) * 8);
  }
  for (l[l.length] = (g / h) | 0, l[l.length] = g, e = 0; e < l.length;) {
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

module.exports = {
  showComments: function (req, res) {
    let file = fs.readFileSync("data/comments.json", "utf-8");
    res.send(JSON.parse(file));
  },
  showUser: async function (req, res) {
    try {
      let user = await User.findOne({
        id: req.params.id
      }).then(user => {
        res.send(user)
      })
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.message,
      });
    }

  }, createUser: async function (req, res) {
    function invalidCaptcha(res) {
      res.redirect('./create?error=1')
      return
    }
    let hcaptcha = req.body['h-captcha-response']
    if (!hcaptcha) {
      invalidCaptcha(res)
      return;
    } else {
      const form = new FormData()
      form.set('secret', '0xC5B6Bd0750C259aa60648bd42Fd44C6974172b31')
      form.set('response', hcaptcha)
      console.log(JSON.stringify(form))
      await got.post('https://hcaptcha.com/siteverify', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        form: {
          secret: "0xC5B6Bd0750C259aa60648bd42Fd44C6974172b31",
          response: hcaptcha
        }
      }).json().then(resp => {
        if (resp.success === false) return invalidCaptcha(res)
        else createUser()
      })
    }

    function idGen() {
      let t = "abcdef1234567890-_",
        e = "";
      for (let n = 0; n < 6; n++) e += t[Math.floor(Math.random() * t.length)];
      return e;
    }
    async function createUser() {
      let date = new Date();
      let userOpts =
      {
        "name": { "text": req.body.username, "id": idGen() }, "avatar": false, "stats": {}, "anims": [], "notifications": [{ "title": "Welcome to FlipAnim!", "description": "Placeholder text.", "read": false }], "status": { "name": false, "type": 0 }, "following": [], "followers": [], "password": sha256(req.body.password), "bio": "", "creation": { "unix": Date.now() / 1000, "text": date.toISOString() }
      }
      let check = await User.findOne({
        username: userOpts.name.text
      }).then(fin => {
        if (fin) {
          res.status(409).json({
            status: 409,
            message: '409 Username Taken',
          });

        } else {
          let user = new User(userOpts)
          user.save()
          res.redirect('/profile?user=' + userOpts.name.text + '&justCreated=true')
        }
      })
    }
  }, getAnims: {
    popular: async function (req, res) {
      let result = [];
      await Anim.find({})
        .then(anims => {
          for (let i = 0; i < anims.length; i++) {
            let now = Date.now() / 1000;
            let animCreation = anims[i].creation.unix;
            let diff = now - animCreation;
            // Filter anims: If the anim is too new or too old
            // do not show it on popular page
            if (diff < 10 * 60 || diff > 12 * 60 * 60) continue;
            anims[i].unpopularity = Math.round(
              ((anims[i].stats.views - anims[i].stats.likes) / anims[i].stats.views) *
              100
            );
            result.push(anims[i]);
          }
          result.sort((b, a) => {
            return a.unpopularity - b.unpopularity;
          });
          res.status(200);
          res.send(result);
        })
    },
    new: async function (req, res) {
      await Anim.find({})
        .then(anims => {
          anims.sort((b, a) => {
            return a.creation.unix - b.creation.unix;
          })
          if (anims.length > 12) anims.length = 12;
          res.status(200).json({
            status: 200,
            message: '200 OK',
          })
          res.send(anims)
        }).catch(err => {
          res.status(500).json({
            status: 500,
            message: "500 Internal Server Error"
          })
        })
    },
    byId: async function (req, res) {
      if (!req.query.id) {
        res.status(400);
        res.send("400 Bad Request");
        return;
      }
      await Anim.findOne({
        id: req.query.id
      }).then(anim => {
        if (anim) {
          res.status(200)
          res.send(anim)
        } else {
          res.status(404).json({
            status: 404,
            message: `404 Not Found`
          })
        }
      }).catch(err => {
        res.status(500).json({
          status: 500,
          message: err.message
        })
      })
    },
  }, login: function (req, res) {
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
  }, getAnimComments: function (req, res) {
    console.log(req.session, req.sessionID)
    let animId = req.path.slice(req.path.indexOf('anims/') + 'anims/'.length).replace('/comments', '')
    let file = JSON.parse(fs.readFileSync("data/anims.json", "utf-8"));
    let anim =
      file.findIndex((obj) => {
        return obj.id.toLowerCase() === animId.toLowerCase();
      });
    if (anim === -1) {
      res.status(404);
      res.send("404 Anim Not Found");
    } else res.send(file[anim].comments)
    return
  }
}