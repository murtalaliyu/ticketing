import express, { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/order';
import { NotFoundError, requireAuth, validateRequest, NotAuthorizedError } from '@bluepink-tickets/common';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))  // We should delete this line if we're not sure of the structure of the DB this event is coming from
      .withMessage('Order ID must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;   // Get orderId from request object

    // Find the order
    const order = await Order.findById(orderId).populate('ticket');

    // Make sure this Order actually exists
    if (!order) {
      throw new NotFoundError();
    }

    // Make sure this Order belongs to this user
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Update the Order and save back to DB
    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an order:cancelled event
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id
      }
    });

    res.status(204).send(order);   // Send response
});

export { router as deleteOrderRouter };
