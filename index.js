require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index'); // Маршруты аутентификации и другие маршруты
const ticketsRouter = require('./router/ticketRoutes');
const paymentRouter = require('./router/paymentRoutes');
const errorMiddleware = require('./middlewares/error-middleware');
const flightRoutes = require('./router/flightRoutes');
const cityRoutes = require('./router/cityRoutes');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Разрешение запросов из нескольких источников
}));

app.use("/api", router);
app.use('/api', ticketsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/flights', flightRoutes);
app.use('/api', cityRoutes);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
