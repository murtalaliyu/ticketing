import { Publisher, PaymentCreatedEvent, Subjects } from "@bluepink-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
