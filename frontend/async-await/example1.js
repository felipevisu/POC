const syncDemo = (x) => console.log("Log ", x);

const asyncDemo = async (x) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Log", x);
      resolve();
    }, 3000);
  });
};

// Example 1
// Log 1, 3, 2
syncDemo(1);
asyncDemo(2);
syncDemo(3);
