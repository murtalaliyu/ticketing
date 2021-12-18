// This function helps us make requests inside a getInitialProps function

import axios from "axios";

export default ({ req }) => {
  // figure out whether we are in a browser or server environment
  if (typeof window === 'undefined') {
    // we are on the server. requests should be made to 'http://ingress-nginx-controller.ingress-nginx...'
    return axios.create({
      //baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      baseURL: 'http://www.tix-prod.xyz',
      headers: req.headers
    });

  } else {
    // we are on the browser. requests should be made with a base url of ''
    return axios.create({
      baseUrl: '/'
    });
  }
};
