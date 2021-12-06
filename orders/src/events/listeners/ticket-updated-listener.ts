import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@bluepink-tickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);  // get existing ticket

    // Make sure Ticket actually exists
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Update ticket
    const { title, price } = data;
    ticket.set({ title, price });

    await ticket.save();  // save updated ticket to DB

    msg.ack();   // ack the message
  }
}
