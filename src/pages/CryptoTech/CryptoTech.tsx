import "./cryptoTech.css";
import { SectionForm } from "./Sections/SectionForm";
import { SectionInfo } from "./Sections/SectionInfo";
import { SectionIntroduction } from "./Sections/SectionIntroduction";
import { SectionServicesTechnology } from "./Sections/SectionServicesTechnology";

export const CryptoTech = () => {
  const nav = ["Home", "Services", "Projects", "Portfolio", "Support"];
  return (
    <div className="flex w-full flex-col gap-16 bg-background-black px-5">
      <div className="animate-pulse-heart absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gradient-conic-primary opacity-50 blur-3xl"></div>
      <header className="flex w-full flex-col items-center justify-between p-4 md:flex-row">
        <h3 className="font-extrabold uppercase text-white">cryptotech</h3>
        <div className="flex flex-row justify-between gap-4">
          {nav.map((n, i) => (
            <h6 key={i} className="tracking-wide text-white">
              {n}
            </h6>
          ))}
        </div>
        <button className="button-colorido">coming soon</button>
      </header>
      <SectionIntroduction />
      <SectionForm />
      <div className="animate-pulse-heart absolute -bottom-[50rem] -right-24 h-80 w-80 rounded-full bg-gradient-conic-secundary opacity-50 blur-3xl"></div>
      <SectionServicesTechnology />
      <SectionInfo />
      <section className="flex w-full flex-col justify-between gap-6 font-extrabold text-white">
        <h2>About/Info</h2>
        <h6 className="text-justify font-light leading-7">
          Our company specializes in software development and business process automation, helping
          our clients improve their operations and increase efficiency. In addition, we offer
          third-party P2P investment solutions, with clear and secure contracts, ensuring
          transparency and security for all parties involved. We combine cutting-edge technology
          with a deep understanding of the financial market to provide customized services that meet
          the specific needs of each client.
        </h6>
      </section>
      <footer className="border-gradient flex h-28 flex-row items-center justify-between border-t-1">
        <div className="animate-pulse-heart absolute -right-24 h-80 w-80 rounded-full bg-gradient-conic-secundary opacity-50 blur-3xl"></div>
        <h3 className="font-extrabold uppercase text-white">cryptotech</h3>
        <div className="flex flex-row justify-between gap-4">
          {nav.map((n, i) => (
            <h6 key={i} className="tracking-wide text-white">
              {n}
            </h6>
          ))}
        </div>
        <div>
          <h6 className="uppercase text-white">social networks coming soon</h6>
        </div>
      </footer>
    </div>
  );
};
