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
        <h2 className="section-1-text text-white">{t("trading")}</h2>
        <h2
          className="section-1-text text-transparent"
          style={{
            WebkitTextStroke: "1px white",
          }}
        >
          {t("crypto")} @
        </h2>
        <h2 className="section-1-text text-white">{t("intermediate")}</h2>
        <h5 className="z-50 font-extralight tracking-wider text-white">{t("negociateCrypto")}</h5>
      </div>
      <div className="container-opacity-light w-full lg:w-[calc(50%-1rem)]">
        <h4 className="text-36 font-medium text-white text-opacity-75">
          {t("exchangesAndContract")}
        </h4>
        <InputSearch
          title={`${t("search")}`}
          placeholder={`${t("search")}`}
          value={project}
          onChange={(e) => setProject(e.target.value)}
          busca
          options={[
            {
              label: "Bybit Empresarial",
              link: "https://www.bybit.com/en/fiat/trade/otc/profile/s839905d4dc8d447a8f5ff55859dcd1d0/USDT/BRL/item",
            },
            {
              label: "Bybit Pessoal",
              link: "https://www.bybit.com/pt-BR/fiat/trade/otc/profile/sa14f0f123e284b0abf336c9bd881a78e/USDT/BRL/item",
            },
            {
              label: "Coinex Empresarial",
              link: "https://www.coinex.com/pt/p2p/user/info/DDF466CD",
            },
            { label: "Coinex Pessoal", link: "https://www.coinex.com/pt/p2p/user/info/E5D70F69" },
            {
              label: "Kucoin Empresarial",
              link: "https://www.kucoin.com/pt/otc/merchant?id=67a0d7b59fd9f300014ea947",
            },
            {
              label: "MEXC",
              link: "https://www.mexc.com/buy-crypto/merchant?id=afbcd6761ac247098be08fc13ed95b62",
            },
            { label: "BingX", link: "https://bingx.paycat.com/pt-br/p2p/" },
            { label: "HTX", link: "https://www.htx.com/en-us/fiat-crypto/trader/494495633" },
            {
              label: "Gate.io",
              link: "https://www.gate.io/pt-br/p2p/user/txgGu6sVouzwLtBsDdTPYSQFatrieH",
            },
            {
              label: "Bitget",
              link: "https://www.bitget.com/pt/p2p-trade/user/beb64a7e8cb13851ad90",
            },
            {
              label: "Binance",
              link: "https://c2c.binance.com/pt-BR/advertiserDetail?advertiserNo=s0b103a333568300885ab7fbe69609d15",
            },
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
