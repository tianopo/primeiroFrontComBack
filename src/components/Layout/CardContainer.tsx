import { ReactNode } from "react";

interface ICardContainer {
  children: ReactNode;
}

export const CardContainer = ({ children }: ICardContainer) => {
  return (
    <div className="h-fit w-full rounded-16 bg-white p-4 shadow-2xl lg:w-[calc(50%-1rem)]">
      {children}
    </div>
  );
};
