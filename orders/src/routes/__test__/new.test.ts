import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app)
    .post('/api/orders')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/orders')
    .send({})
    .expect(401);
});

it('returns a status other than 401 if the user is authenticated', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid userId/status/expiresAt/ticket is provided', async () => {
  // create ticket
  const ticket = Ticket.build({
    title: 'this is a valid title',
    price: 10
  });
  
  // no userId
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket
    })
    .expect(400);

  // invalid userId
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      userId: '',
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket
    })
    .expect(400);

  // no status
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      userId: 'validuserid',
      expiresAt: new Date(),
      ticket
    })
    .expect(400);

  // invalid status
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      userId: 'validuserid',
      status: '',
      expiresAt: new Date(),
      ticket
    })
    .expect(400);

  // no expiresAt
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      userId: 'validuserid',
      status: OrderStatus.Created,
      ticket
    })
    .expect(400);

  // invalid expiresAt
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      userId: 'validuserid',
      status: OrderStatus.Created,
      expiresAt: '',
      ticket
    })
    .expect(400);

  // no ticket
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({
      userId: 'validuserid',
      status: OrderStatus.Created,
      expiresAt: new Date()
    })
    .expect(400);
});

it('returns a 404 error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId })
    .expect(404);
});

it('returns a 400 error if the ticket is already reserved', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  // create an order
  const order = Order.build({
    userId: 'thisisavaliduserid',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('successfully reserves a ticket', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.getCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it.todo('emits an order created event');
