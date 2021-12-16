import { Listener, OrderCreatedEvent, Subjects } from "@bluepink-tickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

 async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
     // Create and save an Order
     const order = Order.build({
      id: data.id,
      version: data.version, 
      userId: data.userId, 
      price: data.ticket.price, 
      status: data.status
     });
     await order.save();

     // ack the message
     msg.ack();
 }
}
