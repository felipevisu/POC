const syncDemo = (x) => console.log("Log ", x);

const asyncDemo = async (x) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Log", x);
      resolve();
    }, 3000);
  });
};

// Example 2
// Log 1, 2, 3
syncDemo(1);
await asyncDemo(2);
syncDemo(3);
