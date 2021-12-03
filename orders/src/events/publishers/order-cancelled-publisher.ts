import { Publisher, Subjects, OrderCancelledEvent } from "@bluepink-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
