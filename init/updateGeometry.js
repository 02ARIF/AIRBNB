const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/AIRBNB";

async function updateGeometry() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  const listings = await Listing.find({});

  for (let listing of listings) {
    if (!listing.location || !listing.country) {
      console.log(`Skipping: ${listing.title}`);
      continue;
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${listing.location}, ${listing.country}`,
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

      listing.geometry = {
        type: "Point",
        coordinates: [Number(lon), Number(lat)],
      };

      await listing.save();

      console.log(
        `Updated: ${listing.title} → [${lon}, ${lat}]`
      );
    } else {
      console.log(`Location not found: ${listing.location}`);
    }
  }

  await mongoose.connection.close();
  console.log("Done!");
}

updateGeometry();