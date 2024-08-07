import { ChangeEventHandler } from "react";
import { useFormContext } from "react-hook-form";
import { IUseForm } from "src/interfaces/IUseForm";
import { labelFormatted } from "src/utils/formatation/labelFormatted";
import { FlexCol } from "../Flex/FlexCol";
import { FlexRow } from "../Flex/FlexRow";
import { ErrorMessages } from "./ErrorMessages/ErrorMessages";
import { Label } from "./Label/Label";
import "./Input.css";

export interface IRadio extends IUseForm {
  title: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  options: string[];
}

export const Radio = ({ disabled, options, title, onChange, required, ...rest }: IRadio) => {
  const words = labelFormatted(title);
  const formContext = useFormContext();
  const { register, formState } = formContext || {};

  const { errors } = formState || {};
  const inputRegister = register ? register(title, { required }) : undefined;
  const errorMessage = errors && errors[words]?.message;

  return (
    <FlexCol className="input_container">
      <h4 className={`label-texto label-light`}>
        {title} {required && <span className={`label_required-light`}>*</span>}
      </h4>
      {options.map((option) => {
        return (
          <FlexRow key={option} className="w-fit gap-1.5 py-1">
            <input
              id={words}
              name={words}
              type="radio"
              value={option}
              readOnly
              disabled={disabled}
              checked
              className={`radio-light h-5 w-5`}
              {...inputRegister}
              onChange={(e) => {
                inputRegister?.onChange(e);
                onChange && onChange(e);
              }}
              {...rest}
            />
            <Label title={option} words={labelFormatted(option)} />
          </FlexRow>
        );
      })}
      <ErrorMessages errors={errorMessage?.toString()} />
    </FlexCol>
  );
};
