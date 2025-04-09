import {
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
                  <MenuItem value="monster">Monster</MenuItem>
                  <MenuItem value="animal">Animal</MenuItem>
                  <MenuItem value="alien">Alien</MenuItem>
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

      <Button type="submit" variant="contained" fullWidth={true}>
        Submit
      </Button>
    </form>
  );
}
