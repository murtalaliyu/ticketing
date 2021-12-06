import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
  // Create a Ticket with ticket model
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  // Create a user cookie
  const userCookie = global.getCookie();

  // Make a request to create an Order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the Order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  // Expect to make sure that the Order is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  // Create a Ticket with ticket model
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  // Create a user cookie
  const userCookie = global.getCookie();

  // Make a request to create an Order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to cancel the Order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
