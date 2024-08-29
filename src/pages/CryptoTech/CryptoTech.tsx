import "./cryptoTech.css";

export const CryptoTech = () => {
  const nav = ["Home", "Services", "Projects", "Portfolio", "Support"];
  return (
    <div className="flex w-full flex-col gap-16 bg-background-black px-5">
      <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gradient-conic-primary opacity-50 blur-3xl"></div>
      <header className="flex w-full flex-col items-center justify-between p-4 md:flex-row">
        <h3 className="font-extrabold uppercase text-white">cryptotech</h3>
        <div className="flex flex-row justify-between gap-4">
          {nav.map((n, i) => (
            <h6 key={i} className="tracking-wide text-white">
              {n}
            </h6>
          ))}
        </div>
        <button className="rounded-6 bg-gradient-linear-primary px-5 py-2 font-semibold text-white">
          Em breve
        </button>
      </header>
      <section className="flex w-full items-center justify-between">
        <div className="absolute -left-[-13.5rem] bottom-32 h-16 w-80 blur-sm">
          <svg viewBox="0 0 100 10" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <path
              d="M 0 5 Q 15 0, 25 5 T 50 -5 Q 62.5 10, 75 5 T 100 5"
              fill="none"
              stroke="url(#grad1)"
              strokeWidth="10"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="
                  M 0 5 Q 15 0, 25 5 T 50 -5 Q 60 10, 75 5 T 100 5;
                  M 0 5 Q 20 5, 30 5 T 50 -5 Q 65 0, 80 5 T 100 5;
                  M 0 5 Q 15 0, 25 5 T 50 -5 Q 60 10, 75 5 T 100 5
                "
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "#FF2727", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#243AFF", stopOpacity: 1 }} />
                <stop offset="98%" style={{ stopColor: "#FF12E7", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h2 className="section-1-text text-white">web design</h2>
          <h2 className="section-1-text text-white">develop @</h2>
          <h2 className="section-1-text text-white">trading</h2>
          <h5 className="z-50 font-extralight tracking-wider text-white">
            Cresça seu negócio online com a gente
          </h5>
        </div>
        <div className="h-fit w-1/2 rounded-6 bg-white p-6 opacity-10">
          <h4 className="text-white"></h4>
        </div>
      </section>
    </div>
  );
};
