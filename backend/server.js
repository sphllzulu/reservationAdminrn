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



/// new firebase
const uploadToFirebase = async (file) => {
  try {
    const fileName = `${restaurants}/${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    const fileBuffer = file.buffer;

    const fileRef = bucket.file(fileName);
    await fileRef.save(fileBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    throw error;
  }
};

// Helper function to delete file from Firebase Storage
const deleteFromFirebase = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    const fileName = fileUrl.split('/').pop();
    const file = bucket.file(fileName);
    
    const exists = await file.exists();
    if (exists[0]) {
      await file.delete();
    }
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    throw error;
  }
};

// Endpoint to add restaurant
restaurantRouter.post('/',  async (req, res) => {
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

 

    /////new
     // Upload restaurant images to Firebase
     const imageUrls = [];
     if (req.files['images']) {
       for (const file of req.files['images']) {
         const imageUrl = await uploadToFirebase(file, 'restaurant-images');
         imageUrls.push(imageUrl);
       }
     }

     ////new menu
      // Process menu items
    const menuData = [];
    const menuItems = JSON.parse(req.body.menu || '[]');
    
    for (let i = 0; i < menuItems.length; i++) {
      const menuImage = req.files[`menu[${i}][image]`]?.[0];
      const menuImageUrl = menuImage 
        ? await uploadToFirebase(menuImage, 'menu-images')
        : null;
      
      menuData.push({
        name: menuItems[i].name,
        image: menuImageUrl
      });
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
      menu: menuData,
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

// // Get a restaurant by ID
// restaurantRouter.get('/:id', async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.params.id);
//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }
//     res.json(restaurant);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching restaurant', error: error.message });
//   }
// });

// // Update a restaurant by ID
// restaurantRouter.put('/:id', upload.array('images'), async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Upload new images to Firebase
//     const imageUrls = await Promise.all(
//       req.files.map(async (file) => {
//         return await uploadImageToFirebase(file);
//       })
//     );

//     // Parse menu items
//     const menuWithImageUrls = JSON.parse(req.body.menu).map((item) => {
//       if (item.image) {
//         return { ...item, image: item.image }; // Assuming image is already a URL
//       }
//       return item;
//     });

//     // Update restaurant document
//     const updatedRestaurant = await Restaurant.findByIdAndUpdate(
//       id,
//       {
//         ...req.body,
//         images: imageUrls,
//         menu: menuWithImageUrls,
//       },
//       { new: true }
//     );

//     if (!updatedRestaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     res.json({ message: 'Restaurant updated successfully', restaurant: updatedRestaurant });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });

// // Delete a restaurant by ID
// restaurantRouter.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
//     if (!deletedRestaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }
//     res.json({ message: 'Restaurant deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting restaurant', error: error.message });
//   }
// });
// NEEEEEEEWWWWWWW


// const deleteImageFromFirebase = async (imageUrl) => {
//   try {
//     // Create a reference to the file to delete
//     const fileRef = ref(storage, imageUrl);
    
//     // Delete the file
//     await deleteObject(fileRef);
    
//     return true;
//   } catch (error) {
//     console.error('Error deleting from Firebase:', error);
//     throw error;
//   }
// };



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

////// update
// PUT endpoint for updating restaurant
restaurantRouter.put('/:id', async (req, res) => {
  try {
    const restaurantData = { ...req.body };
    const oldRestaurant = await Restaurant.findById(req.params.id);
    
    if (!oldRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Handle new restaurant images
    if (req.files['images']) {
      // Delete old images from Firebase
      for (const imageUrl of oldRestaurant.images) {
        await deleteFromFirebase(imageUrl);
      }

      // Upload new images
      const imageUrls = [];
      for (const file of req.files['images']) {
        const imageUrl = await uploadToFirebase(file, 'restaurant-images');
        imageUrls.push(imageUrl);
      }
      restaurantData.images = imageUrls;
    }

    // Handle menu updates
    if (req.body.menu) {
      const menuItems = JSON.parse(req.body.menu);
      const menuData = [];
      
      for (let i = 0; i < menuItems.length; i++) {
        const menuImage = req.files[`menu[${i}][image]`]?.[0];
        let menuImageUrl = menuItems[i].image;

        if (menuImage) {
          // Delete old menu image if it exists
          if (menuImageUrl) {
            await deleteFromFirebase(menuImageUrl);
          }
          menuImageUrl = await uploadToFirebase(menuImage, 'menu-images');
        }

        menuData.push({
          name: menuItems[i].name,
          image: menuImageUrl
        });
      }
      restaurantData.menu = menuData;
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
      availableTimeSlots,
      menuImage,
    } = req.body;

    // Parse all fields that should be objects/arrays
    let parsedData = {
      name,
      address,
      phone,
      cuisine,
      description,
      dressCode,
    };

    // // Parse menu items
    // try {
    //   if (menu) {
    //     parsedData.menu = typeof menu === 'string' ? JSON.parse(menu) : menu;
    //     parsedData.menu = parsedData.menu.map((item) => {
    //       if (item.image) {
    //         return { ...item, image: item.image }; // Keep existing image URL
    //       }
    //       return item;
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error parsing menu:', error);
    //   return res.status(400).json({ message: 'Invalid menu format' });
    // }

    // Parse and validate availableTimeSlots
    try {
      if (availableTimeSlots) {
        let parsedTimeSlots = typeof availableTimeSlots === 'string' 
          ? JSON.parse(availableTimeSlots) 
          : availableTimeSlots;

        // Validate time slots
        parsedTimeSlots.forEach((slot) => {
          if (slot.day) {
            slot.day = slot.day.trim();
          }

          const allowedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          if (!allowedDays.includes(slot.day)) {
            throw new Error(`Invalid day: ${slot.day}`);
          }
        });

        parsedData.availableTimeSlots = parsedTimeSlots;
      }
    } catch (error) {
      console.error('Error parsing availableTimeSlots:', error);
      return res.status(400).json({ message: 'Invalid availableTimeSlots format' });
    }

    // Parse other JSON fields
    try {
      if (amenities) {
        parsedData.amenities = typeof amenities === 'string' 
          ? JSON.parse(amenities) 
          : amenities;
      }

      if (location) {
        parsedData.location = typeof location === 'string' 
          ? JSON.parse(location) 
          : location;
      }
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return res.status(400).json({ message: 'Invalid JSON format in fields' });
    }

    // Handle price
    if (pricePerReservation) {
      parsedData.pricePerReservation = parseFloat(pricePerReservation);
    }

    // Combine existing and new images
    parsedData.images = [...restaurant.images, ...newImageUrls];

    // Update restaurant with all fields
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      parsedData,
      { new: true }
    );

    res.json({
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant
    });

  } catch (error) {
    console.error('Error in PUT /restaurants/:id:', error);
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

    // // Delete images from Firebase Storage
    // await Promise.all(
    //   restaurant.images.map(imageUrl => deleteImageFromFirebase(imageUrl))
    // );

    // Delete all associated images from Firebase
    for (const imageUrl of restaurant.images) {
      await deleteFromFirebase(imageUrl);
    }

    // Delete menu images
    for (const menuItem of restaurant.menu) {
      if (menuItem.image) {
        await deleteFromFirebase(menuItem.image);
      }
    }
    // Delete restaurant document
    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /restaurants/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update restaurant
// restaurantRouter.put('/:id', upload.array('images'), async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.params.id);
//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     // Handle new image uploads if any
//     let newImageUrls = [];
//     if (req.files && req.files.length > 0) {
//       newImageUrls = await Promise.all(
//         req.files.map(async (file) => {
//           return await uploadImageToFirebase(file);
//         })
//       );
//     }

//     // Combine existing images with new ones
//     const updatedImages = [...restaurant.images, ...newImageUrls];

//     // Parse JSON strings from form data
//     const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : restaurant.amenities;
//     const location = req.body.location ? JSON.parse(req.body.location) : restaurant.location;
//     const menu = req.body.menu ? JSON.parse(req.body.menu) : restaurant.menu;
//     const availableTimeSlots = req.body.availableTimeSlots 
//       ? JSON.parse(req.body.availableTimeSlots) 
//       : restaurant.availableTimeSlots;

//     // Update restaurant document
//     const updatedRestaurant = await Restaurant.findByIdAndUpdate(
//       req.params.id,
//       {
//         name: req.body.name || restaurant.name,
//         address: req.body.address || restaurant.address,
//         phone: req.body.phone || restaurant.phone,
//         cuisine: req.body.cuisine || restaurant.cuisine,
//         description: req.body.description || restaurant.description,
//         images: updatedImages,
//         menu,
//         pricePerReservation: req.body.pricePerReservation 
//           ? parseFloat(req.body.pricePerReservation) 
//           : restaurant.pricePerReservation,
//         dressCode: req.body.dressCode || restaurant.dressCode,
//         amenities,
//         location,
//         availableTimeSlots,
//       },
//       { new: true }
//     );

//     res.json(updatedRestaurant);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });

// // Delete restaurant
// restaurantRouter.delete('/:id', async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.params.id);
//     if (!restaurant) {
//       return res.status(404).json({ message: 'Restaurant not found' });
//     }

//     // Delete images from Firebase Storage
//     await Promise.all(
//       restaurant.images.map(async (imageUrl) => {
//         // Extract file name from URL
//         const fileName = imageUrl.split('/').pop().split('?')[0];
//         await deleteImageFromFirebase(fileName);
//       })
//     );

//     // Delete restaurant document
//     await Restaurant.findByIdAndDelete(req.params.id);

//     res.json({ message: 'Restaurant deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });



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