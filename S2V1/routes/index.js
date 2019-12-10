var express = require("express");
var router = express.Router();
let User = require("../models/user");

// GET /
router.get("/", async (_, res, next) => {
  res.render("index", { title: "Home" });
});

// GET /about
router.get("/about", async (_, res, next) => {
  res.render("about", { title: "About" });
});
// GET /register
router.get("/register", async (_, res) => {
  res.render("register", { title: "Signup" });
});

//POST /register

router.post("/register", async (req, res, next) => {
  const { email, name, favoriteBook, password, confirmPassword } = req.body;
  if (email && name && favoriteBook && password && confirmPassword) {
    //check password match
    if (password !== confirmPassword) {
      let err = new Error("passwords do not match");
      err.status = 400;
      return next(err);
    }

    //create object with form input
    let userData = {
      email: email,
      name: name,
      favoriteBook: favoriteBook,
      password: password
    };

    // use scheme create method to insert doc into mongo
    User.create(userData, (error, user) => {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user.id;
        return res.redirect("/profile");
      }
    });
  } else {
    let err = new Error("all fields required");
    err.status = 400;
    return next(err);
  }
});

// GET /contact
router.get("/contact", async (_, res) => {
  res.render("contact", { title: "Contact" });
});

//get login
router.get("/login", async (req, res, next) => {
  res.render("login", { title: "Log in" });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    User.authenticate(email, password, (error, user) => {
      if (error || !user) {
        let err = new Error("Wrong email or password!");
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect("/profile");
      }
    });
  } else {
    let err = new Error("email and password are required!");
    err.status = 401;
    return next(err);
  }
});

router.get("/profile", async (req, res, next) => {
  if (!req.session.userId) {
    var err = new Error("You are not authorized to view this page.");
    err.status = 403;
    return next(err);
  }
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      return res.render("profile", {
        title: "Profile",
        name: user.name,
        favorite: user.favoriteBook
      });
    }
  });
});

module.exports = router;
