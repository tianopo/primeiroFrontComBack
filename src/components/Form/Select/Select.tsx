import { CaretDown, CaretUp } from "@phosphor-icons/react";
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
import "../Input/Input.css";
import { Label } from "../Label/Label";

interface ISelect extends IUseForm {
  title: string;
  options?: string[];
  onChange?: ChangeEventHandler<HTMLInputElement>;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const BeginSelect: ForwardRefRenderFunction<HTMLInputElement, ISelect> = (
  { disabled, required, title, options, placeholder, onChange, value, ...props }: ISelect,
  ref,
) => {
  const words = labelFormatted(title);
  const { register, setValue, formState, clearErrors } = useFormContext() || {};
  const { errors } = formState || {};
  const selectRegister = register ? register(words, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(value);

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (setValue) {
      setValue(words, option);
    }
    if (clearErrors) {
      clearErrors(words);
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

  return (
    <div className="input_container relative">
      <Label title={title} words={words} required={required} />
      <div className="relative">
        <input
          id={words}
          ref={ref}
          name={words}
          placeholder={placeholder}
          disabled={disabled}
          value={selectedOption || value || ""}
          readOnly={true}
          onChange={(e) => {
            selectRegister?.onChange(e);
            onChange && onChange(e);
          }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`inputx cursor-pointer border-edge-primary ${disabled ? "cursor-no-drop opacity-80" : ""} ${errorMessage ? "border-1 border-variation-error" : ""} `}
          {...selectRegister}
          {...props}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 transform cursor-pointer text-write-secundary">
          {isOpen ? <CaretUp width={19.45} height={20} /> : <CaretDown width={19.45} height={20} />}
        </div>
        {isOpen && (
          <ul className="absolute left-0 top-full z-50 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white">
            {options?.map((option, index) => (
              <li
                key={index}
                className="cursor-pointer rounded-lg p-2.5 text-14 text-write-secundary hover:bg-selected-primary hover:text-write-primary"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ErrorMessages errors={errorMessage?.toString()} />
    </div>
  );
};

export const Select = forwardRef(BeginSelect);
