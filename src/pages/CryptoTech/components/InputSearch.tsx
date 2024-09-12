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
import "../cryptoTech.css";

interface IInputSearch extends IUseForm {
  title: string;
  placeholder?: string;
  value?: string;
  typ?: "text" | "tel" | "date" | "email" | "number" | "time" | "datetime-local" | "password";
  onChange?: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  busca?: boolean;
  error?: string;
  options?: { label: string; link: string }[];
}

export const BeginInputSearch: ForwardRefRenderFunction<HTMLInputElement, IInputSearch> = (
  {
    disabled,
    required,
    title,
    placeholder,
    value,
    readOnly,
    busca,
    error,
    typ = "text",
    onChange,
    options = [],
    ...rest
  }: IInputSearch,
  ref,
) => {
  const words = labelFormatted(title);
  const formContext = useFormContext();
  const { register, setValue } = formContext || {};

  const inputRegister = register ? register(words, { required }) : undefined;

  // busca
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value || "");
  const [selectedLink, setSelectedLink] = useState<string>("");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleOptionClick = (option: { label: string; link: string }) => {
    setInputValue(option.label);
    setSelectedLink(option.link);
    setIsOpen(false);
    if (setValue) {
      setValue(words, option.label);
    }
    if (onChange) {
      const simulatedEvent = {
        target: {
          value: option.label,
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

  const handleIconClick = () => {
    if (selectedLink) {
      window.open(selectedLink, "_blank");
    }
  };

  const buscaVal = busca && isOpen;
  return (
    <div className="relative flex w-full items-center">
      <input
        id={words}
        ref={ref}
        name={words}
        type={typ}
        disabled={disabled}
        placeholder={placeholder}
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
        className={`input ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
        {...rest}
      />
      {busca && (
        <MagnifyingGlass
          size={28}
          className="absolute right-8 cursor-pointer text-white"
          color="#fff"
          onClick={handleIconClick}
        />
      )}
      {buscaVal && (
        <ul
          className={`absolute left-0 top-full z-10 mt-2 ${options.length > 0 ? "h-fit max-h-48" : "h-16 max-h-20"} w-full overflow-auto rounded-lg border border-gray-300 bg-gray-300 bg-opacity-15`}
        >
          {options.length > 0 ? (
            options
              .filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
              .map((option, index) => (
                <li
                  key={index}
                  className={`cursor-pointer px-4 py-2 text-center text-24 font-bold text-white hover:bg-white hover:bg-opacity-15`}
                  onMouseDown={() => handleOptionClick(option)}
                >
                  {option.label}
                </li>
              ))
          ) : (
            <li className={`p-2 text-center text-24 text-gray-300`}>Sem dados</li>
          )}
        </ul>
      )}
    </div>
  );
};

export const InputSearch = forwardRef(BeginInputSearch);
