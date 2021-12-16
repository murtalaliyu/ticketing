import request from 'supertest';
import { app } from '../../app';

// we need to signup, take the provided cookie and include it with all follow-up requests that require authentication
it('responds with details about the current user', async () => {
  const cookie = await global.getCookie();  // this is coming from setup file

  const response = await request(app)
  .get('/api/users/currentuser')
  .set('Cookie', cookie)
  .send()
  .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
  .get('/api/users/currentuser')
  .send()
  .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
