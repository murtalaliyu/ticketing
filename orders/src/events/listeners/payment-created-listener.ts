import { Subjects, Listener, PaymentCreatedEvent, OrderStatus, NotFoundError } from "@bluepink-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    // make sure order exists
    if (!order) {
      throw new Error('Order not found');
    }

    // update the order 
    order.set({ status: OrderStatus.Complete });
    await order.save();

    // ack the message
    msg.ack();
  }
}
