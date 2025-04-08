import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

enum CategoryEnum {
  monster = "monster",
  animal = "animal",
  alien = "alien",
}

type Inputs = {
  name: string;
  category: CategoryEnum;
  stock: number;
  price: number;
  enabled: boolean;
};

export default function CharacterForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: "",
      category: CategoryEnum.alien,
      stock: 0,
      price: 0,
      enabled: false,
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Controller
            name="name"
            control={control}
            rules={{ required: true, maxLength: 256 }}
            render={({ field }) => <TextField {...field} />}
          />
          {errors.name && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box>
        <FormControl>
          <FormLabel>Category</FormLabel>
          <Controller
            name="category"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select {...field}>
                <MenuItem value="monster">Monster</MenuItem>
                <MenuItem value="animal">Animal</MenuItem>
                <MenuItem value="alien">Alien</MenuItem>
              </Select>
            )}
          />

          {errors.category && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box>
        <FormControl>
          <FormLabel>Stock</FormLabel>
          <Controller
            name="stock"
            control={control}
            rules={{ required: true, min: 0 }}
            render={({ field }) => <TextField type="number" {...field} />}
          />
          {errors.stock && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box>
        <FormControl>
          <FormLabel>Price</FormLabel>
          <Controller
            name="price"
            control={control}
            rules={{ required: true, min: 0 }}
            render={({ field }) => <TextField type="number" {...field} />}
          />
          {errors.price && (
            <FormHelperText>This field is required</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box>
        <FormControl>
          <FormLabel>Enabled</FormLabel>
          <Controller
            name="enabled"
            control={control}
            render={({ field }) => <Checkbox {...field} />}
          />
        </FormControl>
      </Box>

      <Button type="submit">Submit</Button>
    </form>
  );
}
