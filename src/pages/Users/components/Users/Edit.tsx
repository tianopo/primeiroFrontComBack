import { Trash } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { Checkbox } from "src/components/Form/Checkbox";
import { FormX } from "src/components/Form/FormX";
import { Select } from "src/components/Form/Select/Select";
import { IconX } from "src/components/Icons/IconX";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { responseError } from "src/config/responseErrors";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import { useCompliance } from "../../hooks/Compliance/useCompliance";
import { useSyncDeskdata } from "../../hooks/Compliance/useSyncDeskdata";
import { useDelUser } from "../../hooks/User/useDelUser";
import { IUpdateUserPayload, useUpdateUser } from "../../hooks/User/useUpdateUser";
import { DeskdataDataset } from "../../utils/deskdata.types";
import { BankEditModal } from "../Bank/BankEditModal";
import { ComplianceEditModal } from "../Compliance/ComplianceEditModal";
import { DeskdataSelector } from "../Compliance/DeskdataSelector";
import { UserSecurityModal } from "../Security/UserSecurityModal";
import { AccountSearchInput } from "./AccountSearchInput";

interface IEdit {
  setForm: Dispatch<SetStateAction<boolean>>;
}

export const Edit = ({ setForm }: IEdit) => {
  const [id, setId] = useState<string>("");
  const [documento, setDocumento] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [apelido, setApelido] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [complianceData, setComplianceData] = useState<any>(null);

  const [openBankModal, setOpenBankModal] = useState(false);
  const [openSecurityModal, setOpenSecurityModal] = useState(false);

  const queryClient = useQueryClient();
  const { mutate, isPending, context } = useUpdateUser();
  const { mutate: fetchCompliance, isPending: isLoadingCompliance } = useCompliance();

  const {
    formState: { errors },
    setValue,
  } = context;

  const { mutate: deletar } = useDelUser(id);
  // deskdata
  const [deskdataEnabled, setDeskdataEnabled] = useState(false);
  const [deskdataDatasets, setDeskdataDatasets] = useState<DeskdataDataset[]>([]);
  const [deskdataOwnerDatasets, setDeskdataOwnerDatasets] = useState<DeskdataDataset[]>([]);

  const { mutateAsync: syncDeskdata, isPending: isSyncingDeskdata } = useSyncDeskdata();

  const canUseDeskdata = Boolean(nome && apelido && exchange && documento);

  const handleNomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNome(e.target.value);
    setValue("nome", e.target.value);
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
    const value = formatCPFOrCNPJ(e.target.value);
    setDocumento(value);
    setValue("documento", value);
  };

  const handleBlockChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsBlocked(checked);
    setValue("bloqueado", checked);
  };

  const updateUserFields = (selectedUser: any) => {
    setId(selectedUser.id);
    setNome(selectedUser.User.name);
    setApelido(selectedUser.counterparty);
    setExchange(selectedUser.exchange);
    setDocumento(selectedUser.User.document);
    setIsBlocked(selectedUser.User.blocked);

    setValue("nome", selectedUser.User.name);
    setValue("apelido", selectedUser.counterparty);
    setValue("exchange", selectedUser.exchange);
    setValue("documento", selectedUser.User.document);
    setValue("bloqueado", selectedUser.User.blocked);
  };

  const handleSubmit = (formData: IUpdateUserPayload) => {
    if (!id) {
      responseError("Selecione um usuário antes de salvar.");
      return;
    }

    mutate(
      { id, payload: formData },
      {
        onSuccess: async () => {
          void queryClient.invalidateQueries({ queryKey: ["users-data"] });
          if (deskdataEnabled && deskdataDatasets.length > 0 && documento) {
            await syncDeskdata({
              documento,
              datasets: deskdataDatasets,
              ownerDatasets: deskdataOwnerDatasets,
            });
          }
        },
      },
    );
  };

  const handleOpenCompliance = () => {
    if (!documento) {
      responseError("Selecione um usuário com documento antes de abrir o compliance.");
      return;
    }

    fetchCompliance(
      { documento },
      {
        onSuccess: (result) => {
          setComplianceData(result);
          setOpenEditModal(true);
          void queryClient.invalidateQueries({ queryKey: ["users-data"] });
        },
      },
    );
  };

  const handleDelete = () => setIsConfirming(!isConfirming);

  const handleConfirmDelete = () => {
    deletar(undefined, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["users-data"] });
        setIsConfirming(false);
        setValue("apelido", "");
        setApelido("");
        setValue("nome", "");
        setNome("");
        setValue("documento", "");
        setDocumento("");
        setValue("exchange", "");
        setExchange("");
        setIsBlocked(false);
        setValue("bloqueado", false);
        setComplianceData(null);
        setId("");
      },
    });
  };

  return (
    <CardContainer>
      <FormProvider {...context}>
        <FormX
          onSubmit={handleSubmit}
          className="flex h-fit w-full flex-col flex-wrap justify-between gap-2 md:flex-row"
        >
          <button
            type="button"
            onClick={() => setForm(true)}
            className="hover:cursor-pointer hover:underline"
          >
            <h3 className="text-28 font-bold">ATUALIZE O USUÁRIO</h3>
          </button>

          {id && apelido && nome && (
            <IconX
              name="Excluir"
              icon={
                <Trash
                  className="cursor-pointer rounded-6 text-variation-error hover:bg-secundary hover:text-write-primary"
                  width={19.45}
                  height={20}
                  weight="regular"
                  onClick={handleDelete}
                />
              }
            />
          )}

          <AccountSearchInput
            title="Apelido"
            field="apelido"
            placeholder="User9855-54d4df"
            value={apelido}
            onChange={handleApelidoChange}
            onPick={updateUserFields}
            required
          />

          <AccountSearchInput
            title="Nome"
            field="nome"
            placeholder="Fulano Ciclano"
            value={nome}
            onChange={handleNomeChange}
            onPick={updateUserFields}
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

          <AccountSearchInput
            title="Documento"
            field="documento"
            placeholder="CPF/CNPJ"
            value={documento}
            onChange={handleDocumentoChange}
            onPick={updateUserFields}
            required
          />

          <Checkbox title="Bloqueado" checked={isBlocked} onChange={handleBlockChange} />

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
            <Button disabled={isPending || isSyncingDeskdata || Object.keys(errors).length > 0}>
              Salvar
            </Button>

            {apelido && nome && exchange && documento && (
              <>
                <Button
                  type="button"
                  disabled={isSyncingDeskdata || isLoadingCompliance}
                  onClick={handleOpenCompliance}
                >
                  {isLoadingCompliance
                    ? "Carregando compliance..."
                    : isSyncingDeskdata
                      ? "Salvando compliance ..."
                      : "Compliance"}
                </Button>
                <Button type="button" onClick={() => setOpenSecurityModal(true)}>
                  Security
                </Button>
                <Button type="button" onClick={() => setOpenBankModal(true)}>
                  Bank
                </Button>
              </>
            )}
          </div>
        </FormX>
      </FormProvider>

      <ComplianceEditModal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        data={complianceData}
        onSaved={setComplianceData}
      />

      <UserSecurityModal
        open={openSecurityModal}
        onClose={() => setOpenSecurityModal(false)}
        userId={id}
        userLabel={`${nome} - ${apelido}`}
      />

      <BankEditModal
        open={openBankModal}
        onClose={() => setOpenBankModal(false)}
        userId={id}
        userName={nome}
        userDocument={documento}
        userLabel={`${nome} - ${apelido}`}
      />

      {isConfirming && (
        <ConfirmationModalButton
          text="Você tem certeza que deseja excluir este dado ?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </CardContainer>
  );
};
