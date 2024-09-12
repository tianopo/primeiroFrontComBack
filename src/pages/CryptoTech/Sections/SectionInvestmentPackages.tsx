import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export const SectionInvestmentPackages = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const packages = [
    {
      title: "Starter",
      investmentRange: "$100 - $1,000 USD",
      features: [
        "Minimum Investment: 100 USD",
        "Maximum Investment: 1,000 USD",
        "Accepted cryptocurrencies: USDT | USDC",
        "Estimated Monthly Profit: 5% of Net Profit",
        "Cryptotech Commission: 50% of Profit",
        "Example: Invest 100 USDT, Estimated profit: 5 USDT, Comission: 2.5 USDT",
        "Monthly Payout of Profits in USDT",
        "Report Monthly",
      ],
    },
    {
      title: "Intermediate",
      investmentRange: "$1,001 - $20,000 USD",
      features: [
        "Minimum Investment: 1,001 USD",
        "Maximum Investment: 40,000 USD",
        "Accepted cryptocurrencies: USDT | BTC | USDC | ETH | BNB",
        "Estimated Monthly Profit: 10% of Net Profit",
        "Cryptotech Commission: 40% of Profit",
        "Example: Invest 1,500 USDC, Estimated profit: 150 USDC, Comission: 600 USDC",
        "Monthly Payout of Profits in Chosen Cryptocurrency",
        "Report Quinzenal",
      ],
    },
    {
      title: "Advanced",
      investmentRange: "$20,001 - $500,000 USD",
      features: [
        "Minimum Investment: 40,001 USD",
        "Maximum Investment: 500,000 USD",
        "Accepted cryptocurrencies: USDT | BTC | USDC | ETH | BNB | DAI | FDUSD | DOGE",
        "Estimated Monthly Profit: 15% of Net Profit",
        "Cryptotech Commission: 30% of Profit",
        "Example: Invest 1 BTC, Estimated profit: 1.15 BTC, Comission: 0,0225 BTC",
        "Monthly Payout of Profits in Chosen Cryptocurrency",
        "Report Weekly",
      ],
    },
    {
      title: "Custom",
      investmentRange: "Above $500,000 USD",
      features: [
        "For investments above 500,000 USD",
        "Custom Terms and Conditions",
        "Negotiable Commission Rates",
        "Personalized Monthly Profit Targets",
        "Tailored Financial Strategies",
        "Dedicated Support Team",
      ],
    },
  ];

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? packages.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === packages.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex w-full flex-col items-center justify-between gap-6 font-extrabold text-white">
      <h2>Investment Crypto</h2>
      <div className="animate-pulse-heart absolute -right-24 h-80 w-80 rounded-full bg-gradient-conic-secundary opacity-50 blur-3xl"></div>
      <div className="flex w-full overflow-hidden md:w-[400px]">
        <div
          className="flex w-full transform transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {packages.map((pkg, index) => (
            <div
              key={index}
              className="container-services flex w-full flex-none flex-col gap-4 px-4 md:flex-row"
              style={{ minWidth: "100%" }}
            >
              <h5 className="break-words">
                Package <strong className="px-1.5 text-strong-primary">{pkg.title}</strong> Monthly
              </h5>
              <h5>Investment: {pkg.investmentRange}</h5>
              <div className="flex flex-col gap-1.5">
                {pkg.features.map((feature, i) => (
                  <p key={i}>{feature}</p>
                ))}
              </div>
              <button className="button-colorido">
                {pkg.title === "Custom" ? "Contact Us" : "Invest Now"}
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
