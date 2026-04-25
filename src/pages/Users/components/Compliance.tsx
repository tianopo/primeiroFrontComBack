import { Broom } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { useCompliance } from "../hooks/useCompliance";
import { ComplianceEditModal } from "./Compliance/ComplianceEditModal";

export const Compliance = () => {
  const [documento, setDocumento] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const { mutate, isPending, context } = useCompliance();
  const {
    formState: { errors },
    setValue,
    reset,
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
        setOpenEditModal(true);
      },
    });
  };

  const handleClear = () => {
    setDocumento("");
    setResponseData(null);
    reset();
  };

  return (
    <CardContainer>
      <FormProvider {...context}>
        <div className="flex h-fit w-full flex-col">
          <FormX
            onSubmit={handleSubmit}
            className="flex flex-col flex-wrap justify-between gap-2 md:flex-row"
          >
            <div className="flex w-full items-center justify-between">
              <h3 className="text-28 font-bold">COMPLIANCE</h3>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-6 bg-black p-2 text-white hover:bg-gray-300"
              >
                <Broom width={20} height={17} weight="duotone" />
              </button>
            </div>

            <InputX
              title="Documento"
              placeholder="CPF ou CNPJ"
              value={documento}
              onChange={handleDocumentChange}
              required
            />

            <div className="flex flex-col gap-2">
              <Button disabled={isPending || Object.keys(errors).length > 0}>Checar</Button>

              <Button type="button" disabled={!responseData} onClick={() => setOpenEditModal(true)}>
                Abrir compliance
              </Button>
            </div>
          </FormX>
        </div>
      </FormProvider>

      <ComplianceEditModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        data={responseData}
        onSaved={setResponseData}
      />
    </CardContainer>
  );
};
