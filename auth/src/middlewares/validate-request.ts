import { Request, Response, NextFunction } from 'express';  // these are types. We import these to be able to provide type annotations for typescript to understand some information about the middleware we are building
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

// validates all POST/PUT request parameters
export const validateRequest = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
};
