import mongoose from 'mongoose';

// An interface that describes the properties that are required to create/build a new Payment
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// An interface that describes the properties that a Payment Document has.
// We do not have to include an id property here because mongoose will take of it for us
export interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

// An interface that describes the properties that a Payment Model has/contains
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

// Define Payment schema
const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  stripeId: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

// Build Payment
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

// Create Payment model
const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
