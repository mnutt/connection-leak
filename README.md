# http connection leak issue

This repo demonstrates an issue with leaking connection pool connections when proxying to a backend server. The setup here is:

user -> (port 48383) proxy -> (port 48384) backend

## Usage

`node index.js`

Open http://localhost:48383 in your browser and just hold down the reload button. Firefox works best and can send dozens of requests per second; Chrome and safari work but request much slower so it takes a lot longer. Returning to the console, you should see the number of sockets used growing until it hits 10 sockets, the maxSockets configured in the http agent. At this point, all of the agent's sockets are in use and new requests you make to the proxy will fail with a timeout error.

This issue happens due the fact that holding 'reload' in the browser will not wait for the page to load before aborting and issuing another request, so there are lots of http requests to the proxy that get aborted. What this looks like inside, from what I can surmise:

1. Browser makes request to proxy
2. Proxy allocates connection from agent pool and connects to backend
3. Backend waits a bit, sends back response headers
4. Proxy receives response headers and gets ready to send data to browser
5. Oops, browser terminated the connection
6. Proxy is still trying to pipe backend readable stream to browser writable stream, but browser has gone away
7. Due to keepalive, connection hangs out forever, but is still in agent's list of open connections.

Normally, a backend server would terminate any keep-alive connection that hadn't passed any data in some amount of time, but lots of applications don't do this. (and node didn't, before node 8) Having the backend set a keepAliveTimeout fixes the issue, but there are lots of backends out there for which this isn't an option.
