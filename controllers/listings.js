const Listing = require("../models/listing");
const axios = require("axios");
//------------Index Route------------------

module.exports.index = async (req, res) => {
  const { search } = req.query;

  let allListings;

  if (search) {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
      ],
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("./listings/index.ejs", {
    allListings,
    search: search || "",
  });
};

// NEW LISTING FORM

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

// SHOW LISTING

module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash(
      "error",
      "The Listing you want to access may be deleted or does not exist!",
    );

    return res.redirect("/listings");
  }

  res.render("./listings/show.ejs", {
    listing,
  });
};

// EDIT FORM

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash(
      "error",
      "The Listing you want to access may be deleted or does not exist!",
    );

    return res.redirect("/listings");
  }

  res.render("./listings/edit.ejs", {
    listing,
  });
};

// CREATE LISTING

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);

  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  // Convert location into latitude and longitude
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: `${req.body.listing.location}, ${req.body.listing.country}`,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "Airbnb-Project",
      },
    }
  );

  if (response.data.length > 0) {
    const { lat, lon } = response.data[0];

    newListing.geometry = {
      type: "Point",
      coordinates: [Number(lon), Number(lat)],
    };
  } else {
    throw new ExpressError(400, "Location could not be found");
  }

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// UPDATE LISTING

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedListing) {
    req.flash(
      "error",
      "The Listing you want to update may be deleted or does not exist!"
    );

    return res.redirect("/listings");
  }

  // Change image ONLY if a new image is uploaded
  if (req.file) {
    updatedListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };

    await updatedListing.save();
  }
  req.flash("success", "Listing Updated Successfully!");

  res.redirect(`/listings/${id}`);
};

// DELETE LISTING

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndDelete(id);

  if (!listing) {
    req.flash(
      "error",
      "The Listing you want to delete may be deleted or does not exist!",
    );

    return res.redirect("/listings");
  }

  req.flash("success", "Listing Deleted Successfully!");

  res.redirect("/listings");
};
