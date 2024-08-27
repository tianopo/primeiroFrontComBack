import { IUseForm } from "../../../interfaces/IUseForm";

interface ILabel extends IUseForm {
  title: string;
  words: string;
}

export const Label = ({ required, title, words }: ILabel) => {
  return (
    <div className="flex flex-row items-center">
      <label htmlFor={words} className="flex w-fit flex-row">
        <p className={`text-write-primary`}>
          {title} {required && <span className={`text-variation-error`}>*</span>}
        </p>
      </label>
    </div>
  );
};
