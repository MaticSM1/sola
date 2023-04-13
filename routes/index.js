//!       KNIŽNICE
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");


//!      DODATNE KNIŽNICE
const bcrypt = require("bcrypt");
const passport = require("passport");
const fs = require('fs');


//!     STRANI

//register page
router.get("/registerPage", (req, res) => {
  res.render("register");
});


//registracija
router.post("/register", (req, res) => {
  var rand = function () { return Math.random().toString(36).substr(2) }
  var token = function () { return rand() + rand() };

  const { name, email, password, password2 } = req.body;
  let error = false
  if (!name || !email || !password || !password2) {
    error = true
  }
  if (password !== password2) {
    error = true
  }
  if (password.length < 6) {
    error = true
  }
  if (error) {
    res.render("register", {
      error: error,
      name: name,
      email: email,
      password: password,
      password2: password2,
    });
  } else {
    //uspešno
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        error = true
        res.render("register", { error, name, email, password, password2 });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
          token: token() + token()
        });

        //bcrypt
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((value) => {
                console.log(value);
                req.flash("success_msg", "Uspešna prijava!");
                res.redirect("/home");
              })
              .catch((value) => console.log(value));
          })
        );
      }
    });
  }
});


//! logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Now logged out");
  res.redirect("/");
});


//! login 
router.post("/login", (req, res, next) => {


  let openUrl = "/home"
  if (req.body.lastOpen) openUrl = req.body.lastOpen
  if (req.body.forceUrl) openUrl = req.body.forceUrl

  if (req.body.ostaniPrijavljen == "save") openUrl = `/loginsave?url=${openUrl}`

  passport.authenticate("local", {
    successRedirect: `${openUrl}`,
    failureRedirect: "/?err=true",
    failureFlash: true,
  })(req, res, next);
});




router.get("/", (req, res) => {

  let domena = req.rawHeaders[1]
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  console.log(ip)

  res.render("main");

});



router.get("/home", ensureAuthenticated, (req, res) => {

  let domena = req.rawHeaders[1]
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  console.log(ip)

  res.render("home", {
    rand: Math.floor(Math.random() * 1000000000),
    boards: req.user.boards
  });

});


router.get("/board", async (req, res) => {
  res.render("board", {
    user: req.user,
    id: req.query.id,
  })
});


//!-----------------------------------------------|
//!               NALAGANJE DATOTEK               |
//!-----------------------------------------------|

router.post("/nalozi", async (req, res) => {

  //! naredi token
  var rand = function () { return Math.random().toString(36).substr(2) }
  var token = function () { return rand() + rand() };

  let koda = req.query.koda
  let user = req.query.user

  if (!user) return res.status(400).send("Napaka (Ne ve uporabnika)")
  if (!req.files) { return res.status(400).send("Nisi izbral nobene datoteke.") }

  //! spremenlivke
  const file = req.files.myFile;
  var fs = require('fs');
  const imeDatoteke = file.name;
  const fileVelikost = file.size

  //! preveri format

  //todo  SLIKE
  if (imeDatoteke.includes('.png')) { console.log("PNG datoteka") }
  else if (imeDatoteke.includes('.jpg')) { console.log("JPG datoteka") }
  else { return res.status(422).send("DATOTEKA NI DOVOLJENA") }



  //? PC
  const path = __dirname + "../../public/nalozeno/" + user + "/" + file.name;
  let dir = __dirname + "../../public/nalozeno/" + user;
  //? SERVER
  //const path = "/media/data/" + user + "/" + file.name;
  //let dir = "/media/data/" + user;




  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  file.mv(path, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.send("ok");
  })
})



//!-----------------------------------------------|
//!                   STORE SAVE                  |
//!-----------------------------------------------|

router.post("/store", async (req, res) => {





  let board = req.query.board

  if (req.user) {
    if (req.user.boards) {

      let found = false

      req.user.boards.forEach(el => {
        if (el[0] == board) found = true
      });

      //if (!req.user.boards.includes(board)) {
      if (!found) {

        let arr = req.user.boards
        arr.push([board, board, new Date()])
        await User.updateOne(
          {
            _id: req.user._id,
          },
          {
            boards: arr,
          }
        );
      }
    }
  }
  console.log("USER:")
  console.log(req.user)




  if (!fs.existsSync(__dirname + "../../public/nalozeno/" + board + "/")) {
    fs.mkdirSync(__dirname + "../../public/nalozeno/" + board + "/");
  }



  let dir = __dirname + "../../public/nalozeno/" + board + "/save.txt";

  fs.writeFileSync(dir, JSON.stringify(req.body));


  res.send("ok");

})



router.get("/get", async (req, res) => {

  let user = req.query.user
  let board = req.query.board




  if (!fs.existsSync(__dirname + "../../public/nalozeno/" + board + "/")) {
    fs.mkdirSync(__dirname + "../../public/nalozeno/" + board + "/");
  }



  let dir = __dirname + "../../public/nalozeno/" + board + "/save.txt";

  fs.writeFileSync(dir, 'Hey there!');


  res.send("ok");

})


router.get("/novoime", async (req, res) => {


  console.log("aha")

  let i = Number(req.query.i)
  let ime = req.query.ime

  if (req.user) {


    let arr = req.user.boards
    arr[i][1] = ime

    await User.updateOne(
      {
        _id: req.user._id,
      },
      {
        boards: arr,
      }
    );

    console.log(req.user.boards)

  }

  res.send("ok");

})



router.get("/zbrisiBoard", async (req, res) => {


  console.log("aha")

  let i = Number(req.query.i)

  if (req.user) {


    let arr = req.user.boards
    arr.splice(i, 1)

    await User.updateOne(
      {
        _id: req.user._id,
      },
      {
        boards: arr,
      }
    );

    console.log(req.user.boards)

  }

  res.send("ok");

})



router.get("/dodajMail", async (req, res) => {


  let mail = req.query.mail
  let ime = req.query.ime

  if (req.user) {


    await User.updateOne(
      {
        email: mail,
      },
      {
        $push: { boards: [ime, ime, new Date()] },
      }
    );

    console.log(req.user.boards)

  }

  res.send("ok");

})







module.exports = router;