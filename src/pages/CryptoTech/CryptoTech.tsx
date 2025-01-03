import { AnimateBlink } from "./components/AnimateBlink";
import { AnimateSnake } from "./components/AnimateSnake";
import { Navbar } from "./components/Navbar";
import "./cryptoTech.css";
import { SectionDigitalAssetsSale } from "./Sections/SectionDigitalAssetsSale";
import { SectionForm } from "./Sections/SectionForm";
import { SectionInfo } from "./Sections/SectionInfo";
import { SectionIntroduction } from "./Sections/SectionIntroduction";
import { SectionServicesTechnology } from "./Sections/SectionServicesTechnology";

export const CryptoTech = () => {
  const nav = ["Home", "Services", "Info", "Support"];

  return (
    <div className="relative flex h-fit w-full flex-col gap-16 overflow-hidden bg-background-black px-5">
      <div className="pulse-complete -left-24 -top-28 bg-gradient-conic-primary"></div>
      {/* Cobra ondulando */}
      <AnimateSnake />
      <AnimateSnake />
      <AnimateSnake />
      <AnimateSnake />
      <AnimateSnake />
      {/* Bolas Brilhando */}
      <AnimateBlink color="#FF0000" ballSize={16} />
      <AnimateBlink color="#FF0000" ballSize={16} />
      <AnimateBlink color="#FF0000" ballSize={16} />
      <AnimateBlink color="#FF0000" ballSize={24} />
      <AnimateBlink color="#FF0000" ballSize={24} />
      <AnimateBlink color="#FF0000" ballSize={40} />
      <AnimateBlink color="#3300FF" ballSize={16} />
      <AnimateBlink color="#3300FF" ballSize={16} />
      <AnimateBlink color="#3300FF" ballSize={16} />
      <AnimateBlink color="#3300FF" ballSize={24} />
      <AnimateBlink color="#3300FF" ballSize={24} />
      <AnimateBlink color="#3300FF" ballSize={40} />
      <AnimateBlink color="#FF00E5" ballSize={16} />
      <AnimateBlink color="#FF00E5" ballSize={16} />
      <AnimateBlink color="#FF00E5" ballSize={16} />
      <AnimateBlink color="#FF00E5" ballSize={24} />
      <AnimateBlink color="#FF00E5" ballSize={24} />
      <AnimateBlink color="#FF00E5" ballSize={40} />
      <AnimateBlink color="#0085FF" ballSize={16} />
      <AnimateBlink color="#0085FF" ballSize={16} />
      <AnimateBlink color="#0085FF" ballSize={16} />
      <AnimateBlink color="#0085FF" ballSize={24} />
      <AnimateBlink color="#0085FF" ballSize={24} />
      <AnimateBlink color="#0085FF" ballSize={40} />
      <AnimateBlink color="#FFF" ballSize={16} />
      <AnimateBlink color="#FFF" ballSize={16} />
      <header
        className="flex w-full flex-col items-center justify-between gap-2 p-4 md:flex-row md:gap-0"
        id="home"
      >
        <h3 className="font-extrabold uppercase text-white">cryptotech</h3>
        <Navbar nav={nav} />
        <button className="button-colorido">coming soon</button>
      </header>
      <SectionIntroduction />
      <SectionForm />
      <div className="flex flex-col gap-2 lg:flex-row lg:gap-0" id="services">
        <SectionServicesTechnology />
        <SectionDigitalAssetsSale />
      </div>
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
      <footer className="border-gradient flex h-40 flex-col items-center justify-between gap-2 border-t-1 md:h-28 md:flex-row">
        <div className="pulse-complete -right-24 bg-gradient-conic-secundary"></div>
        <h3 className="font-extrabold uppercase text-white">cryptotech</h3>
        <Navbar nav={nav} />
        <div className="flex flex-col items-center">
          <div className="mt-4 flex space-x-4">
            {/* Link do YouTube */}
            <a
              href="https://www.youtube.com/@tianopo-crypto"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <img src="/socialMedias/youtube.png" alt="YouTube" />
            </a>

            {/* Link do TikTok */}
            <a
              href="https://www.tiktok.com/@tianopovideo"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 md:h-10 md:w-10"
            >
              <img src="/socialMedias/tiktok.png" alt="TikTok" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
