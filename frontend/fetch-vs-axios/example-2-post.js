import axios from "axios";

const data = {
  title: "foo",
  body: "bar",
  userId: 1,
};

const postFetch = await fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
const postFetchReponse = await postFetch.json();

console.log(postFetchReponse);

const postAxios = await axios.post(
  "https://jsonplaceholder.typicode.com/posts",
  data,
);
console.log(postAxios.data);
