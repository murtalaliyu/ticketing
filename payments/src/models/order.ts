import { OrderStatus } from '@bluepink-tickets/common';
import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties that are required to create/build a new Order
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties that an Order Document has.
// We do not have to include an id property here because mongoose will take of it for us
export interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties that an Order Model has/contains
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// Define Order schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
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
orderSchema.set('versionKey', 'version');  // rename __v to version in the DB. This MUST come before orderSchema.plugin(...) command
orderSchema.plugin(updateIfCurrentPlugin); // Wire updateIfCurrentPlugin to schema

// Build Order. Have to manually replace existing _id with id in Order service
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status
  });
};

// Create Order model
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
