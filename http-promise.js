const http = require('http');

// A promisified http client
//
// Instantiate it with an options object using http.request() options, along
// with `timeout` and `body`: `timeout` limits the request time, while `body`
// is used in conjunction with `method: 'POST'`.

// Calling `fetch()`, it returns a promise for an http IncomingMessage response.

module.exports = class HttpPromise {
  constructor(options) {
    this.options = options;
    this.timeout = this.options.timeout || 5000;
    this.client = http.request(options);
  }

  abort() {
    this.client && this.client.abort();
  }

  fetch() {
    return new Promise((resolve, reject) => {
      let _timeout; // reference to setTimeout timer

      const errorFn = (err) => {
        clearTimeout(_timeout);

        this.abort();
        reject(err || new Error('timeout'));
      };

      this.client.once('error', errorFn);
      this.client.once('timeout', errorFn);
      _timeout = setTimeout(errorFn, this.timeout);

      this.client.once('response', response => {
        clearTimeout(_timeout);

        resolve(response);
      });

      // POST requests
      if (this.options.body) {
        this.client.write(this.options.body);
      }

      // Prevent zombie connections
      this.client.setTimeout(this.timeout);

      this.client.end();
    });
  }
};
