interface INavbar {
  nav: string[];
}

export const Navbar = ({ nav }: INavbar) => {
  return (
    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
      {nav.map((n, i) => (
        <h6
          key={i}
          className="cursor-pointer font-bold tracking-wide text-white hover:text-primary"
        >
          {n}
        </h6>
      ))}
    </div>
  );
};
