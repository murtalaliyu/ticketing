import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';  // adding ConnectOptions
import request from 'supertest';
import { app } from '../app';

jest.setTimeout(60000); // added this to avoid premature timeout on long-running tests

// we have to tell TS that there is a global getCookie property below
declare global {
  var getCookie: () => Promise<string[]>
}

// start mongoose before all tests are run
let mongo: any;
beforeAll(async () => {
  // set JWT_KEY env variable
  process.env.JWT_KEY = 'asfdsaf';

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
global.getCookie = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
  .post('/api/users/signup')
  .send({
    email, password
  })
  .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie;
};
