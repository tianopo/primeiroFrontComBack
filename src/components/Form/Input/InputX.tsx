import { MagnifyingGlass } from "@phosphor-icons/react";
import {
  ChangeEventHandler,
  ForwardRefRenderFunction,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import { ErrorMessages } from "../ErrorMessages/ErrorMessages";
import { Label } from "../Label/Label";
import "./Input.css";

interface IInputX extends IUseForm {
  index?: string;
  title: string;
  placeholder?: string;
  value?: string;
  typ?: "text" | "tel" | "date" | "email" | "number" | "time" | "datetime-local" | "password";
  onChange?: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  busca?: boolean;
  error?: string;
  options?: string[];
  step?: string;
}

export const BeginInput: ForwardRefRenderFunction<HTMLInputElement, IInputX> = (
  {
    disabled,
    required,
    index,
    title,
    placeholder,
    value,
    readOnly,
    busca,
    error,
    typ = "text",
    onChange,
    options = [],
    step,
    ...rest
  }: IInputX,
  ref,
) => {
  const words = labelFormatted(index ? `${title}-${index}` : title);
  const formContext = useFormContext();
  const { register, formState, setValue } = formContext || {};

  const { errors } = formState || {};
  const inputRegister = register ? register(words, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  // busca
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleOptionClick = (option: string) => {
    setInputValue(option);
    setIsOpen(false);
    if (setValue) {
      setValue(words, option);
    }
    if (onChange) {
      const simulatedEvent = {
        target: {
          value: option,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(simulatedEvent);
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (inputRegister) {
      inputRegister.onChange(e);
    }
    if (onChange) {
      onChange(e);
    }
    if (busca) {
      setIsOpen(true);
    }
  };

  const handleFocus = () => {
    if (busca) setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  const buscaVal = busca && isOpen;
  return (
    <div className={`input_container ${busca && "relative"}`}>
      <Label title={title} words={words} required={required} />
      <input
        id={words}
        ref={ref}
        name={words}
        type={typ}
        disabled={disabled}
        placeholder={placeholder}
        step={step}
        value={buscaVal ? inputValue : value}
        {...inputRegister}
        onChange={
          buscaVal
            ? handleChange
            : (e) => {
                inputRegister?.onChange(e);
                onChange && onChange(e);
              }
        }
        readOnly={readOnly}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="complete"
        className={`input border-edge-primary ${disabled ? "cursor-not-allowed opacity-80" : ""} ${errorMessage || error ? "border-1 border-variation-error" : ""} `}
        {...rest}
      />
      {busca && <MagnifyingGlass size={20} className="absolute bottom-2.5 right-2 text-gray-500" />}
      {buscaVal && (
        <ul
          className={`options-list absolute left-0 top-full z-10 h-16 max-h-20 w-full overflow-auto rounded-lg border border-gray-300 bg-white`}
        >
          {options.length > 0 ? (
            options
              .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
              .map((option, index) => (
                <li
                  key={index}
                  className={`option-item cursor-pointer p-2 hover:bg-gray-100`}
                  onMouseDown={() => handleOptionClick(option)}
                >
                  {option}
                </li>
              ))
          ) : (
            <li className={`p-2 text-center text-14 text-write-placeholder`}>Sem dados</li>
          )}
        </ul>
      )}
      <ErrorMessages errors={error ? error : errorMessage?.toString()} />
    </div>
  );
};

export const InputX = forwardRef(BeginInput);
