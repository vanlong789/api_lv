import express from 'express';
import asyncHandler from 'express-async-handler';
import Order from './../Models/OrderModel.js';
import xlsx from 'xlsx';
import createRequestBody from '../utils/payMomo.js';
import axios from 'axios';

const orderRouter = express.Router();

orderRouter.get(
    '/list',
    asyncHandler(async (req, res) => {
        res.status(200);
        res.send('Logic của bạn đúng');
    }),
);

orderRouter.post(
    '/:id/payMomo',
    asyncHandler(async (req, res) => {
        const id = req.params.id;
        const { money } = req.body;
        const order = await Order.findById(id);
        const { requestBody, signature } = createRequestBody(
            `${id}`,
            'Thanh toán điện tự với Balostore',
            `${money}`,
            `https://lvtn-balo-store.vercel.app/order/${id}`,
            `https://api-lvtn-git-main-vanlong789.vercel.app/api/orders/${id}/notificationPay`,
        );
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody),
            },
        };
        const { data } = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, config);
        if (data) {
            order.payment.payUrl = data.payUrl;
            order.payment.signature = signature;
            order.payment.moneyPay = money;

            await order.save();
        }
        res.status(200).json(data);
    }),
);

orderRouter.post(
    '/:id/notificationPay',
    asyncHandler(async (req, res) => {
        const { message } = req.body;
        const order = await Order.findById(req.params.id);

        if (message == 'Successful.' || message == 'Thành công.') {
            order.payment.timePay = new Date().getTime();
            order.payment.partner = 'MOMO';
            order.payment.message = 'Thành Công';
            order.isPaid = true;
            order.paidAt = new Date().getTime();

            await order.save();
            res.status(201).json(order);
        } else {
            order.cancel = 1;
            order.payment.message = 'error';

            await order.save();
            res.status(201).json(order);
        }
    }),
);

export default orderRouter;
