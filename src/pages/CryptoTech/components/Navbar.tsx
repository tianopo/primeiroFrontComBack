interface INavbar {
  nav: string[];
}

export const Navbar = ({ nav }: INavbar) => {
  const message = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5512982435638&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleClick = (item: string) => {
    if (item === "Support") {
      message("I would like help to understand about your company");
    } else if (item === "Services") {
      window.location.href = "#services";
    } else if (item === "Info") {
      window.location.href = "#info";
    } else {
      window.location.href = "#home";
    }
  };

  return (
    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
      {nav.map((item, i) => (
        <h6
          key={i}
          className="cursor-pointer font-bold tracking-wide text-white hover:text-primary"
          onClick={() => handleClick(item)}
        >
          {item}
        </h6>
      ))}
    </div>
  );
};
