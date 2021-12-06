import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from "@bluepink-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the Ticket that the Order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no Ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the Ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    // Save the Ticket
    await ticket.save();

    // ack the message
    msg.ack();
  }
}
