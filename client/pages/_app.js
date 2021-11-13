// Adding bootstrap css
import 'bootstrap/dist/css/bootstrap.css';

// Whenever we try to navigate to some distinct page with NextJS, Next will import our component from one of the files under the pages folder,
// Next does not just show the component on the screen, rather it wraps it in its own custom default component, which it calls the app.
// So here we're defining our own custom app component. So whenever we try to visit one of the pages, Next will import that component here and pass it into this 
// app component here as this Component prop below (so Component will be equal to the current page we're trying to visit)
// pageProps is then the component we're trying to pass to the page we are visiting

// We are doing all this in order to pass global components (such as bootstrap) to the page we are trying to visit.
// So basically, all global components have to be imported here in order to be reflected in the rest of the pages.
// See https://github.com/vercel/next.js/blob/master/errors/css-global.md
export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />
};
