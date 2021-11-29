import { Stan, Message } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(data: T['data'], msg: Message): void;

  private client: Stan;

  protected ackWait = 5 * 1000;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable() // will send to a new subscriber all previously received events
      .setManualAckMode(true) // we have to manually acknowledge every event we receive, otherwise NATS server will keep resending it
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName); // tells NATS server to store events with a flag of acknowledged/not-acknowledged, resends only the NOTs, so we don't re-process events (setDeliverAllAvailable must also be set for this to work)
  }

  listen() {
    // create subscription. NOTE: setDeliverAllAvailable, setDurableName, and queue-group are very tightly coupled
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,  // tells NATS server to send events to only one instance of multiple subscribers of the same channel
      this.subscriptionOptions()
    );

    // listen for events
    subscription.on('message', (msg: Message) => {
      console.log(
        `Message received: #${msg.getSequence()} / ${this.subject} / ${this.queueGroupName}`
      );

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf-8'));
  }
}
