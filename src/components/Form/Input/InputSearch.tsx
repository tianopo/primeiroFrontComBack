import { MagnifyingGlass } from "@phosphor-icons/react";
import { ChangeEventHandler, ForwardRefRenderFunction, forwardRef } from "react";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import "./Input.css";

interface IInputSearch extends IUseForm {
  title: string;
  placeholder?: string;
  label?: string;
  value?: string;
  typ?: "text" | "tel" | "date" | "email" | "number" | "time" | "datetime-local" | "password";
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const BeginInputSearch: ForwardRefRenderFunction<HTMLInputElement, IInputSearch> = (
  {
    disabled,
    required,
    title,
    placeholder,
    value,
    typ = "text",
    label,
    onChange,
    ...rest
  }: IInputSearch,
  ref,
) => {
  const words = labelFormatted(title);

  return (
    <div className="relative flex w-full items-center">
      <input
        id={words}
        ref={ref}
        name={words}
        type={typ}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange && onChange(e);
        }}
        autoComplete="off"
        className={`input ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
        {...rest}
      />
      <MagnifyingGlass size={20} className="absolute right-2 text-gray-500" />
    </div>
  );
};

export const InputSearch = forwardRef(BeginInputSearch);
