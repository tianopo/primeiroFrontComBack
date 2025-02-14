import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const SectionServicesTechnology = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`introduction.${t}`);
  const message = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5512982435638&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const services = [
    {
      title: "Basic",
      price: "$12,000.00",
      onClick: () =>
        message(`Hi! I would like to contract your basic development package, can we talk ?`),
      features: [
        "Free Domain",
        "Free Hosting",
        "Simple Application Development",
        "Process Automation",
        "Monitoring with Monthly Reports",
        "Technical Support via Email within 48 hours",
        "Basic Performance Analysis",
        "Basic SEO",
        "Monthly Security Updates with Patches",
        "Basic UX/UI Analysis and Improvement",
        "Basic Content Migration",
        "Integration with 5 APIs and 2 External Services",
        "Training and Consultancy Scheduled within 5 Days",
      ],
    },
    {
      title: "Intermediate",
      price: "$20,000.00",
      onClick: () =>
        message(
          `Hi! I would like to contract your intermediate development package, can we talk ?`,
        ),
      features: [
        "Free Domain",
        "Free Hosting",
        "Intermediate Application Development",
        "Process Automation with Employee Assistance",
        "Monitoring with Weekly Traffic Reports",
        "Technical Support via Email and WhatsApp within 6 Hours",
        "Basic Performance Analysis",
        "Intermediate SEO with Keyword Research",
        "Biweekly Security Updates with Patches",
        "Detailed UX/UI Analysis and Improvement",
        "Basic Content and Database Migrations",
        "Integration with 20 APIs and 4 External Services",
        "Training and Consultancy Scheduled within 3 Days",
      ],
    },
    {
      title: "Advanced",
      price: "$27,000.00",
      onClick: () =>
        message(`Hi! I would like to contract your advanced development package, can we talk ?`),
      features: [
        "Free Domain with Email",
        "Free Hosting",
        "Advanced Application Development",
        "Process Automation with Internal and External Assistance",
        "Monitoring with Daily Reports",
        "Immediate Technical Support via Email and WhatsApp",
        "Advanced Performance Analysis and Optimization",
        "SEO with Keyword Research and Monthly Reports",
        "Daily Security Updates",
        "UX/UI Analysis and Improvement with Redesign and A/B Testing",
        "Content, Database, and Services Migration",
        "Unlimited Integrations and External Services",
        "Personalized Training and Consultancy",
      ],
    },
  ];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? services.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === services.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex w-full flex-col items-center justify-between gap-6 font-extrabold text-white">
      <h2>Web Services</h2>
      <div className="flex w-full overflow-hidden md:w-[400px]">
        <div
          className="flex w-full transform transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {services.map((service, index) => (
            <div
              key={index}
              className="container-services flex w-full flex-none flex-col gap-4 px-4 md:flex-row"
              style={{ minWidth: "100%" }}
            >
              <h5 className="break-words">
                Package <strong className="px-1.5 text-strong-primary">{service.title}</strong>{" "}
                Monthly
              </h5>
              <h5>{service.price}</h5>
              <div className="flex flex-col gap-1.5">
                {service.features.map((feature, i) => (
                  <p key={i}>{feature}</p>
                ))}
              </div>
              <button className="button-colorido-services" onClick={service.onClick}>
                Get Now
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <button className="button-colorido-carrossel" onClick={handlePrevious}>
          <CaretLeft size={24} weight="bold" />
        </button>
        <button className="button-colorido-carrossel" onClick={handleNext}>
          <CaretRight size={24} weight="bold" />
        </button>
      </div>
    </section>
  );
};
