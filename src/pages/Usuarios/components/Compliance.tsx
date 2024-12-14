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
            <div className="text-center">
              <h5>
                <strong>{responseData?.pdt?.cpf?.nome}</strong>
              </h5>
              {responseData?.pdt?.cpf?.nis && (
                <h5>
                  <strong>NIS: </strong>
                  {responseData?.pdt?.cpf?.nis}
                </h5>
              )}
              <h6>{responseData?.ourData}</h6>
              <div className="flex w-full flex-row flex-wrap justify-center">
                {responseData?.pdt?.viagens && (
                  <Viagens responseData={responseData?.pdt?.viagens} />
                )}
                {responseData?.pdt?.pep && <PEP responseData={responseData?.pdt?.pep} />}
                {responseData?.pdt?.cnpj && <CNPJ responseData={responseData?.pdt?.cnpj} />}
                {responseData?.pdt?.sdc && <SDC responseData={responseData?.pdt?.sdc} />}
                {responseData?.pdt?.safra && <Safra responseData={responseData?.pdt?.safra} />}
                {responseData?.pdt?.peti && <PETI responseData={responseData?.pdt?.peti} />}
                {responseData?.pdt?.bpc && <BPC responseData={responseData?.pdt?.bpc} />}
                {responseData?.pdt?.ae && <AE responseData={responseData?.pdt?.ae} />}
                {responseData?.pdt?.cnep && <CNEP responseData={responseData?.pdt?.cnep} />}
                {responseData?.pdt?.cf && <CF responseData={responseData?.pdt?.cf} />}
                {responseData?.pdt?.cepim && <CEPIM responseData={responseData?.pdt?.cepim} />}
                {responseData?.pdt?.ceis && <CEIS responseData={responseData?.pdt?.ceis} />}
                {responseData?.pdt?.ceaf && <CEAF responseData={responseData?.pdt?.ceaf} />}
              </div>
            </div>
          )}
        </div>
      </FormProvider>
    </CardContainer>
  );
};
