import { useEffect, useState } from "react";

function App() {
  const [list, setList] = useState();

  useEffect(() => {
    fetch("https://randomuser.me/api?results=5")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setList(data.results);
      });
  }, []);

  return (
    <>
      <h1>Users list</h1>
      <ul>
        {list?.map((item) => (
          <li key={item.email}>{item.email}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
