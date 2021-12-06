import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@bluepink-tickets/common";
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a Ticket
  const ticket = Ticket.build({
    title: 'this is a valid title',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  });
  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'fake date',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // Get ack function
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // Refetch ticket because exisiting ticket has out-of-date data
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
