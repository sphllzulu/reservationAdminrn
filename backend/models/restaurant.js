// const mongoose = require('mongoose');

// const RestaurantSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   address: {
//     type: String,
//     required: true,
//   },
//   phone: {
//     type: String,
//     required: true,
//   },
//   cuisine: {
//     type: String,
//     required: true,
//   },
//   menu: [{
//     name: { type: String, required: true },
//     image: { type: String } 
//   }],
//   rating: {
//     type: Number,
//     min: 0,
//     max: 5,
//     default: 0,
//   },
//   reviews: [
//     {
//       user: { type: String, required: true }, // Name of the user
//       rating: { type: Number, min: 0, max: 5, required: true },
//       date: { type: Date, default: Date.now },
//       comment: { type: String, required: true },
//     },
//   ],
//   images: {
//     type: [String], // Array of URLs for multiple images
//   },
//   description: {
//     type: String, // Short description of the restaurant
//     required: true,
//     trim: true,
//   },
//   pricePerReservation: { // Rename from priceToReserve
//     type: Number,
//     required: true,
//     min: 0
//   },
//   dressCode: {
//     type: String, // Dress code for the restaurant
//     required: false,
//     trim: true,
//   },
//   amenities: [
//     {
//       type: String,
//       enum: [
//         'WiFi',
//         'Parking',
//         'Outdoor Seating',
//         'Delivery',
//         'Takeout',
//         'Wheelchair Accessible',
//         'Vegetarian Options',
//         'Vegan Options',
//       ],
//     },
//   ],
//   reservations: {
//     type: Boolean,
//     default: false,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Restaurant', RestaurantSchema);


// const mongoose = require('mongoose');

// const RestaurantSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   address: {
//     type: String,
//     required: true,
//   },
//   location: {
//     latitude: {
//       type: Number,
//       required: true,
//       min: -90,
//       max: 90
//     },
//     longitude: {
//       type: Number,
//       required: true,
//       min: -180,
//       max: 180
//     }
//   },
//   phone: {
//     type: String,
//     required: true,
//   },
//   cuisine: {
//     type: String,
//     required: true,
//   },
//   menu: [{
//     name: { type: String, required: true },
//     image: { type: String } 
//   }],
//   rating: {
//     type: Number,
//     min: 0,
//     max: 5,
//     default: 0,
//   },
//   reviews: [
//     {
//       user: { type: String, required: true }, 
//       rating: { type: Number, min: 0, max: 5, required: true },
//       date: { type: Date, default: Date.now },
//       comment: { type: String, required: true },
//     },
//   ],
//   images: {
//     type: [String],
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   pricePerReservation: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   dressCode: {
//     type: String,
//     required: false,
//     trim: true,
//   },
//   amenities: [
//     {
//       type: String,
//       enum: [
//         'WiFi',
//         'Parking',
//         'Outdoor Seating',
//         'Delivery',
//         'Takeout',
//         'Wheelchair Accessible',
//         'Vegetarian Options',
//         'Vegan Options',
//       ],
//     },
//   ],
//   availableTimeSlots: [
//     {
//       day: {
//         type: String,
//         required: true,
//         enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
//       },
//       slots: [
//         {
//           time: {
//             type: String,
//             required: true,
//             match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
//           },
//           maxReservations: {
//             type: Number,
//             required: true,
//             min: 1
//           },
//           currentReservations: {
//             type: Number,
//             default: 0,
//             min: 0
//           }
//         }
//       ]
//     }
//   ],
//   reservations: {
//     type: Boolean,
//     default: false,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Restaurant', RestaurantSchema);


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
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  phone: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  menu: [
    {
      name: { type: String, required: true },
      image: { type: String },
    },
  ],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviews: [
    {
      user: { type: String, required: true },
      rating: { type: Number, min: 0, max: 5, required: true },
      date: { type: Date, default: Date.now },
      comment: { type: String, required: true },
    },
  ],
  images: {
    type: [String],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  pricePerReservation: {
    type: Number,
    required: true,
    min: 0,
  },
  dressCode: {
    type: String,
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
  availableTimeSlots: [
    {
      day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      slots: [
        {
          time: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
          },
          maxReservations: {
            type: Number,
            required: true,
            min: 1,
          },
          currentReservations: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
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
