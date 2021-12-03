import { Publisher, Subjects, OrderCreatedEvent } from "@bluepink-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
