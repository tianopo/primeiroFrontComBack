interface IGearIcon {
  name: string;
  icon: JSX.Element;
}

export const IconX = ({ name, icon }: IGearIcon) => {
  return (
    <div
      className="relative h-fit cursor-pointer rounded-6 text-10 font-bold leading-pattern before:absolute before:-bottom-20 before:left-1/2 before:hidden before:w-max before:-translate-x-1/2 before:-translate-y-full before:rounded-md before:bg-terciary before:p-2.5 before:text-white before:transition-all before:content-[attr(data-tip)] after:absolute after:-bottom-4 after:left-1/2 after:hidden after:h-0 after:w-0 after:-translate-x-1/2 after:border-8 after:border-terciary after:border-l-transparent after:border-r-transparent after:border-t-transparent after:transition-all hover:before:block hover:after:block"
      data-tip={name}
    >
      {icon}
    </div>
  );
};
