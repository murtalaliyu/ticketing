import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, requireAuth, validateRequest } from '@bluepink-tickets/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';

const router = express.Router();

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
    const { ticketId } = req.body;

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


    // Build the order and save it to the database

    // Publish an event saying that an order was created

    res.send({});
});

export { router as newOrderRouter };
