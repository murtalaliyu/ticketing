import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

// we will assume that we will never use this middleware without previously
// running the currentUser middleware. So by the time we get here, we should've
// already checked if there is a JWT present, decoded, and set on req.currentUser
export const requireAuth = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};
