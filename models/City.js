// server/models/City.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CitySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  value: { type: String, required: true },
  ukrainian: { type: String, required: true },
  lng: { type: Number, required: true },
  lat: { type: Number, required: true }
});

module.exports = mongoose.model('City', CitySchema);
