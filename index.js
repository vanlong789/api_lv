import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDatabase from './config/MongoDb.js';
import { errorHandler, notFound } from './Middleware/Errors.js';
import orderRouter from './Routes/orderRoutes.js';
dotenv.config();
connectDatabase();
const app = express();
app.use(express.static('public'));
app.use(express.json());

// API

// cấu hình định danh file ejs bên express
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
// app.use('/public', express.static('public'));
app.use(cors());
app.use('/api/orders', orderRouter);
// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

// const PORT = process.env.PORT || 1000;

app.listen(1000, () => {
    console.log(`server run in port ${1000}`);
});
