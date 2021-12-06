import express, { Request, Response } from 'express';
import { NotFoundError, validateRequest, NotAuthorizedError, requireAuth } from '@bluepink-tickets/common';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/tickets/:id', 
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    // make sure ticket exists
    if (!ticket) {
      throw new NotFoundError();
    }

    // make sure updater is same as creator
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // update the ticket
    ticket.set({
      title: req.body.title,
      price: req.body.price
    });
    await ticket.save();

    // emit ticket:updated event
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });

    res.send(ticket); // return the updated ticket
});

export { router as updateTicketRouter };
