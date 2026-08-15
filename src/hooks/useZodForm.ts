import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const useZodForm =(
  schema: any,
  defaultValues?: Partial<z.infer<any>>
) => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<z.infer<any>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return {
    register,
    watch,
    reset,
    errors,
    handleSubmit,
    isSubmitting,
    isValid,
  };
};

export default useZodForm;