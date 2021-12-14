import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@bluepink-tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
      token: 'asdf',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  // create and save an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(), 
    version: 0, 
    userId: new mongoose.Types.ObjectId().toHexString(), 
    price: 10, 
    status: OrderStatus.Created
  });
  await order.save();

  // make a request to pay for this order as an unauthorized user
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie())
    .send({
      token: 'asdf',
      orderId: order.id
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  // create a user ID
  const userId = new mongoose.Types.ObjectId().toHexString();

  // create and save an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(), 
    version: 0, 
    userId, 
    price: 10, 
    status: OrderStatus.Cancelled
  });
  await order.save();

  // make a request to purchase this order
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'asdf',
      orderId: order.id
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  // create a user ID
  const userId = new mongoose.Types.ObjectId().toHexString();

  // generate a random price
  const price = Math.floor(Math.random() * 100000);

  // create and save an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(), 
    version: 0, 
    userId, 
    price,
    status: OrderStatus.Created
  });
  await order.save();

  // request a new charge
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.getCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);
  
  const stripeCharges = await stripe.charges.list({
    limit: 50
  });

  const stripeCharge = stripeCharges.data.find(charge => {
    return charge.amount === price * 100
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge?.currency).toEqual('usd');

  // make sure payment was saved to Payment object
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });

  expect(payment).not.toBeNull();
});
