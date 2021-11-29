import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear(); // to reduce console noise

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  // graceful shutdown listener
  stan.on('close', () => {
    console.log('NATS connection closed!');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

// graceful shutdown handler
stan.on('SIGINT', () => stan.close());  // interrupt signal (not functional on Windows)
stan.on('SIGTERM', () => stan.close()); // terminate signal (not functional on Windows)
