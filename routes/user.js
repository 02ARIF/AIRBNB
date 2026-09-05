const express = require("express");
const router = express.Router();

const passport = require("passport");

const wrapAsync = require("../utils/wrapAsync");

const {
  saveRedirectUrl
} = require("../middleware");

const userController = require("../controllers/users");


// -------------------- SIGNUP --------------------

router.get(
  "/signup",
  userController.renderSignupForm
);

router.post(
  "/signup",
  wrapAsync(userController.signup)
);


// -------------------- LOGIN --------------------

router.get(
  "/login",
  userController.renderLoginForm
);

router.post(
  "/login",
  saveRedirectUrl,

  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),

  userController.login
);


// -------------------- LOGOUT --------------------

router.get(
  "/logout",
  userController.logout
);


module.exports = router;