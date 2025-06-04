const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      department: 'Administration',
      position: 'System Administrator',
      joiningDate: new Date(),
      leaveBalance: {
        annual: 30,
        sick: 15,
        casual: 15
      }
    };

    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', {
        id: existingAdmin._id,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      
      // Update the admin user to ensure correct role and data
      existingAdmin.role = 'admin';
      existingAdmin.department = 'Administration';
      existingAdmin.position = 'System Administrator';
      await existingAdmin.save();
      console.log('Admin user updated successfully');
      
      process.exit(0);
    }
    
    console.log('Creating new admin user...');
    const admin = await User.create(adminData);
    console.log('Admin user created successfully:', {
      id: admin._id,
      email: admin.email,
      role: admin.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 