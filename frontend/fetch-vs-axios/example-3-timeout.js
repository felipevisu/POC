import axios from "axios";

const data = {
  title: "foo",
  body: "bar",
  userId: 1,
};

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 2000);

try {
  const postFetch = await fetch("https://httpbin.org/delay/5", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    signal: controller.signal,
  });
  const postFetchReponse = await postFetch.json();
  console.log(postFetchReponse);
} catch (e) {
  console.log("Fetch timout", e);
} finally {
  clearTimeout(timeout);
}

// AXIOS

// Another key difference is that axios supports timeout while fetch needs a separate controller for this

try {
  const postAxios = await axios.post("https://httpbin.org/delay/5", data, {
    timeout: 2000,
  });
  console.log(postAxios.data);
} catch (err) {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNABORTED") {
      console.log("Axios timeout");
    }
  }
}
