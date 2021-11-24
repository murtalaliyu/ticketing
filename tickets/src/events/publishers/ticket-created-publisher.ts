import { Publisher, Subjects, TicketCreatedEvent } from "@bluepink-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
