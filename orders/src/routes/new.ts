import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@bluepink-tickets/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// Set expiration window in seconds. 
// TODO: EXTRACT THIS TO DB FOR CONFIGURABILITY
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

// NOTE: We should not make assumptions about the structure of the ID parameter during request validation.
// We will do it here but this is something important to keep in mind.
router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))  // We should delete this line if we're not sure of the structure of the DB this event is coming from (see note on assumption above)
      .withMessage('Ticket ID must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;  // deconstruct ticketId from the request body

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved (a reserved ticket has already been associated with an order, and the order status is not cancelled).
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });
    await order.save();

    // Publish an order:created event
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: (order.expiresAt).toISOString(),   // to get a standardized UTC timezone
      ticket: {
        id: ticket.id,
        price: ticket.price
      }
    });

    res.status(201).send(order);    // Send response
});

export { router as newOrderRouter };
