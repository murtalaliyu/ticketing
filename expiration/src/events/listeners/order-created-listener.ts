import { Listener, OrderCreatedEvent, Subjects } from '@bluepink-tickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Get delay value
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job:', delay);

    // Create a new job and queue it up
    await expirationQueue.add(
      { orderId: data.id },
      { delay }
    );

    // Ack the message
    msg.ack();
  }
}
