const User = require("../models/user");
const passport = require("passport");

// -------------------- SIGNUP FORM --------------------

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};


// -------------------- SIGNUP --------------------

module.exports.signup = async (req, res, next) => {
  try {

    let { username, email, password } = req.body;

    const newUser = new User({
      email,
      username
    });

    const registerUser = await User.register(
      newUser,
      password
    );

    console.log(registerUser);

    req.login(registerUser, (err) => {

      if (err) {
        return next(err);
      }

      req.flash(
        "success",
        "User was registered successfully!"
      );

      res.redirect("/listings");

    });

  } catch (e) {

    req.flash(
      "error",
      e.message
    );

    res.redirect("/signup");

  }
};


// -------------------- LOGIN FORM --------------------

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};


// -------------------- LOGIN --------------------

module.exports.login = async (req, res) => {

  req.flash(
    "success",
    "Welcome To Airbnb!"
  );

  let redirectUrl =
    res.locals.redirectUrl || "/listings";

  res.redirect(redirectUrl);
};


// -------------------- LOGOUT --------------------

module.exports.logout = (req, res, next) => {

  req.logout((err) => {

    if (err) {
      return next(err);
    }

    req.flash(
      "success",
      "You are logged out!"
    );

    res.redirect("/listings");

  });

};