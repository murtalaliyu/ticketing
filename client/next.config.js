// To fix NextJS auto-reload issue when app is inside a docker container.
// This file is loaded up automatically by NextJS whenever the app starts up
// We are telling webpack that rather than trying to watch for file changes, instead pull all the different files in the project dir automatically once every 300ms
// Note: this helps but still not 100% fullproof 
// (after each config change, list out current kube pods and manually delete affected ones. kube will automatically spin up a new one. see logs for more info)
module.exports = {
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300;
    return config;
  }
};
