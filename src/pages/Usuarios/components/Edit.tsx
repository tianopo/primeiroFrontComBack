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
import { formatCPFOrCNPJ } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import { useDelUser } from "../hooks/useDelUser";
import { useListUsers } from "../hooks/useListUsers";
import { useUpdateUser } from "../hooks/useUpdateUser";

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
    const updatedName = isBlocked
      ? `${e.target.value.replace(" Bloqueado", "")} Bloqueado`
      : e.target.value;
    setValue("nome", updatedName);
    setNome(updatedName);
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
    const userName = selectedUser.name;

    const isUserBlocked = userName.includes("Bloqueado");
    setIsBlocked(isUserBlocked);

    const updatedName = isUserBlocked ? userName : userName.replace(" Bloqueado", "");

    setId(selectedUser.id);
    setNome(updatedName);
    setApelido(selectedUser.counterparty);
    setExchange(selectedUser.exchange);
    setDocumento(selectedUser.document);
    setIsBlocked(selectedUser.blocked);

    setValue("nome", updatedName);
    setValue("apelido", selectedUser.counterparty);
    setValue("exchange", selectedUser.exchange);
    setValue("documento", selectedUser.document);
    setValue("bloqueado", selectedUser.blocked);
  };

  useEffect(() => {
    if (data && apelido) {
      const selectedUser = data.find((user: any) => user.counterparty === apelido);
      if (selectedUser) updateUserFields(selectedUser);
    }
  }, [apelido, data, setValue]);

  useEffect(() => {
    if (data && nome) {
      const selectedUser = data.find((user: any) => user.name === nome);
      if (selectedUser) updateUserFields(selectedUser);
    }
  }, [nome, data, setValue]);

  useEffect(() => {
    if (data && documento) {
      const selectedUser = data.find((user: any) => user.document === documento);
      if (selectedUser) updateUserFields(selectedUser);
    }
  }, [documento, data, setValue]);

  const handleSubmit = (data: any) => {
    mutate(data);
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
            options={data
              ?.filter((user: any) => user?.name && user.name.includes(nome))
              .map((user: any) => user?.name)}
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
            options={data
              ?.filter((user: any) => user?.document && user.document.includes(documento))
              .map((user: any) => user?.document)}
            required
          />
          <Checkbox title="Bloqueado" checked={isBlocked} onChange={handleBlockChange} />
          <Button disabled={isPending || Object.keys(errors).length > 0}>Salvar</Button>
        </FormX>
      </FormProvider>
      {isConfirming && (
        <ConfirmationDelete
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </CardContainer>
  );
};
