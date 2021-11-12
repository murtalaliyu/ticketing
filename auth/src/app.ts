import express from "express";
import 'express-async-errors';
import { json } from "body-parser";
import cookieSession from 'cookie-session';

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();
app.set('trust proxy', true);   // trust requests because traffic is currently being proxied to our app through ingress-nginx
app.use(json());
// cookies will not be encrypted because the contained JWT is already so.
// require that cookies only be used if users visit our app over an HTTPS connection.
app.use(
  cookieSession({
    signed: false,
    secure: true
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// handle invalid routes
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
