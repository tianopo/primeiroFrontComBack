export const SectionInfo = () => {
  const onClick = () => {
    const message = `Hi! I would like some information about your services and projects`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5512982435638&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section
      className="flex w-full flex-col justify-between gap-6 text-justify font-extrabold text-white"
      id="info"
    >
      <div className="pulse-complete -left-24 bg-gradient-conic-secundary"></div>
      <h2>How We Deliver High Quality</h2>
      <div className="flex flex-col gap-2">
        <h4>Client Communication</h4>
        <p className="leading-6">
          We maintain an open and transparent communication channel with our clients, ensuring that
          all project stages are discussed and approved. Regular feedback and weekly meetings are
          part of our process to align expectations and ensure client satisfaction.
        </p>
        <h4>Website Creation Process</h4>
        <p className="leading-6">
          Our approach to website development is meticulous and detail-oriented. From the initial
          design to the final implementation, we use best UX/UI practices to create intuitive and
          engaging user experiences, with a focus on performance and responsiveness.
        </p>
        <h4>Testing Process</h4>
        <p className="leading-6">
          We apply rigorous testing processes to identify and fix any issues before launch. Our
          testing includes cross-browser compatibility checks, performance tests, security
          assessments, and usability testing to ensure a flawless experience.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4>Trading & Development</h4>
        <p className="leading-6">
          We combine our development expertise with advanced trading knowledge to offer customized
          solutions that meet our clients' needs. Our team is skilled in developing robust trading
          algorithms and personalized investments with a higher chance of return.
        </p>
      </div>
      <button className="button-colorido" onClick={onClick}>
        More Info
      </button>
    </section>
  );
};
