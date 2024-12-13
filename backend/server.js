require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const User = require('./models/admin');
const Restaurant = require('./models/restaurant');
const Reservation = require('./models/reservation')



const app = express();
const PORT = process.env.PORT || 5000;


const fs = require('fs');


// Before your multer configuration
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('MongoDB connected successfully');
    // Create admin user if not exists
    await User.createAdminIfNotExists();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: [
      'exp://192.168.1.48:8082', 
      'http://192.168.1.48:8082', 
      'http://192.168.1.48:8082'
    ],
    credentials: true
  }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_very_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.session.userId = user._id;
    res.json({
      message: 'Admin login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Admin-specific route to get user information
app.get('/api/admin/users', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const admin = await User.findById(req.session.userId);
    if (!admin || admin.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

//signout route
app.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send({ message: 'Error signing out' });
    res.clearCookie('connect.sid');
    res.status(200).send({ message: 'Logged out' });
  });
});

//profile section server logic
// Add this route to your existing Express server file
app.get('/api/admin/me', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the admin user and exclude the password
    const admin = await User.findById(req.session.userId).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      id: admin._id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin profile', error: error.message });
  }
});

// Restaurant Routes
const restaurantRouter = express.Router();


// restaurantRouter.post('/', upload.array('images', 10), async (req, res) => {
//     try {
//       const imagePaths = req.files.map(file => file.path);
      
//       // Parse menu from body
//       const menu = req.body.menu ? JSON.parse(req.body.menu) : [];
  
//       const restaurantData = {
//         ...req.body,
//         menu: menu.map(item => ({
//           name: item.name,
//           image: item.image
//         })),
//         images: imagePaths
//       };
  
//       const newRestaurant = new Restaurant(restaurantData);
//       const savedRestaurant = await newRestaurant.save();
//       res.status(201).json(savedRestaurant);
//     } catch (error) {
//       console.error('Restaurant creation error:', error);
//       res.status(400).json({ 
//         message: 'Error creating restaurant', 
//         error: error.message 
//       });
//     }
//   });
restaurantRouter.post('/', upload.array('images', 10), async (req, res) => {
  try {
    console.log('Request body:', req.body); // Log the request body

    // Extract image paths
    const imagePaths = req.files.map(file => file.path);

    // Parse menu from body
    const menu = req.body.menu ? JSON.parse(req.body.menu) : [];

    // Parse availableTimeSlots from body
    const availableTimeSlots = req.body.availableTimeSlots ? JSON.parse(req.body.availableTimeSlots) : [];

    // Construct restaurant data
    const restaurantData = {
      ...req.body,
      menu: menu.map(item => ({
        name: item.name,
        image: item.image
      })),
      images: imagePaths,
      availableTimeSlots: availableTimeSlots.map(daySlot => ({
        day: daySlot.day,
        slots: daySlot.slots.map(slot => ({
          time: slot.time,
          maxReservations: parseInt(slot.maxReservations),
          currentReservations: 0 // Initialize currentReservations to 0
        }))
      }))
    };

    // Validate required fields
    const requiredFields = ['name', 'address', 'cuisine', 'location[latitude]', 'location[longitude]'];
    for (let field of requiredFields) {
      if (!req.body.location || !req.body.location.latitude || !req.body.location.longitude) {
        return res.status(400).json({ message: 'Missing required location fields' });
      }
    }

    // Validate availableTimeSlots
    for (let daySlot of restaurantData.availableTimeSlots) {
      for (let slot of daySlot.slots) {
        if (!slot.time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.time)) {
          return res.status(400).json({ message: 'Invalid time format in availableTimeSlots' });
        }
        if (!slot.maxReservations || isNaN(slot.maxReservations) || slot.maxReservations < 1) {
          return res.status(400).json({ message: 'Invalid maxReservations in availableTimeSlots' });
        }
      }
    }

    // Create new restaurant
    const newRestaurant = new Restaurant(restaurantData);
    const savedRestaurant = await newRestaurant.save();

    res.status(201).json(savedRestaurant);
  } catch (error) {
    console.error('Restaurant creation error:', error);
    res.status(400).json({ 
      message: 'Error creating restaurant', 
      error: error.message 
    });
  }
});


//get restaurants
restaurantRouter.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
});

// GET a restaurant by ID
restaurantRouter.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
  }
});

// Update a restaurant by ID
// restaurantRouter.put('/:id', upload.array('images', 10), async (req, res) => {
//   try {
//     const imagePaths = req.files ? req.files.map(file => file.path) : [];
    
//     // Parse menu from body
//     const menu = req.body.menu ? JSON.parse(req.body.menu) : [];
    
//     // Parse availableTimeSlots
//     const availableTimeSlots = req.body.availableTimeSlots 
//       ? JSON.parse(req.body.availableTimeSlots) 
//       : [];
    
