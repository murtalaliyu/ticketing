import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { ConnectOptions } from 'mongoose';  // adding ConnectOptions from
import { app } from '../app';

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
