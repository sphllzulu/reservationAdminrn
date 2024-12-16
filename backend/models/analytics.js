const mongoose = require("mongoose");

// Define schemas
const RestaurantSchema = new mongoose.Schema({
  name: String,
});

// Define models
module.exports = mongoose.model("Restaurant", RestaurantSchema);
