import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCNPJ, formatCPF } from "src/utils/formats";
import { useCompliance } from "../hooks/useCompliance";
import { AE } from "./QueryDataTransparencia/AE";
import { BPC } from "./QueryDataTransparencia/BPC";
import { CNEP } from "./QueryDataTransparencia/CNEP";
import { CNPJ } from "./QueryDataTransparencia/CNPJ";
import { PEP } from "./QueryDataTransparencia/PEP";
import { PETI } from "./QueryDataTransparencia/PETI";
import { SDC } from "./QueryDataTransparencia/SDC";
import { Safra } from "./QueryDataTransparencia/Safra";

export const Compliance = () => {
  const [cpf, setCpf] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
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

  const handleSubmit = (data: any) => {
    mutate(data, {
      onSuccess: (data) => {
        setResponseData(data);
      },
    });
  };

  return (
    <CardContainer>
      <FormProvider {...context}>
        <div className="flex h-fit w-full flex-col">
          <FormX
            onSubmit={handleSubmit}
            className="flex flex-col flex-wrap justify-between gap-2 md:flex-row"
          >
            <h2>COMPLIANCE</h2>
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
            <Button disabled={isPending || Object.keys(errors).length > 0}>Checar</Button>
          </FormX>
          {responseData && (
            <div>
              <h3>Dados da Consulta:</h3>
              <h6>{responseData?.ourData}</h6>
              {responseData?.pep && <PEP responseData={responseData?.pep} />}
              {responseData?.cnpj && <CNPJ responseData={responseData?.cnpj} />}
              {responseData?.sdc && <SDC responseData={responseData?.sdc} />}
              {responseData?.safra && <Safra responseData={responseData?.safra} />}
              {responseData?.peti && <PETI responseData={responseData?.peti} />}
              {responseData?.bpc && <BPC responseData={responseData?.bpc} />}
              {responseData?.ae && <AE responseData={responseData?.ae} />}
              {responseData?.cnep && <CNEP responseData={responseData?.cnep} />}
            </div>
          )}
        </div>
      </FormProvider>
    </CardContainer>
  );
};
