import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@bluepink-tickets/common';
import { Order } from '../models/order';
import { param } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
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
    // Get particular order for this user with related tickets\
    const order = await Order.findById(req.params.orderId).populate('ticket');
    
    // Make sure this Order actually exists
    if (!order) {
      throw new NotFoundError();
    }

    // Make sure this Order belongs to this user
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);  // Send response
});

export { router as showOrderRouter };