//       const restaurantData = {
//         ...req.body,
//         menu: menu.map(item => ({
//           name: item.name,
//           image: item.image
//         })),
//         images: imagePaths.length > 0 ? imagePaths : undefined,
//         location: JSON.parse(req.body.location), // Parse the location object
//         availableTimeSlots: availableTimeSlots.map(daySlot => ({
//           day: daySlot.day,
//           slots: daySlot.slots.map(slot => ({
//             time: slot.time,
//             maxReservations: parseInt(slot.maxReservations),
//             currentReservations: 0
//           }))
//         }))
//       };

//        // Validate location
//     if (!restaurantData.location || !restaurantData.location.latitude || !restaurantData.location.longitude) {
//       return res.status(400).json({ message: 'Location is required with valid latitude and longitude' });
//     }

//     // const restaurantData = {
//     //   ...req.body,
//     //   menu: menu.map(item => ({
//     //     name: item.name,
//     //     image: item.image
//     //   })),
//     //   images: imagePaths.length > 0 ? imagePaths : undefined,
//     //   location: {
//     //     latitude: req.body['location[latitude]'],
//     //     longitude: req.body['location[longitude]']
//     //   },
//     //   availableTimeSlots: availableTimeSlots.map(daySlot => ({
//     //     day: daySlot.day,
//     //     slots: daySlot.slots.map(slot => ({
//     //       time: slot.time,
//     //       maxReservations: parseInt(slot.maxReservations),
//     //       currentReservations: 0
//     //     }))
//     //   }))
//     // };

//     // Remove undefined properties
//     Object.keys(restaurantData).forEach(key => 
//       restaurantData[key] === undefined && delete restaurantData[key]
//     );

//     const updatedRestaurant = await Restaurant.findByIdAndUpdate(
//       req.params.id, 
//       { $set: restaurantData }, 
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedRestaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }
//     res.json(updatedRestaurant);
//   } catch (error) {
//     console.error('Restaurant update error:', error);
//     res.status(400).json({ 
//       message: 'Error updating restaurant', 
//       error: error.message 
//     });
//   }
// });
restaurantRouter.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map(file => file.path) : [];
    
    // Parse menu from body
    const menu = req.body.menu ? JSON.parse(req.body.menu) : [];
    
    // Parse availableTimeSlots
    const availableTimeSlots = req.body.availableTimeSlots 
      ? JSON.parse(req.body.availableTimeSlots) 
      : [];
    
    // Parse location carefully
    let location;
    try {
      location = typeof req.body.location === 'string' 
        ? JSON.parse(req.body.location) 
        : req.body.location;
    } catch (parseError) {
      console.error('Location parsing error:', parseError);
      return res.status(400).json({ message: 'Invalid location format' });
    }

    const restaurantData = {
      ...req.body,
      menu: menu.map(item => ({
        name: item.name,
        image: item.image
      })),
      images: imagePaths.length > 0 ? imagePaths : undefined,
      location: {
        latitude: location?.latitude || location?.lat,
        longitude: location?.longitude || location?.lng
      },
      availableTimeSlots: availableTimeSlots.map(daySlot => ({
        day: daySlot.day,
        slots: daySlot.slots.map(slot => ({
          time: slot.time,
          maxReservations: parseInt(slot.maxReservations),
          currentReservations: 0
        }))
      }))
    };

    // Remove undefined properties
    Object.keys(restaurantData).forEach(key => 
      restaurantData[key] === undefined && delete restaurantData[key]
    );

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id, 
      { $set: restaurantData }, 
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(updatedRestaurant);
  } catch (error) {
    console.error('Restaurant update error:', error);
    res.status(400).json({ 
      message: 'Error updating restaurant', 
      error: error.message 
    });
  }
});

// Delete a restaurant by ID
restaurantRouter.delete('/:id', async (req, res) => {
  try {
    const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!deletedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting restaurant', error: error.message });
  }
});

// Analytics endpoint
app.get('/reservation', async (req, res) => {
  try {
    // Count total restaurants
    const totalRestaurants = await Restaurant.countDocuments();

    // Count total users
    const totalUsers = await User.countDocuments();

    // Aggregate reservations per restaurant
    const reservationsPerRestaurant = await Reservation.aggregate([
      {
        $group: {
          _id: '$restaurantId',
          totalReservations: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurant',
        },
      },
      {
        $unwind: '$restaurant',
      },
      {
        $project: {
          _id: 0,
          restaurantName: '$restaurant.name',
          totalReservations: 1,
        },
      },
    ]);

    res.json({
      totalRestaurants,
      totalUsers,
      reservationsPerRestaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});
//GET reservations
app.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      // .populate('userId', 'name') 
      // .populate('restaurantId', 'name'); 

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});
// Mount the router
app.use('/api/restaurants', restaurantRouter);


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
