import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const SectionDigitalAssetsSale = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`assetsSale.${t}`);
  const message = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5512982435638&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const packages = [
    {
      title: t("titleSmall"),
      buy: t("buySmall"),
      onClick: () => message(t("messageSmall")),
      features: [
        `${t("featuresAmount")}: ${t("buySmall")}`,
        `${t("featuresAccepted")}: USDT | BTC | DAI | FDUSD | USDC | ${t("featuresAcceptedOthers")}`,
        `${t("featuresOffer")}: ${t("featuresPercentageSmall")}% ${t("featuresRate")}`,
        `${t("featuresMethod")}: P2P | PIX`,
        t("featuresSafeSmall"),
      ],
    },
    {
      title: t("titleMedium"),
      buy: t("buyMedium"),
      onClick: () => message(t("messageMedium")),
      features: [
        `${t("featuresAmount")}: ${t("buyMedium")}`,
        `${t("featuresAccepted")}: USDT | BTC | DAI | FDUSD | USDC | ${t("featuresAcceptedOthers")}`,
        `${t("featuresOffer")}: ${t("featuresPercentageMedium")}% ${t("featuresRate")}`,
        `${t("featuresMethod")}: P2P | PIX`,
        t("featuresSafeMedium"),
      ],
    },
    {
      title: t("titleLarge"),
      buy: t("buyLarge"),
      onClick: () => message(t("messageLarge")),
      features: [
        `${t("featuresAmount")}: ${t("buyLarge")}`,
        `${t("featuresAccepted")}: USDT | BTC | DAI | FDUSD | USDC | ${t("featuresAcceptedOthers")}`,
        `${t("featuresOffer")}: ${t("featuresPercentageLarge")}% ${t("featuresRate")}`,
        `${t("featuresMethod")}: P2P | PIX`,
        t("featuresSafeLarge"),
      ],
    },
    {
      title: t("titleCustom"),
      buy: t("buyCustom"),
      onClick: () => message(t("messageCustom")),
      features: [
        `${t("featuresAmount")}: ${t("buyCustom")}`,
        `${t("featuresAccepted")}: USDT | BTC | DAI | FDUSD | USDC | ${t("featuresAcceptedOthers")}`,
        `${t("featuresOffer")}: ${t("featuresRateCustom")}`,
        `${t("featuresMethod")}: P2P | PIX`,
        t("featuresSafeCustom"),
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
      <h2>{t("title")}</h2>
      <div className="pulse-complete -right-24 bg-gradient-conic-secundary"></div>
      <div className="flex w-full overflow-hidden md:w-[550px]">
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
                <strong className="px-1.5 text-strong-primary">{pkg.title}</strong>
              </h5>
              <h5>
                {t("buy")}: {pkg.buy}
              </h5>
              <div className="flex flex-col gap-1.5">
                {pkg.features.map((feature, i) => (
                  <p key={i}>{feature}</p>
                ))}
              </div>
              <button className="button-colorido-services" onClick={pkg.onClick}>
                {pkg.title === t("titleCustom") ? t("contactUs") : t("buyNow")}
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
