
import dotenv from 'dotenv'
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import User from './models/admin.js';
import Restaurant from './models/restaurant.js';
import Reservation from './models/reservation.js';
import { storage } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

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
      'exp://192.168.1.48:8081', 
      'http://192.168.1.48:8081', 
      'http://192.168.1.48:8081'
    ],
    credentials: true
  }));
app.use(express.json());


//
const convertBase64ToBuffer = (base64String) => {
  // Remove the data:image/jpeg;base64, prefix if it exists
  const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64WithoutPrefix, 'base64');
};
//New file upload
// Updated uploadImagesToFirebase function to handle both base64 and file uploads
const uploadImagesToFirebase = async (images) => {
  try {
    const imageUrls = [];

    for (const image of images) {
      let buffer;
      let fileName;

      if (typeof image === 'string' && image.startsWith('data:image')) {
        // Handle base64 string
        buffer = convertBase64ToBuffer(image);
        fileName = `restaurants/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      } else if (image.buffer) {
        // Handle multer file
        buffer = image.buffer;
        fileName = `restaurants/${Date.now()}_${image.originalname}`;
      } else {
        continue; // Skip invalid image data
      }

      // Create a storage reference
      const fileRef = ref(storage, fileName);

      // Upload to Firebase Storage
      const snapshot = await uploadBytes(fileRef, buffer, {
        contentType: 'image/jpeg'
      });

      // Get the public URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      imageUrls.push(downloadURL);
    }

    return imageUrls;
  } catch (error) {
    console.error("Error uploading images to Firebase:", error);
    throw new Error("Failed to upload images");
  }
};


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

// Endpoint to get all users with the role 'USER'
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'USER' });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Endpoint to delete a user by ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Endpoint to block a user by ID
app.patch('/users/:id/block', async (req, res) => {
  const { id } = req.params;
  try {
    const blockedUser = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    if (!blockedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User blocked successfully', user: blockedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Restaurant Routes
const restaurantRouter = express.Router();



// restaurantRouter.post("/", async (req, res) => {
//   try {
//     console.log("Request body:", req.body);

//     // Upload images to Firebase and get their URLs
//     const imageUrls = await uploadImagesToFirebase(req.files);

//     // Parse menu from body
//     const menu = req.body.menu ? JSON.parse(req.body.menu) : [];

//     // Parse availableTimeSlots from body
//     const availableTimeSlots = req.body.availableTimeSlots ? JSON.parse(req.body.availableTimeSlots) : [];

//     // Construct restaurant data
//     const restaurantData = {
//       ...req.body,
//       menu: menu.map((item, index) => ({
//         name: item.name,
//         image: imageUrls[index] || null, // Map uploaded image URLs to menu items
//       })),
//       images: imageUrls,
//       availableTimeSlots: availableTimeSlots.map((daySlot) => ({
//         day: daySlot.day,
//         slots: daySlot.slots.map((slot) => ({
//           time: slot.time,
//           maxReservations: parseInt(slot.maxReservations),
//           currentReservations: 0, // Initialize currentReservations to 0
//         })),
//       })),
//     };


//     // Validate required fields
//     const requiredFields = ['name', 'address', 'cuisine', 'location[latitude]', 'location[longitude]'];
//     for (let field of requiredFields) {
//       if (!req.body.location || !req.body.location.latitude || !req.body.location.longitude) {
//         return res.status(400).json({ message: 'Missing required location fields' });
//       }
//     }

//     // Validate availableTimeSlots
//     for (let daySlot of restaurantData.availableTimeSlots) {
//       for (let slot of daySlot.slots) {
//         if (!slot.time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(slot.time)) {
//           return res.status(400).json({ message: 'Invalid time format in availableTimeSlots' });
//         }
//         if (!slot.maxReservations || isNaN(slot.maxReservations) || slot.maxReservations < 1) {
//           return res.status(400).json({ message: 'Invalid maxReservations in availableTimeSlots' });
//         }
//       }
//     }

//     // Create new restaurant
//     const newRestaurant = new Restaurant(restaurantData);
//     const savedRestaurant = await newRestaurant.save();

//     res.status(201).json(savedRestaurant);
//   } catch (error) {
//     console.error('Restaurant creation error:', error);
//     res.status(400).json({ 
//       message: 'Error creating restaurant', 
//       error: error.message 
//     });
//   }
// });
restaurantRouter.post("/", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    let restaurantImages = [];
    let menuImages = [];

    // Handle base64 images if they exist in the request
    if (req.body.images) {
      const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      restaurantImages = await uploadImagesToFirebase(images);
    }

    // Parse and handle menu items with their images
    let menu = [];
    if (req.body.menu) {
      const menuItems = typeof req.body.menu === 'string' ? 
        JSON.parse(req.body.menu) : req.body.menu;

      // Upload menu images and create menu items
      for (const item of menuItems) {
        let imageUrl = null;
        if (item.image) {
          const uploadedUrls = await uploadImagesToFirebase([item.image]);
          imageUrl = uploadedUrls[0];
        }
        menu.push({
          name: item.name,
          image: imageUrl
        });
      }
    }

    // Parse availableTimeSlots
    const availableTimeSlots = req.body.availableTimeSlots ? 
      (typeof req.body.availableTimeSlots === 'string' ? 
        JSON.parse(req.body.availableTimeSlots) : req.body.availableTimeSlots) : [];

    // Handle location
    const location = req.body.location ? 
      (typeof req.body.location === 'string' ? 
        JSON.parse(req.body.location) : req.body.location) : 
      { latitude: 0, longitude: 0 };

    // Construct restaurant data
    const restaurantData = {
      ...req.body,
      menu,
      images: restaurantImages,
      location: {
        latitude: location.latitude || location.lat,
        longitude: location.longitude || location.lng
      },
      availableTimeSlots: availableTimeSlots.map((daySlot) => ({
        day: daySlot.day,
        slots: daySlot.slots.map((slot) => ({
          time: slot.time,
          maxReservations: parseInt(slot.maxReservations),
          currentReservations: 0,
        })),
      })),
    };

    // Validate required fields
    if (!restaurantData.location.latitude || !restaurantData.location.longitude) {
      return res.status(400).json({ message: 'Missing required location fields' });
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


// restaurantRouter.put('/:id', async (req, res) => {
//   try {
//     // Handle uploaded image files and extract URLs
//     const imageUrls = req.files ? await Promise.all(
//       req.files.map(async (file) => {
//         const fileRef = ref(storage, `restaurants/${Date.now()}_${file.originalname}`);
//         const snapshot = await uploadBytes(fileRef, file.buffer);
//         const downloadURL = await getDownloadURL(snapshot.ref);
//         return downloadURL;
//       })
//     ) : [];
    
//     // Parse menu from body
//     const menu = req.body.menu ? JSON.parse(req.body.menu) : [];
    
//     // Parse availableTimeSlots
//     const availableTimeSlots = req.body.availableTimeSlots 
//       ? JSON.parse(req.body.availableTimeSlots) 
//       : [];
    
//     // Parse location carefully
//     let location;
//     try {
//       location = typeof req.body.location === 'string' 
//         ? JSON.parse(req.body.location) 
//         : req.body.location;
//     } catch (parseError) {
//       console.error('Location parsing error:', parseError);
//       return res.status(400).json({ message: 'Invalid location format' });
//     }

//     const restaurantData = {
//       ...req.body,
//       menu: menu.map((item, index) => ({
//         name: item.name,
//         image: imageUrls[index] || null, // Map uploaded image URLs to menu items
//       })),
//       images: imageUrls,
//       location: {
//         latitude: location?.latitude || location?.lat,
//         longitude: location?.longitude || location?.lng
//       },
//       availableTimeSlots: availableTimeSlots.map(daySlot => ({
//         day: daySlot.day,
//         slots: daySlot.slots.map(slot => ({
//           time: slot.time,
//           maxReservations: parseInt(slot.maxReservations),
//           currentReservations: 0
//         }))
//       }))
//     };

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
restaurantRouter.put('/:id', async (req, res) => {
  try {
    let restaurantImages = [];
    let menu = [];

    // Handle restaurant images
    if (req.body.images) {
      const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      restaurantImages = await uploadImagesToFirebase(images);
    }

    // Handle menu items with images
    if (req.body.menu) {
      const menuItems = typeof req.body.menu === 'string' ? 
        JSON.parse(req.body.menu) : req.body.menu;

      for (const item of menuItems) {
        let imageUrl = null;
        if (item.image) {
          const uploadedUrls = await uploadImagesToFirebase([item.image]);
          imageUrl = uploadedUrls[0];
        }
        menu.push({
          name: item.name,
          image: imageUrl
        });
      }
    }

    // Parse location and availableTimeSlots
    const location = typeof req.body.location === 'string' ? 
      JSON.parse(req.body.location) : req.body.location;

    const availableTimeSlots = req.body.availableTimeSlots ? 
      (typeof req.body.availableTimeSlots === 'string' ? 
        JSON.parse(req.body.availableTimeSlots) : req.body.availableTimeSlots) : [];

    const restaurantData = {
      ...req.body,
      menu,
      images: restaurantImages.length > 0 ? restaurantImages : undefined,
      location: location ? {
        latitude: location.latitude || location.lat,
        longitude: location.longitude || location.lng
      } : undefined,
      availableTimeSlots: availableTimeSlots.map(daySlot => ({
        day: daySlot.day,
        slots: daySlot.slots.map(slot => ({
          time: slot.time,
          maxReservations: parseInt(slot.maxReservations),
          currentReservations: slot.currentReservations || 0
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
      { new: true, runValidators: true }
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
      .populate('userId', 'name') 
      .populate('restaurantId', 'name'); 

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

export default app;

