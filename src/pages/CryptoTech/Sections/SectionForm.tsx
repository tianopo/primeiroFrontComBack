import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { FormX } from "src/components/Form/FormX";
import { formatPhone } from "src/utils/formats";
import { InputInstitucional } from "../components/InputInstitucional";
import "../cryptoTech.css";
import { IContactForm, useContactForm } from "../hook/useContactForm";

export const SectionForm = () => {
  const { context } = useContactForm();
  const {
    formState: { errors },
    setValue,
    reset,
  } = context;
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const onSubmit = (data: IContactForm) => {
    const { name, phone, email } = data;
    const message = `Hi! We receive a new message from contact form:\n\nName: ${name}\nPhone: ${phone}\nE-mail: ${email}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5512982435638&text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    reset();
  };

  const handleNameOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("name", value);
    setName(value);
  };

  const handlePhoneOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = formatPhone(e.target.value);
    setValue("phone", value);
    setPhone(value);
  };

  const handleEmailOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("email", value);
    setEmail(value);
  };

  return (
    <section className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-end md:gap-0">
      <div className="container-opacity-light w-full">
        <h4 className="font-light text-white text-opacity-75">Get in touch and request a quote</h4>
        <h2 className="font-medium text-white text-opacity-75">Contact Form</h2>
        <FormProvider {...context}>
          <FormX onSubmit={onSubmit}>
            <div className="mb-2 flex flex-col gap-5 md:flex-row">
              <InputInstitucional
                title="Name"
                value={name}
                placeholder="Full Name"
                onChange={handleNameOnChange}
                required
              />
              <InputInstitucional
                title="Phone"
                value={phone}
                placeholder="(XX) XXXXX-XXXX"
                onChange={handlePhoneOnChange}
                required
              />
              <InputInstitucional
                title="Email"
                value={email}
                placeholder="E-mail"
                onChange={handleEmailOnChange}
                required
              />
            </div>
            <button disabled={Object.keys(errors).length > 0} className="button-colorido">
              Send
            </button>
          </FormX>
        </FormProvider>
      </div>
    </section>
  );
};
