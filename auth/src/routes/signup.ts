import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@bluepink-tickets/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup', 
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid!'),
    body('password')
      .trim()
      .isLength({min: 4, max: 20})
      .withMessage('Password must be between 4 and 20 characters!')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    // check if email already exists
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // create User and save to db
    const user = User.build({ email, password });
    await user.save();

    // generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email
      }, 
      process.env.JWT_KEY!
    );
    
    // store JWT on the session object
    req.session = {
      jwt: userJwt
    };

    // respond
    res.status(201).send(user);
});

export { router as signupRouter };
