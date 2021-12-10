import { Publisher, Subjects, ExpirationCompleteEvent } from "@bluepink-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
