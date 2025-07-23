import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend_old_unused/models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ems-formonex');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@formonex.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Admin details:', {
        id: existingAdmin._id,
        email: existingAdmin.email,
        fullName: existingAdmin.fullName,
        role: existingAdmin.role,
        department: existingAdmin.department,
        position: existingAdmin.position
      });
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@formonex.com',
      password: 'Formo#Admin123',
      fullName: 'Formonex Admin',
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator',
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@formonex.com');
    console.log('Password: Formo#Admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
createAdminUser();
