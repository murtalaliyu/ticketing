import express from "express";
import 'express-async-errors';
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from "@bluepink-tickets/common";

// import routes
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

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

// handle routes
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
