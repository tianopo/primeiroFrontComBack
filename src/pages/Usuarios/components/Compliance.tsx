import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { useCompliance } from "../hooks/useCompliance";
import { AE } from "./QueryDataTransparencia/AE";
import { BPC } from "./QueryDataTransparencia/BPC";
import { CEAF } from "./QueryDataTransparencia/CEAF";
import { CEIS } from "./QueryDataTransparencia/CEIS";
import { CEPIM } from "./QueryDataTransparencia/CEPIM";
import { CF } from "./QueryDataTransparencia/CF";
import { CNEP } from "./QueryDataTransparencia/CNEP";
import { CNPJ } from "./QueryDataTransparencia/CNPJ";
import { PEP } from "./QueryDataTransparencia/PEP";
import { PETI } from "./QueryDataTransparencia/PETI";
import { SDC } from "./QueryDataTransparencia/SDC";
import { Safra } from "./QueryDataTransparencia/Safra";
import { Viagens } from "./QueryDataTransparencia/Viagens";

export const Compliance = () => {
  const [documento, setDocumento] = useState<string>("");
  const [cnpj, setCnpj] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const { mutate, isPending, context } = useCompliance();
  const {
    formState: { errors },
    setValue,
  } = context;

  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDocumento = formatCPFOrCNPJ(e.target.value);
    setValue("documento", formattedDocumento);
    setDocumento(formattedDocumento);
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
            <h3 className="text-28 font-bold">COMPLIANCE</h3>
            <InputX
              title="Documento"
              placeholder="CPF ou CNPJ"
              value={documento}
              onChange={handleDocumentChange}
              required
            />
            <Button disabled={isPending || Object.keys(errors).length > 0}>Checar</Button>
          </FormX>
          {responseData && (
            <div>
              <h3>Dados da Consulta:</h3>
              <h6>{responseData?.ourData}</h6>
              {responseData?.viagens && <Viagens responseData={responseData?.viagens} />}
              {responseData?.pep && <PEP responseData={responseData?.pep} />}
              {responseData?.cnpj && <CNPJ responseData={responseData?.cnpj} />}
              {responseData?.sdc && <SDC responseData={responseData?.sdc} />}
              {responseData?.safra && <Safra responseData={responseData?.safra} />}
              {responseData?.peti && <PETI responseData={responseData?.peti} />}
              {responseData?.bpc && <BPC responseData={responseData?.bpc} />}
              {responseData?.ae && <AE responseData={responseData?.ae} />}
              {responseData?.cnep && <CNEP responseData={responseData?.cnep} />}
              {responseData?.cf && <CF responseData={responseData?.cf} />}
              {responseData?.cepim && <CEPIM responseData={responseData?.cepim} />}
              {responseData?.ceis && <CEIS responseData={responseData?.ceis} />}
              {responseData?.ceaf && <CEAF responseData={responseData?.ceaf} />}
            </div>
          )}
        </div>
      </FormProvider>
    </CardContainer>
  );
};
