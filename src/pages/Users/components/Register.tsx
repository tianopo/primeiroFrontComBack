import { Broom } from "@phosphor-icons/react";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { CardContainer } from "src/components/Layout/CardContainer";
import { responseSuccess } from "src/config/responseErrors";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import { useCompliance } from "../hooks/Compliance/useCompliance";
import { useSyncDeskdata } from "../hooks/Compliance/useSyncDeskdata";
import { IRegisterUser, useRegisterUser } from "../hooks/User/useRegisterUser";
import { ComplianceProfileResponse } from "../utils/complianceProfileTypes";
import { DeskdataDataset } from "../utils/deskdata.types";
import { ComplianceEditModal } from "./Compliance/ComplianceEditModal";
import { DeskdataSelector } from "./Compliance/DeskdataSelector";

interface IRegister {
  setForm: Dispatch<SetStateAction<boolean>>;
  initialData: {
    apelido: string;
    nome: string;
    exchange: string;
  };
}

export const Register = ({ setForm, initialData }: IRegister) => {
  const [documento, setDocumento] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [apelido, setApelido] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const { mutate, isPending, context } = useRegisterUser();
  const {
    formState: { errors },
    setValue,
    reset,
  } = context;
  const [responseData, setResponseData] = useState<ComplianceProfileResponse | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  // deskdata
  const [deskdataEnabled, setDeskdataEnabled] = useState(false);
  const [deskdataDatasets, setDeskdataDatasets] = useState<DeskdataDataset[]>([]);
  const [deskdataOwnerDatasets, setDeskdataOwnerDatasets] = useState<DeskdataDataset[]>([]);

  const { mutateAsync: syncDeskdata, isPending: isSyncingDeskdata } = useSyncDeskdata();
  const { mutateAsync: fetchCompliance, isPending: isLoadingCompliance } = useCompliance();

  const canUseDeskdata = Boolean(nome && apelido && exchange && documento);

  useEffect(() => {
    if (initialData) {
      setApelido(initialData.apelido || "");
      setNome(initialData.nome || "");
      setExchange(initialData.exchange || "");

      setValue("apelido", initialData.apelido || "");
      setValue("nome", initialData.nome || "");
      setValue("exchange", initialData.exchange || "");
    }
  }, [initialData]);

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

  const handleSubmit = (formData: IRegisterUser) => {
    const submittedDocument = String(formData?.documento ?? documento ?? "").trim();

    mutate(formData, {
      onSuccess: async () => {
        if (!submittedDocument) {
          responseSuccess("Usuário cadastrado");
          return;
        }

        if (deskdataEnabled && deskdataDatasets.length > 0) {
          await syncDeskdata({
            documento: submittedDocument,
            datasets: deskdataDatasets,
            ownerDatasets: deskdataOwnerDatasets,
          });
        }

        const compliance = await fetchCompliance({
          documento: submittedDocument,
        });

        setResponseData(compliance);

        if (nome && apelido) {
          responseSuccess(`${nome} / ${submittedDocument} foi cadastrado`);
        } else {
          responseSuccess("Usuário encontrado");
        }

        setValue("apelido", "");
        setApelido("");
        setValue("nome", "");
        setNome("");
        setValue("documento", "");
        setDocumento("");

        setDeskdataEnabled(false);
        setDeskdataDatasets([]);
        setDeskdataOwnerDatasets([]);
      },
    });
  };

  const handleClear = () => {
    setDocumento("");
    setNome("");
    setApelido("");
    setResponseData(null);
    reset();
  };

  return (
    <CardContainer>
      <FormProvider {...context}>
        <FormX
          onSubmit={handleSubmit}
          className="flex h-fit w-full flex-col flex-wrap justify-between gap-2 md:flex-row"
        >
          <div className="flex w-full items-center justify-between">
            <button onClick={() => setForm(false)} className="hover:cursor-pointer hover:underline">
              <h3 className="text-28 font-bold">CADASTRE O USUÁRIO</h3>
            </button>
            <button
              onClick={handleClear}
              className="rounded-6 bg-black p-2 text-white hover:bg-gray-300"
            >
              <Broom width={20} height={17} weight="duotone" />
            </button>
          </div>
          <InputX
            title="Apelido"
            placeholder="User9855-54d4df"
            value={apelido}
            onChange={handleApelidoChange}
            required
          />
          {apelido && (
            <InputX
              title="Nome"
              placeholder="Fulano Ciclano"
              value={nome}
              onChange={handleNomeChange}
              required
            />
          )}
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
          <DeskdataSelector
            documento={documento}
            canShow={canUseDeskdata}
            enabled={deskdataEnabled}
            selectedDatasets={deskdataDatasets}
            ownerDatasets={deskdataOwnerDatasets}
            onEnabledChange={setDeskdataEnabled}
            onSelectedDatasetsChange={setDeskdataDatasets}
            onOwnerDatasetsChange={setDeskdataOwnerDatasets}
          />
          <div className="flex w-full flex-col gap-2">
            <Button
              disabled={
                apelido.length === 0 ||
                exchange.length === 0 ||
                isPending ||
                isLoadingCompliance ||
                Object.keys(errors).length > 0
              }
            >
              {isPending || isLoadingCompliance
                ? "Salvando..."
                : nome.length > 0
                  ? "Salvar"
                  : "Procurar"}
            </Button>
            {responseData && (
              <Button
                type="button"
                disabled={!responseData || isSyncingDeskdata || isLoadingCompliance}
                onClick={() => setOpenEditModal(true)}
              >
                {isSyncingDeskdata || isLoadingCompliance
                  ? "Carregando compliance..."
                  : "Compliance"}
              </Button>
            )}
          </div>
        </FormX>
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
