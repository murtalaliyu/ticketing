import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";
import mongoose from 'mongoose';
import { OrderStatus, OrderCancelledEvent } from '@bluepink-tickets/common';

const setup = async () => {
  // create listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create an Order and save to DB
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0, 
    userId: new mongoose.Types.ObjectId().toHexString(), 
    price: 10, 
    status: OrderStatus.Created
  });
  await order.save();

  // create event data object
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
        id: new mongoose.Types.ObjectId().toHexString()
    }
  };

  // create ack message
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // make sure order was updated to *cancelled*
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {

  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
