import { Trash } from "@phosphor-icons/react";
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { Checkbox } from "src/components/Form/Checkbox";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { IconX } from "src/components/Icons/IconX";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationDelete } from "src/components/Modal/ConfirmationDelete";
import { responseError } from "src/config/responseErrors";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import { useDelUser } from "../hooks/useDelUser";
import { useListUsers } from "../hooks/useListUsers";
import { IUpdateUserPayload, useUpdateUser } from "../hooks/useUpdateUser";

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
  const { data } = useListUsers();
  const { mutate, isPending, context } = useUpdateUser();
  const {
    formState: { errors },
    setValue,
  } = context;
  const { mutate: deletar } = useDelUser(id);
  const handleNomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fullValue = e.target.value;
    const [rawName, rawExchange] = fullValue.split(" - ");

    const updatedName = isBlocked
      ? `${rawName?.trim().replace(" Bloqueado", "")} Bloqueado`
      : rawName?.trim();

    setNome(updatedName);
    setExchange(rawExchange?.trim());

    setValue("nome", updatedName);
    setValue("exchange", rawExchange?.trim());
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
    const fullValue = e.target.value;
    const [rawDocument, rawExchange] = fullValue.split(" - ");
    const formattedDocumento = formatCPFOrCNPJ(rawDocument?.trim());

    setDocumento(formattedDocumento);
    setExchange(rawExchange?.trim()); // <-- salva a exchange também

    setValue("documento", formattedDocumento);
    setValue("exchange", rawExchange?.trim());
  };

  const handleBlockChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsBlocked(checked);

    const updatedName = checked
      ? `${nome.replace(" Bloqueado", "")} Bloqueado`
      : nome.replace(" Bloqueado", "");

    setValue("nome", updatedName);
    setNome(updatedName);
  };

  const updateUserFields = (selectedUser: any) => {
    const userName = selectedUser.user.name;

    const isUserBlocked = userName.includes("Bloqueado");
    setIsBlocked(isUserBlocked);

    const updatedName = isUserBlocked ? userName : userName.replace(" Bloqueado", "");

    setId(selectedUser.id);
    setNome(updatedName);
    setApelido(selectedUser.counterparty);
    setExchange(selectedUser.exchange);
    setDocumento(selectedUser.user.document);
    setIsBlocked(selectedUser.blocked);

    setValue("nome", updatedName);
    setValue("apelido", selectedUser.counterparty);
    setValue("exchange", selectedUser.exchange);
    setValue("documento", selectedUser.user.document);
    setValue("bloqueado", selectedUser.blocked);
  };

  useEffect(() => {
    if (data && apelido) {
      const selectedUser = data.find((user: any) => user.counterparty === apelido);
      if (selectedUser) updateUserFields(selectedUser);
    }
  }, [apelido, data, setValue]);

  useEffect(() => {
    if (data && nome && exchange) {
      const selectedUser = data.find(
        (user: any) =>
          user.user.name.replace(" Bloqueado", "") === nome &&
          user.exchange.split(" ")[0] === exchange.split(" ")[0],
      );

      if (selectedUser) updateUserFields(selectedUser);
    }
  }, [nome, exchange, data, setValue]);

  useEffect(() => {
    if (data && documento && exchange) {
      const selectedUser = data.find(
        (user: any) =>
          user.user.document === documento &&
          user.exchange.split(" ")[0] === exchange.split(" ")[0],
      );

      if (selectedUser) updateUserFields(selectedUser);
    }
  }, [documento, exchange, data, setValue]);

  const handleSubmit = (formData: IUpdateUserPayload) => {
    if (!id) {
      responseError("Selecione um usuário antes de salvar.");
      return;
    }

    mutate({ id, payload: formData });
  };

  const handleDelete = () => setIsConfirming(!isConfirming);
  const handleConfirmDelete = () => {
    deletar(data, {
      onSuccess: () => {
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
          <button onClick={() => setForm(true)} className="hover:cursor-pointer hover:underline">
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
          <InputX
            title="Apelido"
            placeholder="User9855-54d4df"
            value={apelido}
            onChange={handleApelidoChange}
            busca
            options={data
              ?.filter((user: any) => user?.counterparty && user.counterparty.includes(apelido))
              .map((user: any) => user?.counterparty)}
            required
          />
          <InputX
            title="Nome"
            placeholder="Fulano Ciclano"
            value={nome}
            onChange={handleNomeChange}
            busca
            options={Array.from(
              new Set(
                data?.map((user: any) => `${user?.user.name} - ${user?.exchange.split(" ")[0]}`) ||
                  [],
              ),
            )}
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
            busca
            options={Array.from(
              new Set(
                data?.map(
                  (user: any) => `${user?.user.document} - ${user?.exchange.split(" ")[0]}`,
                ) || [],
              ),
            )}
            required
          />
          <Checkbox title="Bloqueado" checked={isBlocked} onChange={handleBlockChange} />
          <Button disabled={isPending || Object.keys(errors).length > 0}>Salvar</Button>
        </FormX>
      </FormProvider>
      {isConfirming && (
        <ConfirmationDelete
          text="Você tem certeza que deseja excluir este dado ?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </CardContainer>
  );
};
