import buildClient from "../api/build-client";  // useRequest can only be called/used inside of a react component. That is why we have to use buildClient which uses axios for requests in getInitialProps

const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>You are signed in</h1> : <h1>You are NOT signed in</h1>;
};

// Note: This is information fetching for the just the index page
LandingPage.getInitialProps = async (context) => {
  console.log('LANDING PAGE!');
  const client = buildClient(context);
  const { data } = await client.get('/api/users/currentuser');
  return data;
};

export default LandingPage;
