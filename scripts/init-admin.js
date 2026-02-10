const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MOGODB_CONNECTION || 'mongodb+srv://tonystark1592025_db_user:RKv5rr2Xf2t2qgvX@pumpgravity.4f1acnv.mongodb.net/?appName=pumpgravity';

// User schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'editor'
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', UserSchema);

async function initAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create default admin user
    const admin = new User({
      username: 'admin',
      password: 'admin123', // Default password - should be changed
      role: 'admin'
    });
    
    await admin.save();
    console.log('Default admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initAdmin();