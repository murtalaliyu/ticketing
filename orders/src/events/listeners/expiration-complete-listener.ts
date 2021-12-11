import { ExpirationCompleteEvent, Listener, Subjects, OrderStatus } from "@bluepink-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // find the Order with the associated ticket
    const order = await Order.findById(data.orderId).populate('ticket');

    // make sure Order exists
    if (!order) {
      throw new Error('Order not found');
    }

    // update the Order's status and save the update
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    // publish an order:cancelled event
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    // ack the message
    msg.ack();
  }
}
