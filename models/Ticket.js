const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  from: String,
  fromLocation: String,
  to: String,
  toLocation: String,
  typeEN: String,
  typeUA: String,
  passengers: String,
  priceEN: String,
  priceUA: String,
  date_departure: Date,
  departure: String,
  duration: String,
  date_arrival: Date,
  arrival: String,
  baggage: {
    smallBaggage: Number,
    largeBaggage: Number
  },
  phone: String,
  email: String,
  firstName: String,
  lastName: String,
  isActive: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Ticket', ticketSchema);
