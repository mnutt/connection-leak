const HttpPromise = require('./http-promise');
const { pipeline } = require('stream');
const http = require('http');

let agent, backendPort;

module.exports = http.createServer(async (req, res) => {
  const backendRequest = new HttpPromise({
    agent,
    method: 'GET',
    timeout: 5000,
    path: '/',
    port: backendPort,
    headers: {
      Connection: 'keep-alive'
    },
    host: '127.0.0.1'
  });

  try {
    const backendResponse = await backendRequest.fetch();

    backendResponse.headers.Connection = 'close';

    res.writeHead(backendResponse.statusCode, backendResponse.headers);

    pipeline(backendResponse, res, err => {
      if (err) {
        console.log('Pipeline Error', err);
        backendResponse.destroy();
      }
    });
  } catch (e) {
    console.log('Handler Error', e);
    res.writeHead(500, { Connection: 'close' });
    res.end(e.toString());
  }
});

module.exports.configure = (opts) => {
  agent = opts.agent;
  backendPort = opts.backendPort;
};
