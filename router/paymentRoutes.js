// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

const FONDY_API_URL = 'https://api.fondy.eu/api/checkout/url/';

const generateSignature = (data, secretKey) => {
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  const str = secretKey + '|' + Object.values(sortedData).join('|');
  return crypto.createHash('sha1').update(str).digest('hex');
};

router.post('/create-payment', async (req, res) => {
  const { amount, currency, order_id, order_desc } = req.body;
  const data = {
    amount: amount * 100, 
    currency,
    order_id,
    order_desc,
    response_url: 'http://localhost:3000/success',
    server_callback_url: 'http://localhost:5000/api/payment/callback',
    merchant_id: process.env.FONDY_MERCHANT_ID,
  };

  data.signature = generateSignature(data, process.env.FONDY_SECRET_KEY);

  try {
    const response = await axios.post(FONDY_API_URL, { request: data });
    res.json({ url: response.data.response.checkout_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/callback', (req, res) => {
  const data = req.body;
  const signature = generateSignature(data, process.env.FONDY_SECRET_KEY);

  if (signature === data.signature) {
  }

  res.sendStatus(200);
});

module.exports = router;
