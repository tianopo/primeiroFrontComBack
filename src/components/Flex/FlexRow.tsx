import { HTMLAttributes, ReactNode } from "react";

interface IFlexRow extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const FlexRow = ({ children }: IFlexRow) => {
  return <div className={`flex flex-row items-center`}> {children}</div>;
};
