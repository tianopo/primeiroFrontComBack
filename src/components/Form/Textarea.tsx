import { ChangeEventHandler, ForwardRefRenderFunction, forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import { ErrorMessages } from "./ErrorMessages/ErrorMessages";
import "./Input/Input.css";
import { Label } from "./Label/Label";

interface ITextAreaX extends IUseForm {
  title: string;
  placeholder?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
  readOnly?: boolean;
}

export const BeginTextArea: ForwardRefRenderFunction<HTMLTextAreaElement, ITextAreaX> = (
  {
    disabled,
    required,
    title,
    placeholder,
    value,
    readOnly,
    rows = 4,
    onChange,
    ...rest
  }: ITextAreaX,
  ref,
) => {
  const words = labelFormatted(title);
  const formContext = useFormContext();
  const { register, formState } = formContext || {};

  const { errors } = formState || {};
  const inputRegister = register ? register(words, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  return (
    <div className="input_container">
      <Label title={title} words={words} required={required} />
      <textarea
        id={words}
        ref={ref}
        name={words}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        {...inputRegister}
        onChange={(e) => {
          inputRegister?.onChange(e);
          onChange && onChange(e);
        }}
        readOnly={readOnly}
        maxLength={255}
        autoComplete="complete"
        className={`h-20 w-full resize-none overflow-hidden text-ellipsis whitespace-nowrap rounded-4 border-1 border-edge-primary p-2.5 text-12 outline-none duration-300 ${disabled ? "cursor-not-allowed opacity-80" : ""} ${errorMessage ? "border-1 border-variation-error" : ""} `}
        {...rest}
      />
      <ErrorMessages errors={errorMessage?.toString()} />
    </div>
  );
};

export const TextAreaX = forwardRef(BeginTextArea);
