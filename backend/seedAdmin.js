require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/User-Management/User');

function resolveMongoUri() {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  try {
    const appJsPath = path.join(__dirname, 'app.js');
    const appJs = fs.readFileSync(appJsPath, 'utf8');
    const match = appJs.match(/process\.env\.MONGO_URI\s*\|\|\s*"([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (_) {
    // Ignore fallback parsing errors and handle below.
  }

  return null;
}

async function seedAdmin() {
  try {
    const mongoUri = resolveMongoUri();

    if (!mongoUri) {
      throw new Error('MONGO_URI is not set in environment variables and no fallback was found in app.js');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' }).lean();

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    const now = new Date();

    // Insert directly to preserve requested seed values (year: 0, semester: 0).
    await User.collection.insertOne({
      slIIId: 'ADMIN001',
      fullName: 'System Admin',
      email: 'admin@brainlink.com',
      specialization: 'System',
      year: 0,
      semester: 0,
      password: hashedPassword,
      role: 'admin',
      profilePicture: '',
      isVerified: true,
      isActive: true,
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: null,
      refreshTokens: [],
      uploadedResources: [],
      joinedGroups: [],
      savedResources: [],
      createdAt: now,
      updatedAt: now
    });

    console.log('Admin created successfully');
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    } catch (_) {
      // Ignore disconnect errors during shutdown.
    }

    process.exit(process.exitCode || 0);
  }
}

seedAdmin();
