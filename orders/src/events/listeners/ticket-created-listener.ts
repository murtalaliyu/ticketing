import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketCreatedEvent } from '@bluepink-tickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    // save the incoming Ticket data to the ticket collection in the Orders DB
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id, title, price
    });
    await ticket.save();

    msg.ack(); // ack the message
  }
}
