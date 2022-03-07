const fs = require("fs")
const sha256 = require('./sha256')

let got, FormData
import('got').then(data => got = data.got), import('formdata-node').then(data => FormData = data.FormData)
const passport = require('passport');

setTimeout(function () { console.log(got, FormData) }, 2000)
/***********
 * Models       
 **********/
var Anim = require('../models/Anim'),
  User = require('../models/User')

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
  }, login: async function (req, res, next) {
    // configure passport.js to use the local strategy
    passport.authenticate('local', (err, user, info) => {
      if (info) { return res.send(info.message) }
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.login(user, (err) => {
        return res.send('You were authenticated & logged in!\n');
      })
    })(req, res, next);
  },// request.isAuthenticated() is the function to determine
  //authentication
}