import { ReactNode } from "react";

interface ICardContainer {
  children: ReactNode;
  full?: boolean;
}

export const CardContainer = ({ children, full }: ICardContainer) => {
  return (
    <div
      className={`h-fit w-full rounded-16 bg-white p-4 shadow-2xl ${full ? "" : "lg:w-[calc(50%-1rem)]"}`}
    >
      {children}
    </div>
  );
};
