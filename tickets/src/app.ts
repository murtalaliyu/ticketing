import express from "express";
import 'express-async-errors';
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from "@bluepink-tickets/common";

// import routes
import { createTicketRouter } from "./routes/new";

const app = express();
app.set('trust proxy', true);   // trust requests because traffic is currently being proxied to our app through ingress-nginx
app.use(json());
// cookies will not be encrypted because the contained JWT is already so.
// require that cookies only be sent back if users visit our app over an HTTPS connection.
// we will use an env variable to make secure false when sending requests in a test env, otherwise true
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUser); // make sure this comes after the cookieSession middleware so that the cookieSession middleware can take a look at the cookie and set the req.session property

// handle routes
app.use(createTicketRouter);

// handle invalid routes
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
