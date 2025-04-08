import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  example: string;
  exampleRequired: string;
};

export default function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>
          Example <input defaultValue="test" {...register("example")} />
        </label>
      </div>
      <div>
        <label>
          Example (Required){" "}
          <input {...register("exampleRequired", { required: true })} />
        </label>
        {errors.exampleRequired && <div>This field is required</div>}
      </div>

      <input type="submit" />
    </form>
  );
}
