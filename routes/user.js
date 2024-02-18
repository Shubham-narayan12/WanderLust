const express = require("express");
const router = express.Router();
const User = require("../models/userModel.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../utils/middleware.js");

//render form for signUp
router.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

//signup for user
router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      let registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", `welcome ${username}`);
        res.redirect("/listings");
      });

    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  })
);

//login for user
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl, 
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    let { username } = req.body;
    req.flash("success", `welcome back ${username}`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);

//logout user
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "logged you out");
    res.redirect("/listings");
  });
});

module.exports = router;
