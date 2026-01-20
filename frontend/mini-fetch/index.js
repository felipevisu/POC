import tls from "tls";

function miniFetch(host, path = "/") {
  return new Promise((resolve, reject) => {
    const url = new URL(host);
    const socket = tls.connect(443, url.hostname);
    let response = "";
    socket.write(
      `GET ${url.pathname} HTTP/1.1\r\n` +
        `Host: ${url.hostname}\r\n` +
        `Connection: close\r\n` +
        `User-Agent: mini-fetch\r\n` +
        `\r\n`,
    );

    socket.on("data", (chunk) => {
      response += chunk.toString();
    });

    socket.on("end", () => {
      resolve(response);
    });

    socket.on("error", reject);
  });
}

const res = await miniFetch("https://api.github.com/users/felipevisu/repos");
console.log(res);
