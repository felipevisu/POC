import { Box, TextField } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { useRef } from "react";

interface MultiAutocompleteSelectFieldProps {
  fetchChoices: (value: string) => void;
}

function MultiAutocompleteSelectField({
  fetchChoices,
}: MultiAutocompleteSelectFieldProps) {
  const anchor = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <TextField
        InputProps={{
          endAdornment: (
            <Box>
              <ArrowDropDown />
            </Box>
          ),
          ref: anchor,
          onFocus: () => {
            fetchChoices("");
          },
        }}
      />
    </>
  );
}

export default MultiAutocompleteSelectField;
