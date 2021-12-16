// Adding bootstrap css
import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';  // useRequest can only be called/used inside of a react component. That is why we have to use buildClient which uses axios for requests in getInitialProps
import Header from '../components/header';

/*
 Whenever we try to navigate to some distinct page with NextJS, Next will import our component from one of the files under the pages folder,
 Next does not just show the component on the screen, rather it wraps it in its own custom default component, which it calls the app.
 So here we're defining our own custom app component. So whenever we try to visit one of the pages, Next will import that component here and pass it into this 
 app component here as this Component prop below (so Component will be equal to the current page we're trying to visit)
 pageProps is then the component we're trying to pass to the page we are visiting

 We are doing all this in order to pass global components (such as bootstrap) to the page we are trying to visit.
 So basically, all global components have to be imported here in order to be reflected in the rest of the pages.

 See https://github.com/vercel/next.js/blob/master/errors/css-global.md
 */
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div> 
  );
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
  Note: This is information fetching for the ENTIRE app
*/
AppComponent.getInitialProps = async (appContext) => {  
  // get data that is common for every page
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  // fetch child page component's GIP only if it is defined on the page
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
