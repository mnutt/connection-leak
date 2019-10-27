const HttpPromise = require('./http-promise');
const { pipeline } = require('stream');
const http = require('http');

let agent, backendPort;

module.exports = http.createServer(async (req, res) => {
  const client = new HttpPromise({
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
    const backendResponse = await client.fetch();

    res.writeHead(backendResponse.statusCode, backendResponse.headers);

    pipeline(backendResponse, res, err => {
      if (err) {
        console.log('Pipeline Error', err);
      }
    });
  } catch (e) {
    console.log('Handler Error', e);
    res.writeHead(500, {});
    res.end(e.toString());
  }
});

module.exports.configure = (opts) => {
  agent = opts.agent;
  backendPort = opts.backendPort;
};
