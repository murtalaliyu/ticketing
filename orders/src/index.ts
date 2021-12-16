import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';  

/* ---------------------------------------------------------------------------------------------------------- */

const start = async () => {
  console.log('Starting...');

  // make sure env variables are defined
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  /* ---------------------------------------------------------------------------------------------------------- */

  try {
    // connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    );

    // graceful shutdown listener
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    // graceful shutdown handler
    process.on('SIGINT', () => natsWrapper.client.close());  // interrupt signal (not functional on Windows)
    process.on('SIGTERM', () => natsWrapper.client.close()); // terminate signal (not functional on Windows)

    // Create instances of event listeners
    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    
  } catch (err) {
    console.error(err);
  }

  /* ---------------------------------------------------------------------------------------------------------- */

  // connect to mongo data store
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  /* ---------------------------------------------------------------------------------------------------------- */

  // listen for traffic
  app.listen(10002, () => {
    console.log('Listening on port 10002');
  });
};

start();
