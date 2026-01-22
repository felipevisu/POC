const displayMessage = (message) => console.log(message);

const asyncDemo = async () => {
  const reposResponse = await fetch(
    "https://api.github.com/users/felipevisu/repos",
  );
  const reposData = await reposResponse.json();
  console.log(reposData);
};

displayMessage("It will fetch the repos");
await asyncDemo(2);
displayMessage("It fetched the repos");

/**
 * Results:
 * 1 - It will fetch the repos
 * 2 - reposData
 * 3 - It fetched the repos
 */
