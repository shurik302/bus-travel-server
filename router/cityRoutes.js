const express = require('express');
const jwt = require('jsonwebtoken');
const City = require('../models/City');
const UserModel = require('../models/user-model'); // Ensure this is the correct path to your User model
const router = express.Router();
require('dotenv').config();

// Middleware для перевірки токена
const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('Decoded token:', decoded); // Додано логування декодованого токену
    req.user = await UserModel.findById(decoded.id);
    if (!req.user) {
      console.log('User not found');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/cities', verifyToken, async (req, res) => {
  try {
    console.log('Fetching cities...');
    const cities = await City.find();
    res.status(200).json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
