import { ChangeEventHandler, ForwardRefRenderFunction, forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { ErrorMessages } from "src/components/Form/ErrorMessages/ErrorMessages";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import "../cryptoTech.css";

interface IInputInstitucional extends IUseForm {
  index?: string;
  title: string;
  placeholder?: string;
  value?: string;
  typ?: "text" | "tel" | "date" | "email" | "number" | "time" | "datetime-local" | "password";
  onChange?: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  error?: string;
  step?: string;
  hidden?: boolean;
}

export const BeginInput: ForwardRefRenderFunction<HTMLInputElement, IInputInstitucional> = (
  {
    disabled,
    required,
    index,
    title,
    placeholder,
    value,
    readOnly,
    error,
    typ = "text",
    onChange,
    step,
    hidden,
    ...rest
  }: IInputInstitucional,
  ref,
) => {
  const words = labelFormatted(index ? `${title}-${index}` : title);
  const formContext = useFormContext();
  const { register, formState } = formContext || {};

  const { errors } = formState || {};
  const inputRegister = register ? register(words, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  return (
    <div className={`input_container`}>
      <label htmlFor={words} className={`${hidden ? "hidden" : ""}`}>
        {title}
      </label>
      <input
        id={words}
        ref={ref}
        name={words}
        type={typ}
        disabled={disabled}
        placeholder={placeholder}
        step={step}
        value={value}
        {...inputRegister}
        onChange={(e) => {
          inputRegister?.onChange(e);
          onChange && onChange(e);
        }}
        readOnly={readOnly}
        autoComplete="complete"
        className={`input border-edge-primary ${disabled ? "cursor-not-allowed opacity-80" : ""} ${errorMessage || error ? "border-1 border-variation-error" : ""} `}
        {...rest}
      />
      <ErrorMessages errors={error ? error : errorMessage?.toString()} />
    </div>
  );
};

export const InputInstitucional = forwardRef(BeginInput);
