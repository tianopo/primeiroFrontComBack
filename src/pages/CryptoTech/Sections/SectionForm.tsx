import { InputInstitucional } from "../components/InputInstitucional";
import "../cryptoTech.css";

export const SectionForm = () => {
  return (
    <section className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-end md:gap-0">
      <div className="container-opacity-light">
        <h4 className="font-light text-white text-opacity-75">Get in touch and request a quote</h4>
        <h2 className="font-medium text-white text-opacity-75">Contact Form</h2>
        <div className="flex flex-col gap-5 md:flex-row">
          <InputInstitucional title="Name" placeholder="Full Name" />
          <InputInstitucional title="Phone" placeholder="(XX) XXXXX-XXXX" />
          <InputInstitucional title="Email" placeholder="E-mail" />
        </div>
        <button className="button-colorido">Send</button>
      </div>
    </section>
  );
};
