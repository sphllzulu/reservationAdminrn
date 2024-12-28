import mongoose from "mongoose";
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN", "MANAGER"],
    default: "USER",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password hashing middleware
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);

    // Hash the password along with our new salt
    const hashedPassword = await bcrypt.hash(this.password, salt);

    // Override the cleartext password with the hashed one
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// Method to check password validity
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to create admin if not exists
UserSchema.statics.createAdminIfNotExists = async function () {
  try {
    // Check if admin already exists
    const existingAdmin = await this.findOne({ role: "ADMIN" });

    if (!existingAdmin) {
      // Create admin user
      const adminUser = new this({
        email: "admin@example.com",
        password: "AdminPassword123!",
        firstName: "Open",
        lastName: "Admin",
        role: "ADMIN",
      });

      await adminUser.save();
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

export default mongoose.model("User", UserSchema);
