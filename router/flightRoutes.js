const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const moment = require('moment');

router.post('/create', async (req, res) => {
  try {
    const {
      fromEN,
      fromUA,
      fromLocationEN,
      fromLocationUA,
      toEN,
      toUA,
      toLocationEN,
      toLocationUA,
      typeEN,
      typeUA,
      passengers,
      priceEN,
      priceUA,
      date_departure,
      departure,
      duration,
      date_arrival,
      arrival,
      baggage
    } = req.body;

    const flight = new Flight({
      fromEN,
      fromUA,
      fromLocationEN,
      fromLocationUA,
      toEN,
      toUA,
      toLocationEN,
      toLocationUA,
      typeEN,
      typeUA,
      passengers,
      priceEN,
      priceUA,
      date_departure: new Date(date_departure),
      departure,
      duration,
      date_arrival: new Date(date_arrival),
      arrival,
      baggage
    });

    await flight.save();
    res.status(201).send(flight);
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

router.get('/', async (req, res) => {
  try {
    // Отримуємо поточну дату
    const currentDate = moment().startOf('day');

    // Знаходимо всі квитки з датою вильоту пізніше поточної дати
    const flights = await Flight.find({
      date_departure: { $gte: currentDate.toDate() }
    });

    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
