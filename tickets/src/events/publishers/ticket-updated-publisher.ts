import { Publisher, Subjects, TicketUpdatedEvent } from "@bluepink-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
