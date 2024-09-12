import { useState } from "react";
import { InputSearch } from "../components/InputSearch";
import "../cryptoTech.css";

export const SectionIntroduction = () => {
  const [project, setProject] = useState("");

  return (
    <section className="flex w-full flex-col justify-between gap-2 lg:flex-row lg:items-end">
      <div>
        <h2 className="section-1-text text-white">automate</h2>
        <h2
          className="section-1-text text-transparent"
          style={{
            WebkitTextStroke: "1px white",
          }}
        >
          develop @
        </h2>
        <h2 className="section-1-text text-white">trading</h2>
        <h5 className="z-50 font-extralight tracking-wider text-white">
          Automate and grow your business
        </h5>
      </div>
      <div className="container-opacity-light w-full lg:w-[calc(50%-1rem)]">
        <h4 className="text-36 font-medium text-white text-opacity-75">Projects And Services</h4>
        <InputSearch
          title="Search"
          placeholder="Search"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          busca
          options={[
            { label: "Matheus Portfolio", link: "https://portfolio-ten-weld-61.vercel.app/" },
            { label: "Santana Cred", link: "https://santanacred.com.br/" },
            { label: "Reurb", link: "https://reurbfront-tianopos-projects.vercel.app/" },
            { label: "Mike Token's Maintenance", link: "https://miketoken.io/" },
            { label: "Satoshi's Ambassador", link: "https://app.satoshiprotocol.org/" },
            {
              label: "Contact to Trade",
              link: "https://api.whatsapp.com/send?phone=5512982435638",
            },
          ]}
        />
      </div>
    </section>
  );
};
