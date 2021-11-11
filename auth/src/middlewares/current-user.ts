import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

// add a currentUser property to the Request type definition
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

// we want to figure out whether or not the user is logged in, and if they are we want to extract information out of that payload
// and set it on req.currentUser. If the user is not logged in we are not going to throw an error. that is the job of the not-authorized-error middleware
export const currentUser = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // check if user is logged in
  if (!req.session?.jwt) {
    return next();
  }

  // if they have a JWT, extract payload and set it on currentUser so it can be used by other middlewares or the actual request handler
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) {}

  next();
};
