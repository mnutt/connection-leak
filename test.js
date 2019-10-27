const http = require('http');

module.exports = async () => {
  for (let i = 0; i < 20; i++) {
    const req = http.request({
      method: 'GET',
      agent: false,
      headers: {
        Connection: 'close'
      },
      host: '127.0.0.1',
      port: 48383
    });

    setTimeout(() => {
      req.abort();
    }, 50 + Math.random() * 300);

    req.on('response', (response) => {
      response.pipe(process.stdout);
    });

    req.on('error', (e) => console.log(e));

    req.end();

    await new Promise(resolve => setTimeout(resolve, 500));
  }
};
