import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderStatus } from "@bluepink-tickets/common";
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create the data Order event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'date string',
    ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10
    }
  };

  // create msg object that will have the mocked ack function
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, msg };
};

it('', async () => {
  
});
