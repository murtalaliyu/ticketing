import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@bluepink-tickets/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', 
  requireAuth,
  [
    body('token')
      .not()
      .isEmpty()
      .withMessage('Token is required'),
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('Order ID is required')
  ],
  validateRequest,
async (req: Request, res: Response) => {
  // pull out data from incoming request body
  const { token, orderId } = req.body;

  // find the Order
  const order = await Order.findById(orderId);

  // make sure this Order actually exists
  if (!order) {
    throw new NotFoundError();
  }

  // make sure this Order belongs to the correct user
  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  // make sure this order is not yet cancelled
  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError('Cannot pay for a cancelled order');
  }

  // create a charge
  const charge = await stripe.charges.create({
    currency: 'usd',
    amount: order.price * 100,
    source: token
  });

  // save payment to Payment object
  const payment = Payment.build({
    orderId,
    stripeId: charge.id
  });
  await payment.save();

  // publish payment:created event
  new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId,
    stripeId: payment.stripeId
  });

  // send the response
  res.status(201).send({ id: payment.id });
});

export { router as createChargeRouter };
