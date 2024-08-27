import { FormHTMLAttributes, forwardRef } from "react";
import { useFormContext } from "react-hook-form";

interface IFormX extends FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (data: any) => void;
}

export const FormX = forwardRef<HTMLFormElement, IFormX>(({ onSubmit, ...rest }, ref) => {
  const formContext = useFormContext();
  const { handleSubmit } = formContext || {};

  return <form onSubmit={handleSubmit(onSubmit)} {...rest} ref={ref} />;
});

FormX.displayName = "Form";
