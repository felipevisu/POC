import TagInput from "./TagInput";

const App = () => {
  const handleTagsChange = (tags) => {
    console.log("Current tags:", tags);
  };

  return (
    <div style={{ padding: "2em", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Tag Input Example</h2>
      <p>Type a value and press Enter to add it. Click the X to remove tags.</p>
      <TagInput placeholder="Add tags..." onTagsChange={handleTagsChange} />
    </div>
  );
};

export default App;
