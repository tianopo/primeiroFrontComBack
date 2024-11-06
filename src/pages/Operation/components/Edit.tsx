import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Button } from "src/components/Buttons/Button";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCPFOrCNPJ } from "src/utils/formats";
import { exchangeOptions } from "src/utils/selectsOptions";
import { useListUsers } from "../hooks/useListUsers";
import { useOperationEdit } from "../hooks/useOperationEdit";

interface IRegister {
  setForm: Dispatch<SetStateAction<boolean>>;
}

export const Edit = ({ setForm }: IRegister) => {
  const [documento, setDocumento] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [apelido, setApelido] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [isBlocked, setIsBlocked] = useState<boolean>(false); // Estado para o checkbox
  const { data } = useListUsers();
  const { mutate, isPending, context } = useOperationEdit();
  const {
    formState: { errors },
    setValue,
  } = context;

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

  useEffect(() => {
    if (data && apelido) {
      const selectedUser = data.find((user: any) => user.counterparty === apelido);
      if (selectedUser) {
        const userName = selectedUser.name;

        // Checa se o nome do usuário contém "Bloqueado" e ajusta o checkbox
        const isUserBlocked = userName.includes("Bloqueado");
        setIsBlocked(isUserBlocked);

        const updatedName = isUserBlocked ? userName : userName.replace(" Bloqueado", "");

        setNome(updatedName);
        setExchange(selectedUser.exchange);
        setDocumento(selectedUser.documento);

        setValue("nome", updatedName);
        setValue("exchange", selectedUser.exchange);
        setValue("documento", selectedUser.document);
      }
    }
  }, [apelido, data, setValue]);

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <CardContainer>
      <FormProvider {...context}>
        <FormX
          onSubmit={handleSubmit}
          className="flex h-fit w-full flex-col flex-wrap justify-between gap-2 md:flex-row"
        >
          <button onClick={() => setForm(true)} className="hover:cursor-pointer hover:underline">
            <h2>EDIT USER</h2>
          </button>
          <InputX
            title="Nome"
            placeholder="Fulano Ciclano"
            value={nome}
            onChange={handleNomeChange}
            required
          />
          <InputX
            title="Apelido"
            placeholder="User9855-54d4df"
            value={apelido}
            onChange={handleApelidoChange}
            busca
            options={data
              ?.filter((data: any) => data?.counterparty.includes(apelido))
              .map((data: any) => data?.counterparty)}
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
            required
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isBlocked} onChange={handleBlockChange} />
            <span>Bloquear Usuário</span>
          </label>

          <Button disabled={isPending || Object.keys(errors).length > 0}>Salvar</Button>
        </FormX>
      </FormProvider>
    </CardContainer>
  );
};
