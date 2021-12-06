import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  const userCookie = global.getCookie();
  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userCookie)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another user\'s order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  const userCookie = global.getCookie();
  // Make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // Make a request to fetch the order
  const anotherUserCookie = global.getCookie();
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', anotherUserCookie)
    .send()
    .expect(401);
});
