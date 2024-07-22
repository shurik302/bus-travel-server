// server/scripts/loadCities.js
const mongoose = require('mongoose');
const City = require('../models/City');
const fs = require('fs');
const path = require('path');

mongoose.connect(' mongodb+srv://root:root@cluster0.scwaivx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const citiesPath = path.join(__dirname, '../data/cities.json'); // Оновлено шлях
const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

const loadCities = async () => {
  try {
    await City.deleteMany({});
    await City.insertMany(citiesData);
    console.log('Cities data has been loaded successfully.');
  } catch (error) {
    console.error('Error loading cities data:', error);
  } finally {
    mongoose.connection.close();
  }
};

loadCities();
