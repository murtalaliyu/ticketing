import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';  // adding ConnectOptions
import jwt from 'jsonwebtoken';
require('dotenv').config();

jest.setTimeout(60000); // added this to avoid premature timeout on long-running tests

// we have to tell TS that there is a global getCookie property below
declare global {
  var getCookie: (id?: string) => string[];
}

jest.mock('../nats-wrapper.ts'); // mock nats-wrapper

// start mongoose before all tests are run
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asfdsaf';  // set JWT_KEY env variable

  //mongo = new MongoMemoryServer(); this has been deprecated
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions); // had to add "as ConnectOptions"
});

// reset mongoose db before each test is run
beforeEach(async () => {
  jest.clearAllMocks(); // to avoid data pollution

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// stop mongo server & disconnect mongoose after tests are complete
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// globally (only accessible to tests) accessible helper function to send over cookie to authenticated requests
global.getCookie = (id?: string) => {
  // build a JWT payload { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);  // create the JWT

  const session = { jwt: token }; // build session object { JWT: MY_JWT }

  const sessionJSON = JSON.stringify(session);  // turn that session into JSON

  const base64 = Buffer.from(sessionJSON).toString('base64'); // take JSON and encode it as base64

  return [`express:sess=${base64}`];  // return a string that's the cookie with the encoded data
};
