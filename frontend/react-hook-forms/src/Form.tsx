import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import useProductStore from "product_store/useProductStore";

enum CategoryEnum {
  Monster = "Monster",
  Animal = "Animal",
  Alien = "Alien",
}

export type Inputs = {
  name: string;
  category: CategoryEnum;
  image: string;
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
      category: CategoryEnum.Alien,
      image: "",
      stock: 0,
      price: 0,
      enabled: false,
    },
  });

  const { addProduct } = useProductStore();

  const onSubmit: SubmitHandler<Inputs> = (data) => addProduct(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container={true} spacing={2}>
        <Grid size={6}>
          <FormControl fullWidth={true} error={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Controller
              name="name"
              control={control}
              rules={{ required: true, maxLength: 256 }}
              render={({ field }) => (
                <TextField {...field} error={!!errors.name} />
              )}
            />
            {errors.name && (
              <FormHelperText error={!!errors.name}>
                This field is required
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={6}>
          <FormControl fullWidth={true} error={!!errors.category}>
            <FormLabel>Category</FormLabel>
            <Controller
              name="category"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field} fullWidth={true} error={!!errors.category}>
                  <MenuItem value="Monster">Monster</MenuItem>
                  <MenuItem value="Animal">Animal</MenuItem>
                  <MenuItem value="Alien">Alien</MenuItem>
                </Select>
              )}
            />

            {errors.category && (
              <FormHelperText error={!!errors.category}>
                This field is required
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={6}>
          <FormControl fullWidth={true} error={!!errors.image}>
            <FormLabel>image</FormLabel>
            <Controller
              name="image"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField {...field} error={!!errors.image} />
              )}
            />
            {errors.image && (
              <FormHelperText error={!!errors.image}>
                This field is required
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={6}>
          <FormControl fullWidth={true} error={!!errors.stock}>
            <FormLabel>Stock</FormLabel>
            <Controller
              name="stock"
              control={control}
              rules={{ required: true, min: 0 }}
              render={({ field }) => (
                <TextField type="number" {...field} error={!!errors.stock} />
              )}
            />
            {errors.stock && (
              <FormHelperText error={!!errors.stock}>
                This field is required
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={6}>
          <FormControl fullWidth={true} error={!!errors.price}>
            <FormLabel>Price</FormLabel>
            <Controller
              name="price"
              control={control}
              rules={{ required: true, min: 0 }}
              render={({ field }) => (
                <TextField type="number" {...field} error={!!errors.price} />
              )}
            />
            {errors.price && (
              <FormHelperText error={!!errors.price}>
                This field is required
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={6}>
          <FormControl>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label="Published"
                />
              )}
            />
          </FormControl>
        </Grid>
      </Grid>

      <Box pt={3}>
        <Button type="submit" variant="contained" fullWidth={true}>
          Submit
        </Button>
      </Box>
    </form>
  );
}
