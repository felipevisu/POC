# miniFetch

In this POC I'm creating my own fetch. The fetch consists of a socket that will open a connection with the host, keeps it opened while waiting for the answer, and close after finished succesfully.

I had to set a `User-Agent: mini-fetch` otherwise my requests would be blocked by the host.

I'm using the node.js tls library to do this socket https://nodejs.org/api/tls.html#tlsconnectport-host-options-callback

**Nest steps**

- Handler errors
- Parse the JSON response
