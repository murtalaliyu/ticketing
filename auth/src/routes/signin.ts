import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@bluepink-tickets/common';

import { Password } from '../services/password';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email')
    .isEmail()
    .withMessage('Email must be valid!'),
    body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    
    // check if email is correct
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      // when handling authentication requests, we want to share as little as possible so we throw a generic BadRequestError
      throw new BadRequestError('Invalid credentials');
    }

    // compare stored password with supplied password
    const passwordsMatch = await Password.compare(existingUser.password, password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    // generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      }, 
      process.env.JWT_KEY!
    );
    
    // store JWT on the session object
    req.session = {
      jwt: userJwt
    };

    // respond
    res.status(200).send(existingUser);
});

export { router as signinRouter };
