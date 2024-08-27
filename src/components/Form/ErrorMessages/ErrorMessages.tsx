interface IErrorMessages {
  errors?: string;
}

export const ErrorMessages = ({ errors }: IErrorMessages) => {
  if (!errors) {
    return <></>;
  }

  return <span className="text-variation-error">{errors}</span>;
};
