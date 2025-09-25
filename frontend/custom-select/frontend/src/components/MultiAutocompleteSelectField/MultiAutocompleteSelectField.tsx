import {
  Box,
  Checkbox,
  MenuItem,
  Popper,
  TextField,
  Chip,
  Button,
  CircularProgress,
  Typography,
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
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const popperRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedItems, setSelectedItems] = useState<
    { label: string; value: number | string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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
      }

      return [...prevItems, item];
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    fetchChoices(value);
  };

  const openDropdown = () => {
    if (isOpen) {
      return;
    }

    setIsOpen(true);
    setSearchValue("");
    fetchChoices("");
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleArrowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) {
        return;
      }

      if (popperRef.current?.contains(target)) {
        return;
      }

      closeDropdown();
    };

    document.addEventListener("mousedown", handleMouseDown);

    if (searchInputRef.current) {
      searchInputRef.current.focus({ preventScroll: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  return (
    <Box>
      <TextField
        ref={anchorRef}
        value=""
        onClick={openDropdown}
        onFocus={openDropdown}
        placeholder=""
        fullWidth
        InputProps={{
          readOnly: true,
          sx: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            cursor: "pointer",
            minHeight: 56,
            "& .MuiInputBase-input": {
              display: "none",
            },
          },
          startAdornment: (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 0.5,
                flex: 1,
                py: 0.5,
              }}
            >
              {selectedItems.length === 0 ? (
                <Typography color="text.secondary">
                  Search and select items...
                </Typography>
              ) : (
                selectedItems.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    onDelete={() => handleRemoveItem(item)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                  />
                ))
              )}
            </Box>
          ),
          endAdornment: (
            <Box
              onClick={handleArrowClick}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transform: isOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            >
              <ArrowDropDown />
            </Box>
          ),
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      />

      <Popper
        anchorEl={anchorRef.current}
        open={isOpen}
        placement="bottom-start"
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 4],
            },
          },
        ]}
        style={{
          width: anchorRef.current?.clientWidth,
          zIndex: 1301,
        }}
      >
        <Box
          ref={popperRef}
          sx={{
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
            overflow: "hidden",
            maxHeight: 360,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              p: 1,
              zIndex: 1,
            }}
          >
            <TextField
              inputRef={searchInputRef}
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Search items..."
              size="small"
              fullWidth
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </Box>

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            {choices.length === 0 ? (
              <MenuItem disabled sx={{ opacity: 0.7 }}>
                No options found
              </MenuItem>
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
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => {}}
                      sx={{ mr: 1 }}
                    />
                    <span>{choice.label}</span>
                  </MenuItem>
                );
              })
            )}

            {loadMore && (
              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "background.paper",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  p: 1,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={(event) => {
                    event.stopPropagation();
                    loadMore();
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : null}
                  sx={{ textTransform: "none" }}
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Popper>
    </Box>
  );
}

export default MultiAutocompleteSelectField;
