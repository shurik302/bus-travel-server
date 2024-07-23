const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const ticketsRouter = require('./router/ticketRoutes');
const paymentRouter = require('./router/paymentRoutes');
const errorMiddleware = require('./middlewares/error-middleware');
const flightRoutes = require('./router/flightRoutes');
const cityRoutes = require('./router/cityRoutes');

const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: 'https://bus-travel-transfer.netlify.app', // Разрешаем только запросы с твоего фронтенда
  credentials: true,
  optionsSuccessStatus: 200 // Для поддержки старых браузеров
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use("/api", router);
app.use('/api', ticketsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/flights', flightRoutes);
app.use('/api', cityRoutes);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (e) {
    console.error('Failed to connect to MongoDB', e);
  }
};

start();
