# http connection leak issue

This repo demonstrates an issue with leaking connection pool connections when proxying to a backend server. The setup here is:

test -> (port 48383) proxy -> (port 48384) backend

**EDIT: this issue appears to be fixed by https://github.com/mnutt/connection-leak/commit/4f0884ec8b970ffe98d16fd2c3aaaf641b3bf04b**

## Usage

`node index.js`

This waits 3 seconds, and then begins sending requests and then aborting them a couple hundred ms later rather than letting them finish. You should see the number of sockets used growing until it hits 10 sockets, the maxSockets configured in the http agent. At this point, all of the agent's sockets are in use and new requests made to the proxy will fail with a timeout error.

What this looks like inside, from what I can surmise:

1. test.js makes request to proxy
2. Proxy allocates connection from agent pool and connects to backend
3. Backend waits a bit, sends back response headers
4. Proxy receives response headers and gets ready to send data to test.js
5. Oops, test.js terminated the connection
6. Proxy is still trying to pipe backend readable stream to browser writable stream, but test.js has gone away
7. Due to keepalive, connection hangs out forever, but is still in agent's list of open connections.

Normally, a backend server would terminate any keep-alive connection that hadn't passed any data in some amount of time, but lots of applications don't do this. (and node didn't, before node 8) Having the backend set a keepAliveTimeout fixes the issue, but there are lots of backends out there for which this isn't an option. I'm hoping to find a solution where node notices that a connection should be discarded and discards it.
