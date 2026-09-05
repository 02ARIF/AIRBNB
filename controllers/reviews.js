const Listing = require("../models/listing");
const Review = require("../models/review");


// -------------------- CREATE REVIEW --------------------

module.exports.createReview = async (req, res) => {

  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash(
      "error",
      "The Listing you want to review may be deleted or does not exist!"
    );

    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);

  newReview.author = req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash(
    "success",
    "Review created Successfully!"
  );

  res.redirect(`/listings/${listing._id}`);
};


// -------------------- DELETE REVIEW --------------------

module.exports.destroyReview = async (req, res) => {

  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(
    id,
    {
      $pull: {
        reviews: reviewId,
      },
    }
  );

  await Review.findByIdAndDelete(reviewId);

  req.flash(
    "success",
    "Review Deleted Successfully!"
  );

  res.redirect(`/listings/${id}`);
};