import { natsWrapper } from './nats-wrapper';

const start = async () => {
  // make sure env variables are defined
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
}

start();
