const express = require("express");
const router = express.Router();
const { listingSchema } = require("../schema");
const ExpressError = require("../utils/ExpressError");

const {
  isLoggedIn,
  isOwner
} = require("../middleware");

const wrapAsync = require("../utils/wrapAsync");

const listingController = require("../controllers/listings");
const multer = require('multer');
const {storage} = require('../cloudConfig')
const upload = multer({storage});



// -------------------- JOI VALIDATION --------------------

const validateListing = (req, res, next) => {

  const { error } = listingSchema.validate(req.body);

  if (error) {
    throw new ExpressError(
      400,
      error.details[0].message
    );
  }

  next();
};

// -------------------- ALL LISTINGS + CREATE --------------------

router.route("/")
  .get(
    wrapAsync(listingController.index)
  )

  .post(
    isLoggedIn,
    validateListing,upload.single('listing[image]'),
    wrapAsync(listingController.createListing)
  );
// -------------------- NEW LISTING --------------------

router.get(
  "/new",
  isLoggedIn,
  wrapAsync(listingController.renderNewForm)
);


// -------------------- SHOW + UPDATE + DELETE --------------------

router.route("/:id")

  .get(
    wrapAsync(listingController.showListing)
  )

  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )

  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );


// -------------------- EDIT FORM --------------------

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);
module.exports = router;