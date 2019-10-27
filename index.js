const http = require('http');
const backend = require('./backend');
const proxy = require('./proxy');
const test = require('./test');

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 10, // artificially low, to demonstrate
  maxFreeSockets: 5
});

// connection goes:
// user -> (port 48383) proxy -> (port 48384) backend

const proxyPort = 48383;
const backendPort = 48384;

backend.listen(backendPort);

proxy.configure({ backendPort, agent });
proxy.listen(proxyPort, async () => {
  console.log('Getting ready to send test requests...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  test();
});

setInterval(() => {
  const sockets = Object.values(agent.sockets)[0] || [];
  const free = Object.values(agent.freeSockets)[0] || [];

  console.log(`Sockets used: ${sockets.length},\t free: ${free.length}`);
}, 1000);
