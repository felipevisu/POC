import React, { useState } from "react";
import { Label, Input, Icon, Button } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

const TagInput = ({
  placeholder = "Type and press Enter...",
  onTagsChange,
}) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const addTags = () => {
    const input = inputValue.trim();

    if (input) {
      const newTags = input
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .filter((tag) => !tags.includes(tag));

      if (newTags.length > 0) {
        const updatedTags = [...tags, ...newTags];
        setTags(updatedTags);

        if (onTagsChange) {
          onTagsChange(updatedTags);
        }
      }

      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTags();
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);

    if (onTagsChange) {
      onTagsChange(updatedTags);
    }
  };

  return (
    <div>
      <div className="ui action input fluid" style={{ marginBottom: "8px" }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button color="blue" icon onClick={addTags}>
          <Icon name="plus" />
        </Button>
      </div>

      {tags.length > 0 && (
        <Label.Group className="tag-group">
          {tags.map((tag, index) => (
            <Label key={index} color="blue">
              {tag}
              <Icon name="delete" onClick={() => removeTag(tag)} />
            </Label>
          ))}
        </Label.Group>
      )}
    </div>
  );
};

export default TagInput;
