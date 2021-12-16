import { Listener, OrderCancelledEvent, Subjects, OrderStatus } from "@bluepink-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find the appropriate order and set its status to *cancelled* (this can extracted out into a function in the Order model)
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    });

    // make sure Order actually exists
    if (!order) {
      throw new Error('Order not found');
    }

    // update the status of this order
    order.set({ status: OrderStatus.Cancelled })

    // save the order
    await order.save();

    // ack the message
    msg.ack();
  }
}
