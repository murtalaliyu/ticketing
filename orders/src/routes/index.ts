import express, { Request, Response } from 'express';
import { requireAuth } from '@bluepink-tickets/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  // get all orders for this user with related tickets
  const orders = await Order.find({ userId: req.currentUser!.id }).populate('ticket');
  
  res.send(orders);
});

export { router as indexOrderRouter };
