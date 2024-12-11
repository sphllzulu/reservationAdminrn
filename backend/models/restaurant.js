const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  menu: [{
    name: { type: String, required: true },
    image: { type: String } 
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: [
    {
      user: { type: String, required: true }, // Name of the user
      rating: { type: Number, min: 0, max: 5, required: true },
      date: { type: Date, default: Date.now },
      comment: { type: String, required: true },
    },
  ],
  images: {
    type: [String], // Array of URLs for multiple images
  },
  description: {
    type: String, // Short description of the restaurant
    required: true,
    trim: true,
  },
  pricePerReservation: { // Rename from priceToReserve
    type: Number,
    required: true,
    min: 0
  },
  dressCode: {
    type: String, // Dress code for the restaurant
    required: false,
    trim: true,
  },
  amenities: [
    {
      type: String,
      enum: [
        'WiFi',
        'Parking',
        'Outdoor Seating',
        'Delivery',
        'Takeout',
        'Wheelchair Accessible',
        'Vegetarian Options',
        'Vegan Options',
      ],
    },
  ],
  reservations: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
