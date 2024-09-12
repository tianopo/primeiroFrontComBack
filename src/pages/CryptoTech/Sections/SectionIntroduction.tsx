import { InputSearch } from "../components/InputSearch";
import "../cryptoTech.css";

export const SectionIntroduction = () => {
  return (
    <section className="flex w-full flex-col justify-between gap-2 lg:flex-row lg:items-end">
      <div className="absolute -left-[-13.5rem] bottom-32 h-16 w-[calc(50%-1rem)] blur-sm">
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
        <h2 className="section-1-text text-white">automate</h2>
        <h2
          className="section-1-text text-transparent"
          style={{
            WebkitTextStroke: "1px white",
          }}
        >
          develop @
        </h2>
        <h2 className="section-1-text text-white">trading</h2>
        <h5 className="z-50 font-extralight tracking-wider text-white">
          Automate and grow your business
        </h5>
      </div>
      <div className="container-opacity-light w-full lg:w-[calc(50%-1rem)]">
        <h4 className="text-36 font-medium text-white text-opacity-75">Search our Services</h4>
        <InputSearch title="Search" placeholder="Search" />
      </div>
    </section>
  );
};
