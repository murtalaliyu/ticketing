import express, { Request, Response } from 'express';
import { NotFoundError, validateRequest, NotAuthorizedError, requireAuth } from '@bluepink-tickets/common';
import { Ticket } from '../models/ticket';
import { body } from 'express-validator';

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

    // return the updated ticket
    res.send(ticket);
});

export { router as updateTicketRouter };
