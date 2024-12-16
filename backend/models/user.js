const mongoose = require("mongoose");

// Define schemas
const UserSchema = new mongoose.Schema({
  name: String,
});

// Define models
module.exports = mongoose.model("User", UserSchema);
