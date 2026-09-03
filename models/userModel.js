const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  email:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  savedMovies: [{
    tmdbId: String,
    title: String,
    poster_path: String,
    vote_average: Number
  }]
})

const user = mongoose.model("User",userSchema);

module.exports= user;