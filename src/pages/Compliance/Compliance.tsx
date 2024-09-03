import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { formatCNPJ, formatCPF } from "src/utils/formats";
import { useCompliance } from "./useCompliance";

export const Compliance = () => {
  const [cpf, setCpf] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const { mutate, isPending, context } = useCompliance();
  const {
    formState: { errors },
    setValue,
  } = context;

  const handleCpfChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setValue("cpf", formattedCPF);
    setCpf(formattedCPF);
  };

  const handleCnpjChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setValue("cnpj", formattedCNPJ);
    setCnpj(formattedCNPJ);
  };

  return (
    <FormProvider {...context}>
      <FormX
        onSubmit={mutate}
        className="flex flex-col flex-wrap justify-between gap-2 md:flex-row"
      >
        <InputX
          title="CPF"
          placeholder="XXX.XXX.XXX-XX"
          value={cpf}
          onChange={handleCpfChange}
          required
        />
        <InputX
          title="CNPJ"
          placeholder="XX.XXX.XXX/0001-XX"
          value={cnpj}
          onChange={handleCnpjChange}
        />
        <Button disabled={isPending || Object.keys(errors).length > 0}>Salvar</Button>
      </FormX>
    </FormProvider>
  );
};
