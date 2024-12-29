import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import bodyParser from 'body-parser';
import User from './models/admin.js';
import Restaurant from './models/restaurant.js';
import Reservation from './models/reservation.js';

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
     
    'http://192.168.18.15:3000',
    'https://reservationadminrn-pdla.onrender.com',
    'https://reservationadminrn-1.onrender.com',
    'https://reservationadminrn-2.onrender.com'
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

// Endpoint to add restaurant
restaurantRouter.post('/', async (req, res) => {
  try {
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
      availableTimeSlots,
      menu,
      photos,
    } = req.body;

    // Validate required fields
    if (!name || !address || !phone || !cuisine || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create restaurant document directly from JSON data
    const restaurant = new Restaurant({
      name,
      address,
      phone,
      cuisine,
      description,
      pricePerReservation: parseFloat(pricePerReservation),
      dressCode,
      amenities: Array.isArray(amenities) ? amenities : [],
      location,
      availableTimeSlots: Array.isArray(availableTimeSlots) ? availableTimeSlots : [],
      photos: Array.isArray(photos) ? photos : [],
      menu: Array.isArray(menu) ? menu : []
    });

    // Log the data being saved
    console.log('Saving restaurant:', JSON.stringify(restaurant.toObject(), null, 2));

    await restaurant.save();

    res.status(201).json({ 
      message: 'Restaurant added successfully', 
      restaurant: restaurant.toObject() 
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ 
      message: 'Error creating restaurant', 
      error: error.message 
    });
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

// Get single restaurant
restaurantRouter.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// PUT endpoint for updating restaurant
restaurantRouter.put('/:id', async (req, res) => {
  try {
    console.log('Restaurant update requested for ID:', req.params.id);
    console.log('Received payload:', JSON.stringify(req.body, null, 2));

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      console.log('Restaurant not found:', req.params.id);
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update restaurant fields
    Object.keys(req.body).forEach((key) => {
      restaurant[key] = req.body[key];
    });

    await restaurant.save();
    console.log('Restaurant updated successfully:', restaurant._id);

    res.json({ message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    console.error('Error in PUT /restaurants/:id:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// DELETE endpoint for restaurant
restaurantRouter.delete('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Delete restaurant document
    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /restaurants/:id:', error);
    res.status(500).json({ error: error.message });
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

// Get reservations with search functionality
app.get('/reservations', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { customerName: { $regex: search, $options: 'i' } },
          { emailAddress: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const reservations = await Reservation.find(query)
      .populate('userId', 'firstName lastName')
      .populate('restaurantId', 'name');

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Confirm a reservation
app.put('/reservations/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Confirming reservation with ID: ${id}`);

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { paymentStatus: 'confirmed' },
      { new: true } // Return the updated document
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    console.log('Reservation confirmed:', reservation); // Log the updated reservation
    res.status(200).json({ message: 'Reservation confirmed successfully', reservation });
  } catch (error) {
    console.error('Error confirming reservation:', error);
    res.status(500).json({ message: 'Failed to confirm reservation', error: error.message });
  }
});

// Cancel a reservation
app.put('/reservations/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Cancelling reservation with ID: ${id}`);

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { paymentStatus: 'cancelled' },
      { new: true } 
    );

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    console.log('Reservation cancelled:', reservation); // Log the updated reservation
    res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: 'Failed to cancel reservation', error: error.message });
  }
});

// Mount the router
app.use('/api/restaurants', restaurantRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;