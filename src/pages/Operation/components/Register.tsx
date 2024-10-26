import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import { useOperation } from "../hooks/useOperation";

export const Register = () => {
  const [documento, setDocumento] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [apelido, setApelido] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const { mutate, isPending, context } = useOperation();
  const {
    formState: { errors },
    setValue,
  } = context;

  const handleNomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue("nome", e.target.value);
    setNome(e.target.value);
  };

  const handleApelidoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue("apelido", e.target.value);
    setApelido(e.target.value);
  };

  const handleExchangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue("exchange", e.target.value);
    setExchange(e.target.value);
  };

  const handleDocumentoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDocumento = formatCPFOrCNPJ(e.target.value);
    setValue("documento", formattedDocumento);
    setDocumento(formattedDocumento);
  };

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <CardContainer>
      <FormProvider {...context}>
        <FormX
          onSubmit={handleSubmit}
          className="flex h-fit w-full flex-col flex-wrap justify-between gap-2 md:flex-row"
        >
          <h2>REGISTER USER</h2>
          <InputX
            title="Nome"
            placeholder="Marcos Castro Silva"
            value={nome}
            onChange={handleNomeChange}
            required
          />
          <InputX
            title="Apelido"
            placeholder="User9855-54d4df"
            value={apelido}
            onChange={handleApelidoChange}
            required
          />
          <Select
            title="Exchange"
            placeholder="Bybit https://www.bybit.com/ SG"
            options={exchangeOptions}
            value={exchange}
            onChange={handleExchangeChange}
            required
          />
          <InputX
            title="Documento"
            placeholder="CPF/CNPJ"
            value={documento}
            onChange={handleDocumentoChange}
            required
          />
          <Button disabled={isPending || Object.keys(errors).length > 0}>Salvar</Button>
        </FormX>
      </FormProvider>
    </CardContainer>
  );
};
