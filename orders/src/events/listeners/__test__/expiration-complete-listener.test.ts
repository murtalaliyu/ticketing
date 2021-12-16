import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from '../../../models/order';
import { Ticket } from "../../../models/ticket";
import mongoose from 'mongoose';
import { OrderStatus, ExpirationCompleteEvent } from '@bluepink-tickets/common';
import { Message } from 'node-nats-streaming';

// build a setup function
const setup = async () => {
  // create listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // build a Ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'this is a valid title',
    price: 10
  });
  await ticket.save();

  // build an Order and associate it with the above Ticket
  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  // create expiration:complete event data
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // create ack message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, order, data, msg };
};

/*
  1. Make sure we can call onMessage
  2. Make sure we update the Order's status
  3. Make sure we can save the updated Order
  4. Make sure we can emit an event of order:cancelled
  5. Make sure we call the ack function
*/

it('updates the Order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order:cancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
