const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  tmdbId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: "Unknown Title"
  },
  cast: [{
    name: String,
    character: String,
    profile_path: String
  }],
  crew: [{
    name: String,
    job: String,
    department: String
  }]
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
