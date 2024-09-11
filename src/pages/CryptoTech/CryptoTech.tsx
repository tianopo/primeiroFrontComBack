import { AnimateBlink } from "./components/AnimateBlink";
import "./cryptoTech.css";
import { SectionForm } from "./Sections/SectionForm";
import { SectionInfo } from "./Sections/SectionInfo";
import { SectionIntroduction } from "./Sections/SectionIntroduction";
import { SectionServicesTechnology } from "./Sections/SectionServicesTechnology";

export const CryptoTech = () => {
  const nav = ["Home", "Services", "Projects", "Portfolio", "Support"];

  return (
    <div className="relative flex w-full flex-col gap-16 overflow-hidden bg-background-black px-5">
      <div className="animate-pulse-heart absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gradient-conic-primary opacity-50 blur-3xl"></div>
      <AnimateBlink color="#FF0000" ballSize={16} startWidth={100} />
      <AnimateBlink color="#FF0000" ballSize={16} startWidth={200} />
      <AnimateBlink color="#FF0000" ballSize={16} startWidth={300} />
      <AnimateBlink color="#FF0000" ballSize={24} startWidth={400} />
      <AnimateBlink color="#FF0000" ballSize={24} startWidth={500} />
      <AnimateBlink color="#FF0000" ballSize={40} startWidth={600} />
      <AnimateBlink color="#3300FF" ballSize={16} startWidth={700} />
      <AnimateBlink color="#3300FF" ballSize={16} startWidth={800} />
      <AnimateBlink color="#3300FF" ballSize={16} startWidth={100} />
      <AnimateBlink color="#3300FF" ballSize={24} startWidth={200} />
      <AnimateBlink color="#3300FF" ballSize={24} startWidth={300} />
      <AnimateBlink color="#3300FF" ballSize={40} startWidth={400} />
      <AnimateBlink color="#FF00E5" ballSize={16} startWidth={500} />
      <AnimateBlink color="#FF00E5" ballSize={16} startWidth={600} />
      <AnimateBlink color="#FF00E5" ballSize={16} startWidth={700} />
      <AnimateBlink color="#FF00E5" ballSize={24} startWidth={800} />
      <AnimateBlink color="#FF00E5" ballSize={24} startWidth={100} />
      <AnimateBlink color="#FF00E5" ballSize={40} startWidth={200} />
      <AnimateBlink color="#0085FF" ballSize={16} startWidth={300} />
      <AnimateBlink color="#0085FF" ballSize={16} startWidth={400} />
      <AnimateBlink color="#0085FF" ballSize={16} startWidth={500} />
      <AnimateBlink color="#0085FF" ballSize={24} startWidth={600} />
      <AnimateBlink color="#0085FF" ballSize={24} startWidth={700} />
      <AnimateBlink color="#0085FF" ballSize={40} startWidth={800} />
      <AnimateBlink color="#FFF" ballSize={16} startWidth={100} />
      <AnimateBlink color="#FFF" ballSize={16} startWidth={200} />
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
