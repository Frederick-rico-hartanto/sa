// Use dotenv to manage environment variables
require('dotenv').config();

// Import necessary packages
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database'); // Import the central Sequelize instance
const apiRoutes = require('./routes/routes'); // Import the single main router file
const userService = require('./services/user'); // Import the user service for initial admin

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;


// Enable CORS with credentials
app.use(
  cors({
    // Be specific about which frontend URLs are allowed to make requests
    origin: [
      'http://localhost:3000',      // For your local Next.js development server
    ],
    // 'credentials' can often be removed for JWT, but can be kept for other reasons.
    // It's safe to keep it for now.
    credentials: true, 
  })
);
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---

// Mount the single main router for all API endpoints under '/api'
app.use('/api', apiRoutes);


// --- Database and Server Initialization ---

// Start the server after syncing the database
const startServer = async () => {
  try {
    await sequelize.sync(); // Sync models with the database
    console.log('Database synced successfully.');

    // Call the service to handle the initial admin creation
    await userService.createInitialAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error)
  {
    console.error('Unable to connect to the database or start the server:', error);
  }
};

startServer();

