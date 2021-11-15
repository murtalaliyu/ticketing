import buildClient from "../api/build-client";  // useRequest can only by called/used inside of a react component. That is why we have to use buildClient which uses axios for requests in getInitialProps

const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>You are NOT signed in</h1>;
};

/*
 getInitialProps is specific to NextJS.
 If we decide to implement this, NextJS will call this function while attempting to render our app on the server.
 So this gives us the opportunity to fetch some data that this component needs during the server-side rendering process.
 We are then provided the data to this component as a prop

  getInitialProps will be executed on the server under the following scenarios:
  1. Hard refresh of the page
  2. Navigating to our page from an external domain (e.g. from reddit.com)
  3. Typing our page url into the browser

  getInitialProps will be executed on the client under the following scenarios:
  1. Navigating to our page from another page within our app

  here, we are getting the current user's cookie if they are signed in in order to make authenticated requests
*/
LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
