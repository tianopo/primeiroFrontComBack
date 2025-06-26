import { IUseForm } from "../../../interfaces/IUseForm";

interface ILabel extends IUseForm {
  title: string;
  words: string;
  hidden?: boolean;
}

export const Label = ({ required, title, words, hidden }: ILabel) => {
  return (
    <div className={`flex flex-row items-center ${hidden ? "hidden" : ""}`}>
      <label htmlFor={words} className="flex w-fit flex-row">
        <p className={`text-write-primary`}>
          {title} {required && <span className={`text-variation-error`}>*</span>}
        </p>
      </label>
    </div>
  );
};
