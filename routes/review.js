const express = require("express");

const router = express.Router({
  mergeParams: true
});

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const { reviewSchema } = require("../schema");

const {
  isLoggedIn,
  isReviewAuthor
} = require("../middleware");

const reviewController = require("../controllers/reviews");


// -------------------- REVIEW VALIDATION --------------------

const validateReview = (req, res, next) => {

  const { error } = reviewSchema.validate(req.body);

  if (error) {
    throw new ExpressError(
      400,
      error.details[0].message
    );
  }

  next();
};


// -------------------- CREATE REVIEW --------------------

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);


// -------------------- DELETE REVIEW --------------------

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);


module.exports = router;