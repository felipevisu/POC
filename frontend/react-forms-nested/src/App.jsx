import {useForm, useFieldArray, Controller} from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function App() {
  const {control, register, handleSubmit} = useForm({
    defaultValues: {
      user: {
        name: "",
        contacts: [{type: "email", value: ""}],
      },
    },
  });

  const {fields, append, remove} = useFieldArray({
    control,
    name: "user.contacts",
  });

  const onSubmit = (data) => {
    console.log("Submitted data:", data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{p: 4}}>
      <Typography variant="h5" gutterBottom>User Form</Typography>

      <TextField
        label="Name"
        fullWidth
        {...register("user.name", {required: true})}
        margin="normal"
      />

      <Typography variant="h6" sx={{mt: 3}}>Contacts</Typography>

      {fields.map((field, index) => (
        <Grid container spacing={2} alignItems="center" key={field.id}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel id={`type-label-${index}`}>Type</InputLabel>
              <Controller
                control={control}
                name={`user.contacts.${index}.type`}
                defaultValue={field.type}
                render={({field}) => (
                  <Select
                    labelId={`type-label-${index}`}
                    label="Type"
                    {...field}
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Value"
              {...register(`user.contacts.${index}.value`, {required: true})}
            />
          </Grid>

          <Grid item xs={2}>
            <IconButton color="error" onClick={() => remove(index)}>
              <DeleteIcon/>
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon/>}
        onClick={() => append({type: "email", value: ""})}
        sx={{mt: 2}}
      >
        Add Contact
      </Button>

      <Box mt={4}>
        <Button variant="contained" color="primary" type="submit">
          Submit
        </Button>
      </Box>
    </Box>
  );
}
