import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export const SectionDigitalAssetsSale = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const message = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5512982435638&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const packages = [
    {
      title: "Small Purchase",
      buy: "$50 - $250 USD",
      onClick: () =>
        message(
          `Hi! I would like to buy digital assets within the range of $50 - $250. Can we proceed?`,
        ),
      features: [
        "Amount: 50 - 250 USD",
        "Accepted cryptocurrencies: USDT | BTC | ETH | DOGE | USDC | BNB | Others",
        "Offer: 20% Rate",
        "Transaction Method: P2P",
        "Fast and secure transactions",
      ],
    },
    {
      title: "Medium Purchase",
      buy: "$251 - $6,000 USD",
      onClick: () =>
        message(
          `Hi! I would like to buy digital assets within the range of $251 - $6,000. Can we proceed?`,
        ),
      features: [
        "Amount: 251 - 6,000 USD",
        "Accepted cryptocurrencies: USDT | BTC | ETH | DOGE | USDC | BNB | Others",
        "Offer: 15% Rate",
        "Transaction Method: P2P",
        "Safe and efficient transfers",
      ],
    },
    {
      title: "Large Purchase",
      buy: "$6,001 - $50,000 USD",
      onClick: () =>
        message(
          `Hi! I would like to buy digital assets within the range of $6,001 - $50,000. Can we proceed?`,
        ),
      features: [
        "Amount: 6,001 - 50,000 USD",
        "Accepted cryptocurrencies: USDT | BTC | ETH | DOGE | USDC | BNB | Others",
        "Offer: 10% Rate",
        "Transaction Method: Direct Wallet or P2P",
        "Contract-based transaction",
      ],
    },
    {
      title: "Custom Purchase",
      buy: "Above $50,000 USD",
      onClick: () =>
        message(
          `Hi! I would like to buy digital assets over $50,000. Can we discuss custom terms?`,
        ),
      features: [
        "Amount: Above 50,000 USD",
        "Accepted cryptocurrencies: USDT | BTC | ETH | DOGE | USDC | BNB | Others",
        "Offer: Custom Rate",
        "Transaction Method: Direct Wallet or P2P",
        "Tailored terms and conditions",
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
      <h2>Buy Digital Assets</h2>
      <div className="pulse-complete -right-24 bg-gradient-conic-secundary"></div>
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
                Purchase <strong className="px-1.5 text-strong-primary">{pkg.title}</strong>
              </h5>
              <h5>Buy: {pkg.buy}</h5>
              <div className="flex flex-col gap-1.5">
                {pkg.features.map((feature, i) => (
                  <p key={i}>{feature}</p>
                ))}
              </div>
              <button className="button-colorido-services" onClick={pkg.onClick}>
                {pkg.title === "Custom" ? "Contact Us" : "Buy Now"}
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
