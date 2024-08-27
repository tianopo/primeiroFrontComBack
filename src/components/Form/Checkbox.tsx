import { ChangeEventHandler } from "react";
import { useFormContext } from "react-hook-form";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import { FlexCol } from "../Flex/FlexCol";
import { FlexRow } from "../Flex/FlexRow";
import { ErrorMessages } from "./ErrorMessages/ErrorMessages";
import "./Input.css";
import { Label } from "./Label/Label";

export interface ICheckbox extends IUseForm {
  title: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export const Checkbox = ({ disabled, required, title, onChange, ...rest }: ICheckbox) => {
  const words = labelFormatted(title);
  const formContext = useFormContext();
  const { register, formState } = formContext || {};

  const { errors } = formState || {};
  const inputRegister = register ? register(title, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  return (
    <FlexCol>
      <FlexRow className="gap-1 p-2">
        <input
          id={title}
          name={words}
          type="checkbox"
          readOnly
          disabled={disabled}
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
      </FlexRow>
      <ErrorMessages errors={errorMessage?.toString()} />
    </FlexCol>
  );
};
