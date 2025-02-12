import { useState } from "react";
import { useTranslation } from "react-i18next";
import { InputSearch } from "../components/InputSearch";
import "../cryptoTech.css";

export const SectionIntroduction = () => {
  const [project, setProject] = useState("");
  const { t: translator } = useTranslation();
  const t = (t: string) => translator(`introduction.${t}`);

  return (
    <section className="flex w-full flex-col justify-between gap-2 lg:flex-row lg:items-end">
      <div>
        <h2 className="section-1-text text-white">{t("automate")}</h2>
        <h2
          className="section-1-text text-transparent"
          style={{
            WebkitTextStroke: "1px white",
          }}
        >
          {t("develop")} @
        </h2>
        <h2 className="section-1-text text-white">{t("trading")}</h2>
        <h5 className="z-50 font-extralight tracking-wider text-white">{t("automateAndGrow")}</h5>
      </div>
      <div className="container-opacity-light w-full lg:w-[calc(50%-1rem)]">
        <h4 className="text-36 font-medium text-white text-opacity-75">
          {t("projectAndServices")}
        </h4>
        <InputSearch
          title={`${t("search")}`}
          placeholder={`${t("search")}`}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          busca
          options={[
            { label: t("portfolio"), link: "https://portfolio-ten-weld-61.vercel.app/" },
            { label: "Santana Cred", link: "https://santanacred.com.br/" },
            { label: "Reurb", link: "https://reurbfront-tianopos-projects.vercel.app/" },
            { label: "Mike Token", link: "https://miketoken.io/" },
            { label: t("ambassadorSatohis"), link: "https://app.satoshiprotocol.org/" },
            {
              label: t("contactMyself"),
              link: "https://api.whatsapp.com/send?phone=5512982435638",
            },
          ]}
        />
      </div>
    </section>
  );
};
