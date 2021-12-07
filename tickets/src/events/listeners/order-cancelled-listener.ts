import { Listener, OrderCancelledEvent, Subjects } from "@bluepink-tickets/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find the Ticket that the Order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no Ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the Ticket as *not* reserved by *removing* its orderId value
    ticket.set({ orderId: undefined });   // we are making use of undefined here because optional values don't work very well with typescript

    // Save the Ticket
    await ticket.save();

    //emit a ticket:updated event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    // Ack the message
    msg.ack();
  }
}
