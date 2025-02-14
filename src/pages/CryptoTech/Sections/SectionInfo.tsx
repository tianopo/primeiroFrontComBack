import { useTranslation } from "react-i18next";

export const SectionInfo = () => {
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`info.${t}`);

  const onClick = () => {
    const message = `${t("message")}`;
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
      <h2>{t("title")}</h2>
      <div className="flex flex-col gap-2">
        <h4>{t("subtitle1")}</h4>
        <p className="leading-6">{t("text1")}</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4>{t("subtitle2")}</h4>
        <p className="leading-6">{t("text2")}</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4>{t("subtitle3")}</h4>
        <p className="leading-6">{t("text3")}</p>
      </div>
      <button className="button-colorido" onClick={onClick}>
        {t("button")}
      </button>
    </section>
  );
};
