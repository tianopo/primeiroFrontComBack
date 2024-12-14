import { ChangeEventHandler } from "react";
import { useFormContext } from "react-hook-form";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import { FlexCol } from "../Flex/FlexCol";
import { ErrorMessages } from "./ErrorMessages/ErrorMessages";
import "./Input/Input.css";
import { Label } from "./Label/Label";

export interface ICheckbox extends IUseForm {
  title: string;
  checked: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox = ({ disabled, required, title, onChange, checked, ...rest }: ICheckbox) => {
  const words = labelFormatted(title);
  const formContext = useFormContext();
  const { register, formState } = formContext || {};

  const { errors } = formState || {};
  const inputRegister = register ? register(words, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  return (
    <FlexCol>
      <div className="flex items-center gap-2">
        <input
          id={title}
          name={words}
          type="checkbox"
          readOnly
          disabled={disabled}
          checked={checked}
          {...inputRegister}
          onChange={(e) => {
            inputRegister?.onChange(e);
            onChange && onChange(e);
          }}
          className={`
          checkbox_white
          h-4
          w-4
          outline-none
          focus:outline-none
          `}
          {...rest}
        />
        <Label title={title} words={words} required={required} />
      </div>
      <ErrorMessages errors={errorMessage?.toString()} />
    </FlexCol>
  );
};
