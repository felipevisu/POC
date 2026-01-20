import net from "net";

function miniFetch(host, path = "/") {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(80, host);
    let response = "";
    socket.on("connect", () => {
      socket.write(
        `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n`,
      );
    });

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
