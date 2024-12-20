import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
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
    'exp://192.168.0.104:8081', 
    'http://192.168.0.104:8081', 
    'http://192.168.0.104:8081'
  ],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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

// Signout route
app.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send({ message: 'Error signing out' });
    res.clearCookie('connect.sid');
    res.status(200).send({ message: 'Logged out' });
  });
});

// Profile section server logic
app.get('/api/admin/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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

// Multer setup for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to upload image to Firebase
const uploadImageToFirebase = async (file) => {
  try {
    const fileName = `restaurants/${Date.now()}_${file.originalname}`;
    const fileRef = ref(storage, fileName);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(fileRef, file.buffer, {
      contentType: file.mimetype,
    });

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Firebase:", error);
    throw new Error("Failed to upload image");
  }
};

// Endpoint to add restaurant
restaurantRouter.post('/', upload.array('images'), async (req, res) => {
  try {
    // Debugging: Check if files are being received
    console.log('Received files:', req.files);

    // Ensure req.files is iterable
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const {
      name,
      address,
      phone,
      cuisine,
      description,
      pricePerReservation,
      dressCode,
      amenities,
      location,
      availableTimeSlots, // This could be a string or an object
      menu,
    } = req.body;

    // Upload images to Firebase
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        return await uploadImageToFirebase(file);
      })
    );

    // Parse menu items
    let menuWithImageUrls;
    try {
      // Check if menu is a string and parse it
      if (typeof menu === 'string') {
        menuWithImageUrls = JSON.parse(menu).map((item) => {
          if (item.image) {
            return { ...item, image: item.image }; // Assuming image is already a URL
          }
          return item;
        });
      } else if (Array.isArray(menu)) {
        // If menu is already an array, use it directly
        menuWithImageUrls = menu.map((item) => {
          if (item.image) {
            return { ...item, image: item.image }; // Assuming image is already a URL
          }
          return item;
        });
      } else {
        throw new Error('Invalid menu format');
      }
    } catch (error) {
      console.error('Error parsing menu:', error);
      return res.status(400).json({ message: 'Invalid menu format' });
    }

    // Parse and validate availableTimeSlots
    let parsedAvailableTimeSlots;
    try {
      // Check if availableTimeSlots is a string and parse it
      if (typeof availableTimeSlots === 'string') {
        parsedAvailableTimeSlots = JSON.parse(availableTimeSlots);
      } else if (Array.isArray(availableTimeSlots)) {
        // If availableTimeSlots is already an array, use it directly
        parsedAvailableTimeSlots = availableTimeSlots;
      } else {
        throw new Error('Invalid availableTimeSlots format');
      }

      // Trim and validate the day field
      parsedAvailableTimeSlots.forEach((slot) => {
        if (slot.day) {
          slot.day = slot.day.trim(); // Trim any leading or trailing spaces
        }

        // Validate against the enum
        const allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        if (!allowedDays.includes(slot.day)) {
          throw new Error(`Invalid day: ${slot.day}`);
        }
      });
    } catch (error) {
      console.error('Error parsing availableTimeSlots:', error);
      return res.status(400).json({ message: 'Invalid availableTimeSlots format' });
    }

    // Create restaurant document
    const restaurant = new Restaurant({
      name,
      address,
      phone,
      cuisine,
      description,
      images: imageUrls,
      menu: menuWithImageUrls,
      pricePerReservation: parseFloat(pricePerReservation),
      dressCode,
      amenities: JSON.parse(amenities),
      location: JSON.parse(location),
      availableTimeSlots: parsedAvailableTimeSlots, // Use the validated and trimmed array
    });

    await restaurant.save();

    res.status(201).json({ message: 'Restaurant added successfully', restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Get restaurants
restaurantRouter.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants', error: error.message });
  }
});

// Get a restaurant by ID
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
restaurantRouter.put('/:id', upload.array('images'), async (req, res) => {
  try {
    const { id } = req.params;

    // Upload new images to Firebase
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        return await uploadImageToFirebase(file);
      })
    );

    // Parse menu items
    const menuWithImageUrls = JSON.parse(req.body.menu).map((item) => {
      if (item.image) {
        return { ...item, image: item.image }; // Assuming image is already a URL
      }
      return item;
    });

    // Update restaurant document
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        ...req.body,
        images: imageUrls,
        menu: menuWithImageUrls,
      },
      { new: true }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Delete a restaurant by ID
restaurantRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
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

// Get reservations
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