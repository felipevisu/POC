import axios from "axios";

const repositoriesFetch = await fetch(
  "https://api.github.com/users/felipevisu/repos",
);
const dataFetch = await repositoriesFetch.json();

console.log(dataFetch);

const repositoriesAxios = await axios.get(
  "https://api.github.com/users/felipevisu/repos",
);
// First difference, axios converts to json automatically
console.log(repositoriesAxios);
