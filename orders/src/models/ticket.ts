import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

/* 
  This code will look very similar to the Ticket model in the Ticket service,
    so can we extract both and move one to the common library?
  The answer is: Definitely NOT!
  Why? Because this Ticket model serves to allow just the Order service to do what it needs to do.
  There could be a lot more fields present in the Ticket service model that the Order service simply does not care about.
  Additionally, as far as the Order service is concerned, a ticket could take many forms, such as a concert ticket or a parking pass,
    while in the Ticket service, a Ticket is a very specific entity.
*/

// An interface that describes the properties that are required to create a new Ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties that a Ticket Document has
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;  // we had to manually configure this below
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

// Define Ticket schema
const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

// Configure Optimistic Concurrency Control (OCC) based on document version
ticketSchema.set('versionKey', 'version');  // rename __v to version in the DB. This MUST come before ticketSchema.plugin(...) command
ticketSchema.plugin(updateIfCurrentPlugin); // Wire updateIfCurrentPlugin to schema

// Build Ticket. Have to manually replace existing _id with id in Ticket service
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
};

// Get existing Ticket by following the principles of Optimistic Concurrency Control
ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

/* 
  Allow us to determine if this ticket is reserved (we are using a keyword function instead of an arrow function because of mongoose)
  Run query to look at all orders. Find an order where the ticket is the ticket we just found *and* the order's status is *not* cancelled.
  If we find an order from this, that means the ticket *is* reserved. 
*/
ticketSchema.methods.isReserved = async function() {
  // this === the Ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  });

  return !!existingOrder;
}

// Create Ticket model
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
