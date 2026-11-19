import axios from "axios";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { Modal } from "src/components/Modal/Modal";
import { responseError } from "src/config/responseErrors";
import { formatCurrency, formatDateTime } from "src/utils/formats";
import { assetsOptions, exchangeOptions } from "src/utils/selectsOptions";
import { Register } from "../Users/components/Users/Register";
import { BitgetApiOrdersImport } from "./components/BitgetApiOrdersImport";
import { HandleListEdit } from "./components/HandleListEdit";
import { UploadXLSButton } from "./components/UploadXLSButton";
import { IOrder, useOrders } from "./hooks/useOrders";
import "./registerOrders.css";
import { extractApelidosFromError } from "./Utils/extractApelidosFromError";
import { useQueryClient } from "@tanstack/react-query";
import { AccountSearchInput } from "../Users/components/Users/AccountSearchInput";
import {
  extractExistingOrdersFromError,
  makeOrderKey,
} from "./Utils/extractExistingOrdersFromError";

export const RegisterOrders = () => {
  const { mutate, isPending, context } = useOrders();
  const queryClient = useQueryClient();
  const { reset, getValues, setValue } = context;

  const [tipo, setTipo] = useState<string>("");
  const [formData, setFormData] = useState<any[]>([]);

  const [numeroOrdem, setNumeroOrdem] = useState<string>("");
  const [dataHora, setDataHora] = useState<string>("");
  const [exchange, setExchange] = useState<string>("");
  const [ativo, setAtivo] = useState<string>("");
  const [nome, setNome] = useState<string>("");
  const [apelido, setApelido] = useState<string>("");
  const [quantidade, setQuantidade] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [valorToken, setValorToken] = useState<string>("");
  const [taxa, setTaxa] = useState<string>("");
  const [registerModalData, setRegisterModalData] = useState<{
    apelido: string;
    nome: string;
    exchange: string;
  } | null>(null);

  const [view, setView] = useState<"manual" | "automatic" | "api">("automatic");

  const toggleView = (selectedView: "manual" | "automatic" | "api") => setView(selectedView);

  const handleTipoChange = (e: { target: { value: string } }) => {
    setTipo(e.target.value);
  };

  const onSubmit = (data: IOrder) => {
    if (Boolean(nome.trim()) === Boolean(apelido.trim())) {
      toast.error("Preencha apenas o nome ou apenas o apelido.");
      return;
    }
    const newData = { ...data, nome: nome.trim(), apelido: apelido.trim(), tipo };
    setFormData((prevData) => [...prevData, newData]);
    reset();
    handleIdentificacaoChange("nome", "");
  };

  const handleSave = async () => {
    const values = getValues();
    const updatedValues: any = {
      ...values,
      nome: nome.trim(),
      apelido: apelido.trim(),
      tipo,
    };

    const numeroOrdemVazio = !numeroOrdem || numeroOrdem.trim() === "";
    const dataHoraVazio = !dataHora || dataHora.trim() === "";
    const exchangeVazio = !exchange || exchange.trim() === "";
    const ativoVazio = !ativo || ativo.trim() === "";
    const quantidadeVazio = !quantidade || quantidade.trim() === "";
    const valorVazio = !valor || valor.trim() === "";
    const valorTokenVazio = !valorToken || valorToken.trim() === "";
    const taxaVazio = !taxa || taxa.trim() === "";

    // Lista de validações com rótulo legível
    const camposObrigatorios = [
      { vazio: numeroOrdemVazio, nome: "Número da Ordem" },
      { vazio: dataHoraVazio, nome: "Data/Hora" },
      { vazio: exchangeVazio, nome: "Exchange" },
      { vazio: ativoVazio, nome: "Ativo" },
      { vazio: quantidadeVazio, nome: "Quantidade" },
      { vazio: valorVazio, nome: "Valor" },
      { vazio: valorTokenVazio, nome: "Valor do Token" },
      { vazio: taxaVazio, nome: "Taxa" },
    ];

    // Verifica e exibe erro para o primeiro campo vazio encontrado
    for (const campo of camposObrigatorios) {
      if (campo.vazio) {
        toast.error(`O campo "${campo.nome}" está vazio.`);
        return;
      }
    }
    // Validação específica entre nome e apelido
    const nomeVazio = !nome || nome.trim() === "";
    const apelidoVazio = !apelido || apelido.trim() === "";

    if (nomeVazio && apelidoVazio) {
      toast.error("Preencha pelo menos o nome ou o apelido.");
      return;
    }

    if (!nomeVazio && !apelidoVazio) {
      toast.error("Preencha apenas o nome ou apenas o apelido, não ambos.");
      return;
    }

    const nOrdem = updatedValues.numeroOrdem;
    const isDuplicate = formData.some((order) => order.numeroOrdem === nOrdem);

    if (isDuplicate) {
      toast.error(`Já existe uma ordem com o número ${nOrdem}.`);
      return; // Cancela o salvamento
    }

    if (tipo.length > 0) {
      setFormData((prevData) => [...prevData, updatedValues]);
      toast.success("Ordem Adicionada");
    } else {
      toast.error("Não há ordem adicionada");
    }
  };

  const [apelidosNaoEncontrados, setApelidosNaoEncontrados] = useState<Set<string>>(new Set());
  const [ordensJaCadastradas, setOrdensJaCadastradas] = useState<Set<string>>(new Set());

  const openRegisterUserModalFromOrder = (order: any) => {
    setRegisterModalData({
      apelido: String(order?.apelido ?? "").trim(),
      nome: String(order?.nome ?? "").trim(),
      exchange: String(order?.exchange ?? "").trim(),
    });
  };

  const normalizeSearch = (value: unknown) => {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const resolveMissingUsersFromError = (message: string, orders: any[]) => {
    const detected = extractApelidosFromError(message);
    const normalizedMessage = normalizeSearch(message);

    const hasMissingUserText =
      normalizedMessage.includes("apelido") ||
      normalizedMessage.includes("usuario nao encontrado") ||
      normalizedMessage.includes("usuarios nao encontrados") ||
      normalizedMessage.includes("nao cadastrado") ||
      normalizedMessage.includes("nao encontrado");

    if (!hasMissingUserText) return detected;

    for (const order of orders) {
      const candidates = [
        order?.apelido,
        order?.nome,
        order?.counterparty,
        order?.User?.counterparty,
        order?.User?.name,
      ]
        .map((item) => String(item ?? "").trim())
        .filter(Boolean);

      for (const candidate of candidates) {
        if (normalizedMessage.includes(normalizeSearch(candidate))) {
          detected.add(candidate);
        }
      }
    }

    return detected;
  };

  const handleSend = () => {
    setApelidosNaoEncontrados(new Set());
    setOrdensJaCadastradas(new Set());

    mutate(formData, {
      onSuccess: () => {
        setApelidosNaoEncontrados(new Set());
        setOrdensJaCadastradas(new Set());
      },

      onError: (error: any) => {
        responseError(error);

        const message =
          typeof error === "string"
            ? error
            : axios.isAxiosError(error)
              ? String(
                  error.response?.data?.message ?? error.response?.data?.error ?? error.message,
                )
              : error instanceof Error
                ? error.message
                : "";

        const alreadyRegistered = extractExistingOrdersFromError(message);
        const notFoundNicknames = resolveMissingUsersFromError(message, formData);

        setOrdensJaCadastradas(alreadyRegistered);
        setApelidosNaoEncontrados(notFoundNicknames);
      },
    });
  };

  const handleDelete = (numeroOrdem: string) => {
    const itemToDelete = formData.find((item) => item.numeroOrdem === numeroOrdem);

    if (!itemToDelete) {
      toast.error("Item não encontrado para exclusão.");
      return;
    }

    setFormData((prevData) => prevData.filter((item) => !(item.numeroOrdem === numeroOrdem)));
  };

  const ordensDuplicadasNaLista = formData.filter((order) =>
    ordensJaCadastradas.has(makeOrderKey(order.numeroOrdem, order.exchange)),
  );

  const handleDeleteExistingOrders = () => {
    const quantidade = ordensDuplicadasNaLista.length;

    if (!quantidade || isPending) return;

    setFormData((prev) =>
      prev.filter(
        (order) => !ordensJaCadastradas.has(makeOrderKey(order.numeroOrdem, order.exchange)),
      ),
    );

    setOrdensJaCadastradas(new Set());

    toast.success(
      `${quantidade} ${quantidade === 1 ? "ordem já existente removida" : "ordens já existentes removidas"} da lista.`,
    );
  };

  const handleEdit = (numeroOrdem: string) => {
    const item = formData.find((dataItem) => dataItem.numeroOrdem === numeroOrdem);

    if (!item) {
      toast.error("Item não encontrado para edição.");
      return;
    }

    reset();
    setNumeroOrdem(item.numeroOrdem);
    setValue("apelido", item.apelido);
    setTipo(item.tipo);
    setValue("apelido", item.apelido);
    setDataHora(item.dataHora);
    setValue("apelido", item.apelido);
    setExchange(item.exchange);
    setAtivo(item.ativo);
    setValue("ativo", item.ativo);
    setQuantidade(item.quantidade);
    setValue("quantidade", item.quantidade);
    setValor(item.valor);
    setValue("valor", item.valor);
    setValorToken(item.valorToken);
    setValue("valorToken", item.valorToken);
    setTaxa(item.taxa);
    setValue("taxa", item.taxa);
    const nickname = String(item.apelido ?? "").trim();
    handleIdentificacaoChange(
      nickname ? "apelido" : "nome",
      nickname || String(item.nome ?? "").trim(),
    );

    handleDelete(numeroOrdem);
  };

  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatDateTime(e.target.value);
    setDataHora(formattedDate);
  };

  const handleIdentificacaoChange = (field: "nome" | "apelido", value: string) => {
    const name = field === "nome" ? value : "";
    const nickname = field === "apelido" ? value : "";
    setNome(name);
    setApelido(nickname);
    setValue("nome", name);
    setValue("apelido", nickname);
    context.clearErrors(["nome", "apelido"]);
  };

  const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedValor: any = formatCurrency(e.target.value);
    setValor(formattedValor);
    setValue("valor", formattedValor);
  };

  return (
    <FlexCol className="w-full p-4 pb-2">
      <div className="card">
        <h1 className="text-28 font-bold">Formulário de Ordens</h1>
        <div className="mb-4 flex flex-wrap gap-4">
          <Button
            onClick={() => toggleView("automatic")}
            className={`rounded-6 px-4 py-2 ${
              view === "automatic" ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            Importar Arquivo
          </Button>

          <Button
            onClick={() => toggleView("api")}
            className={`rounded-6 px-4 py-2 ${
              view === "api" ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            Importar API
          </Button>

          <Button
            onClick={() => toggleView("manual")}
            className={`rounded-6 px-4 py-2 ${
              view === "manual" ? "bg-primary text-white" : "bg-gray-200"
            }`}
          >
            Registro Manual
          </Button>
        </div>
        {view === "automatic" && <UploadXLSButton setFormData={setFormData} formData={formData} />}

        {view === "api" && <BitgetApiOrdersImport formData={formData} setFormData={setFormData} />}

        {view === "manual" && (
          <>
            <div className="mb-4">
              <Select
                title="Tipo"
                options={["compras", "vendas"]}
                placeholder="compras"
                value={tipo}
                onChange={handleTipoChange}
              />
            </div>
            <FormProvider {...context}>
              <FormX
                onSubmit={onSubmit}
                className="flex flex-col flex-wrap justify-between gap-2 md:flex-row"
              >
                <div className="flex w-full flex-col flex-wrap gap-2 md:w-5/12 md:flex-row">
                  <InputX
                    title="Número Ordem"
                    placeholder="Número da Ordem"
                    value={numeroOrdem}
                    onChange={(e) => setNumeroOrdem(e.target.value)}
                    required
                  />
                  <InputX
                    title="Data Hora"
                    placeholder="AAAA-MM-DD HH:MM:SS"
                    value={dataHora}
                    onChange={handleDateTimeChange}
                    required
                  />
                  <Select
                    title="Exchange"
                    placeholder="Bybit https://www.bybit.com/ SG"
                    options={exchangeOptions}
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    required
                  />
                  <Select
                    title="Ativo"
                    placeholder="USDT"
                    options={assetsOptions}
                    value={ativo}
                    onChange={(e) => setAtivo(e.target.value)}
                    required
                  />
                </div>
                <div className={"flex w-full flex-col flex-wrap gap-2 md:w-5/12 md:flex-row"}>
                  <AccountSearchInput
                    title="Nome"
                    field="nome"
                    placeholder="Fulano Ciclano Banano"
                    value={nome || ""}
                    onChange={(e) => handleIdentificacaoChange("nome", e.target.value)}
                    onPick={(account) => handleIdentificacaoChange("nome", account.User.name)}
                    required={!apelido.trim()}
                  />
                  <AccountSearchInput
                    title="Apelido"
                    field="apelido"
                    placeholder="User9079vYwmKU"
                    value={apelido || ""}
                    onChange={(e) => handleIdentificacaoChange("apelido", e.target.value)}
                    onPick={(account) => handleIdentificacaoChange("apelido", account.counterparty)}
                    required={!nome.trim()}
                  />
                  <InputX
                    title="Quantidade"
                    placeholder="50"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                  />
                  <InputX
                    title="Valor"
                    placeholder="R$ 500,00"
                    value={valor}
                    onChange={handleValorChange}
                    required
                  />
                  <InputX
                    title="Valor Token"
                    placeholder="5.80"
                    value={valorToken}
                    onChange={(e) => setValorToken(e.target.value)}
                    required
                  />
                </div>
                <InputX
                  title="Taxa"
                  placeholder="0"
                  value={taxa}
                  onChange={(e) => setTaxa(e.target.value)}
                  required
                />
              </FormX>
            </FormProvider>
          </>
        )}
        <div className="flex w-full flex-col gap-2 pt-2">
          {view === "manual" && (
            <Button onClick={handleSave} disabled={isPending}>
              Salvar
            </Button>
          )}
          {ordensDuplicadasNaLista.length > 0 && (
            <Button
              onClick={handleDeleteExistingOrders}
              disabled={isPending}
              className="rounded-6 bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Excluir {ordensDuplicadasNaLista.length}{" "}
              {ordensDuplicadasNaLista.length === 1 ? "ordem já existente" : "ordens já existentes"}
            </Button>
          )}
          <Button onClick={handleSend} disabled={isPending || formData.length === 0}>
            Enviar
          </Button>
        </div>
      </div>
      {formData.length > 0 && (
        <HandleListEdit
          formData={formData}
          handleEdit={handleEdit}
          notFoundNicknames={apelidosNaoEncontrados}
          existingOrders={ordensJaCadastradas}
          onOpenRegisterUser={openRegisterUserModalFromOrder}
        />
      )}
      {registerModalData && (
        <Modal onClose={() => setRegisterModalData(null)} fit={false}>
          <Register
            setForm={(() => undefined) as Dispatch<SetStateAction<boolean>>}
            initialData={registerModalData}
            onSuccessRegistered={() => {
              void queryClient.invalidateQueries({ queryKey: ["users-data"] });
              setRegisterModalData(null);
            }}
          />
        </Modal>
      )}
    </FlexCol>
  );
};
