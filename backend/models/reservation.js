const mongoose = require("mongoose");

// Define schemas
const ReservationSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  date: Date,
});

// Define models
module.exports = mongoose.model("Reservation", ReservationSchema);
