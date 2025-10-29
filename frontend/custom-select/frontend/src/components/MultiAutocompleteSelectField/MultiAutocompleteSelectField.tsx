import { useEffect, useRef, useState } from "react";
import "./MultiAutocompleteSelectField.scss";

interface MultiAutocompleteSelectFieldProps {
  fetchChoices: (value: string) => void;
  choices: { label: string; value: number | string }[];
  loadMore?: () => void;
  loading?: boolean;
  value: { label: string; value: number | string }[];
  onChange: (items: { label: string; value: number | string }[]) => void;
}

function MultiAutocompleteSelectField({
  fetchChoices,
  choices,
  loadMore,
  loading = false,
  value,
  onChange,
}: MultiAutocompleteSelectFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleItemSelect = (item: {
    label: string;
    value: number | string;
  }) => {
    const isAlreadySelected = value.some(
      (selected) => selected.value === item.value
    );

    if (isAlreadySelected) {
      onChange(value.filter((selected) => selected.value !== item.value));
    } else {
      onChange([...value, item]);
    }
  };

  const handleRemoveItem = (
    itemToRemove: { label: string; value: number | string },
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    onChange(value.filter((item) => item.value !== itemToRemove.value));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchValue(searchTerm);
    fetchChoices(searchTerm);
  };

  const openDropdown = () => {
    if (isOpen) return;
    setIsOpen(true);
    setSearchValue("");
    fetchChoices("");
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleContainerClick = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleArrowClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleContainerClick();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;

      closeDropdown();
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Focus search input when dropdown opens
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="multi-autocomplete">
      <div
        ref={containerRef}
        className={`multi-autocomplete__input-container ${
          isOpen ? "multi-autocomplete__input-container--open" : ""
        }`}
        onClick={handleContainerClick}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="multi-autocomplete__chips-container">
          {value.length === 0 ? (
            <span className="multi-autocomplete__placeholder">
              Search and select items...
            </span>
          ) : (
            value.map((item) => (
              <div key={item.value} className="multi-autocomplete__chip">
                <span className="multi-autocomplete__chip__label">
                  {item.label}
                </span>
                <button
                  className="multi-autocomplete__chip__delete"
                  onClick={(event) => handleRemoveItem(item, event)}
                  aria-label={`Remove ${item.label}`}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div
          className={`multi-autocomplete__arrow ${
            isOpen ? "multi-autocomplete__arrow--open" : ""
          }`}
          onClick={handleArrowClick}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>

      <div
        ref={dropdownRef}
        className={`multi-autocomplete__dropdown ${
          !isOpen ? "multi-autocomplete__dropdown--hidden" : ""
        }`}
      >
        <div className="multi-autocomplete__search-container">
          <input
            ref={searchInputRef}
            className="multi-autocomplete__search-input"
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search items..."
            onClick={(event) => event.stopPropagation()}
          />
        </div>

        <div className="multi-autocomplete__options">
          {choices.length === 0 ? (
            <div className="multi-autocomplete__no-options">
              No options found
            </div>
          ) : (
            choices.map((choice) => {
              const isSelected = value.some(
                (item) => item.value === choice.value
              );

              return (
                <button
                  key={choice.value}
                  className={`multi-autocomplete__option ${
                    isSelected ? "multi-autocomplete__option--selected" : ""
                  }`}
                  onClick={() => handleItemSelect(choice)}
                  type="button"
                >
                  <div
                    className={`multi-autocomplete__checkbox ${
                      isSelected ? "multi-autocomplete__checkbox--checked" : ""
                    }`}
                  />
                  <span>{choice.label}</span>
                </button>
              );
            })
          )}

          {loadMore && (
            <div className="multi-autocomplete__load-more-container">
              <button
                className="multi-autocomplete__load-more-button"
                onClick={(event) => {
                  event.stopPropagation();
                  loadMore();
                }}
                disabled={loading}
                type="button"
              >
                {loading && <div className="multi-autocomplete__spinner" />}
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiAutocompleteSelectField;
