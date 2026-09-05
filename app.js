// -------------------- ENVIRONMENT VARIABLES --------------------

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// -------------------- IMPORTS --------------------

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const user = require("./routes/user");

const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");

// -------------------- APP CONFIGURATION --------------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// -------------------- DATABASE CONNECTION --------------------

const dburl = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dburl);
  console.log("connected to MongoDB");
}

main().catch((err) => {
  console.log("MongoDB connection error:", err);
});

// -------------------- MONGO SESSION STORE --------------------

const store = MongoStore.create({
  mongoUrl: dburl,

  crypto: {
    secret: process.env.SECRET,
  },

  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("Error in MONGO SESSION STORE:", err);
});

// -------------------- SESSION --------------------

const sessionOptions = {
  store: store,

  secret: process.env.SECRET,

  resave: false,

  saveUninitialized: true,

  cookie: {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ),

    maxAge: 7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};

app.use(session(sessionOptions));

// -------------------- FLASH --------------------

app.use(flash());

// -------------------- PASSPORT --------------------

app.use(passport.initialize());

app.use(passport.session());

passport.use(
  new localStrategy(User.authenticate())
);

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// -------------------- LOCALS --------------------

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});

// -------------------- ROOT ROUTE --------------------

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// -------------------- LISTING ROUTES --------------------

app.use("/listings", listingRouter);

// -------------------- REVIEW ROUTES --------------------

app.use(
  "/listings/:id/reviews",
  reviewRouter
);

// -------------------- USER ROUTES --------------------

app.use("/", user);

// -------------------- FAVICON --------------------

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

// -------------------- CHROME DEVTOOLS --------------------

app.get(
  "/.well-known/appspecific/com.chrome.devtools.json",
  (req, res) => {
    res.status(204).end();
  }
);

// -------------------- 404 CATCH-ALL --------------------

app.all("/*splat", (req, res, next) => {
  console.log("404 hit for:", req.originalUrl);

  next(
    new ExpressError(
      404,
      "Page Not Found"
    )
  );
});

// -------------------- ERROR HANDLING --------------------

app.use((err, req, res, next) => {
  console.log(err);

  const {
    statusCode = 500,
    message = "Something went wrong",
  } = err;

  res.status(statusCode).render(
    "./listings/error.ejs",
    {
      message,
    }
  );
});

// -------------------- SERVER --------------------

const PORT = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});