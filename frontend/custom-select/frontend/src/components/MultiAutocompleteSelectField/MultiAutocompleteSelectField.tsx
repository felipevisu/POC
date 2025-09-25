import {
  Box,
  Checkbox,
  MenuItem,
  Popper,
  TextField,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";

interface MultiAutocompleteSelectFieldProps {
  fetchChoices: (value: string) => void;
  choices: { label: string; value: number | string }[];
  loadMore?: () => void;
  loading?: boolean;
}

function MultiAutocompleteSelectField({
  fetchChoices,
  choices,
  loadMore,
  loading = false,
}: MultiAutocompleteSelectFieldProps) {
  const anchor = useRef<HTMLInputElement | null>(null);
  const [selectedItems, setSelectedItems] = useState<
    { label: string; value: number | string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleItemSelect = (item: {
    label: string;
    value: number | string;
  }) => {
    setSelectedItems((prevItems) => {
      const isAlreadySelected = prevItems.some(
        (selected) => selected.value === item.value
      );

      if (isAlreadySelected) {
        return prevItems.filter((selected) => selected.value !== item.value);
      } else {
        return [...prevItems, item];
      }
    });
  };

  const handleRemoveItem = (itemToRemove: {
    label: string;
    value: number | string;
  }) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.value !== itemToRemove.value)
    );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    fetchChoices(value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    fetchChoices(inputValue || "");
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchChoices(inputValue || "");
    }
  };

  const handleClickAway = (event: MouseEvent) => {
    if (anchor.current && !anchor.current.contains(event.target as Node)) {
      const popper = document.querySelector("[data-popper-placement]");
      if (popper && !popper.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickAway);
      return () => {
        document.removeEventListener("mousedown", handleClickAway);
      };
    }
  }, [isOpen]);

  return (
    <div>
      <TextField
        ref={anchor}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={
          selectedItems.length === 0
            ? "Search and select items..."
            : `${selectedItems.length} item(s) selected`
        }
        InputProps={{
          endAdornment: (
            <Box
              onClick={handleToggle}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ArrowDropDown />
            </Box>
          ),
        }}
        fullWidth
      />

      {selectedItems.length > 0 && (
        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedItems.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              onDelete={() => handleRemoveItem(item)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}

      <Popper
        anchorEl={anchor.current}
        open={isOpen}
        placement="bottom-start"
        style={{
          width: anchor.current?.clientWidth,
          zIndex: 1301,
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            maxHeight: "360px",
            overflow: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {choices.length === 0 ? (
            <MenuItem disabled>No options found</MenuItem>
          ) : (
            choices.map((choice) => {
              const isSelected = selectedItems.some(
                (item) => item.value === choice.value
              );

              return (
                <MenuItem
                  key={choice.value}
                  onClick={() => handleItemSelect(choice)}
                  selected={isSelected}
                >
                  <Checkbox checked={isSelected} onChange={() => {}} />
                  <span style={{ marginLeft: 8 }}>{choice.label}</span>
                </MenuItem>
              );
            })
          )}

          {loadMore && (
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                borderTop: "1px solid #e0e0e0",
                p: 1,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  loadMore();
                }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{
                  textTransform: "none",
                  color: loading ? "text.secondary" : "primary.main",
                }}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </Box>
          )}
        </Box>
      </Popper>
    </div>
  );
}

export default MultiAutocompleteSelectField;
