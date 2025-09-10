const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer
const User = require('../models/User');
const userService = require('../services/user');
const reportService = require('../services/form');
const { protect } = require('../middleware/auth');

const router = express.Router();

// --- MULTER CONFIGURATION for Photo Uploads ---
// This logic is now included directly in this file.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specifies the folder to save uploaded files
  },
  filename: (req, file, cb) => {
    // Creates a unique filename to prevent files with the same name from being overwritten
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


// --- AUTHENTICATION ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter both username and password' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Logged in successfully', token, role: user.role });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// --- USER MANAGEMENT ROUTES (Admin Only) ---
router.get('/users', protect('admin'), async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.post('/users', protect('admin'), async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});


// --- REPORT ROUTES ---
router.post('/reports/submit', protect(), upload.single('photo'), async (req, res) => {
  try {
    const reportData = { ...req.body, photoFile: req.file }; // Pass the whole file object
    const newReport = await reportService.submitReport(req.user, reportData);
    res.status(201).json({ message: 'Report submitted successfully', report: newReport });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.get('/reports', protect(), async (req, res) => {
  try {
    const reports = await reportService.getReportsForUser(req.user);
    res.json(reports);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.get('/reports/daily', protect('admin'), async (req, res) => {
  try {
    const dailyReports = await reportService.getDailyReports();
    res.json(dailyReports);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

module.exports = router;

