const mongoose = require("mongoose");

// Define schemas
const ReservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'User', // Reference to the User collection
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    // ref: 'Restaurant', // Reference to the Restaurant collection
    required: true,
  },
  partySize: {
    type: Number,
    required: true,
    min: 1, // Ensure at least 1 person
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (v) {
    //     return /^\d{2}:\d{2}$/.test(v); // Validate time format as HH:MM
    //   },
    //   message: (props) => `${props.value} is not a valid time format!`,
    // },
  },
});

// Define models
module.exports = mongoose.model("Reservation", ReservationSchema);
