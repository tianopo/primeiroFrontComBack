import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { useCompliance } from "../hooks/useCompliance";
import { ResponseCompliance } from "./ResponseCompliance";

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
          <ResponseCompliance responseData={responseData} />
        </div>
      </FormProvider>
    </CardContainer>
  );
};
