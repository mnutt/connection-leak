const http = require('http');

const backend = http.createServer(async (req, res) => {
  // simulate server doing some work
  await new Promise(resolve => setTimeout(resolve, 200));

  res.writeHead(200, {});
  res.write('hello');
  res.end(' world');
});

// while a well-behaved backend would terminate keep-alive connections if they
// are not sending data, not all do and so ours does not
backend.keepAliveTimeout = 0;

module.exports = backend;
