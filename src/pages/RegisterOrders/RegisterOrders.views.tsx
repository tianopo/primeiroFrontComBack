import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCurrency, formatDateTime } from "src/utils/formats";
import { assetsOptions, exchangeOptions } from "src/utils/selectsOptions";
import { HandleListEdit } from "./components/HandleListEdit";
import { UploadXLSButton } from "./components/UploadXLSButton";
import { useListUsers } from "./hooks/useListUsers";
import { IOrder, useOrders } from "./hooks/useOrders";
import "./registerOrders.css";
import { extractApelidosFromError } from "./Utils/extractApelidosFromError";

export const RegisterOrders = () => {
  const { mutate, isPending, context } = useOrders();
  const { data } = useListUsers();
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

  const [view, setView] = useState<"manual" | "automatic">("automatic");
  const toggleView = (selectedView: "manual" | "automatic") => setView(selectedView);

  const handleTipoChange = (e: { target: { value: string } }) => {
    setTipo(e.target.value);
  };

  const onSubmit = (data: IOrder) => {
    const newData = {
      ...data,
      tipo: tipo,
    };

    setFormData((prevData) => [...prevData, newData]);

    reset();
  };

  const handleSave = async () => {
    const values = getValues();
    const updatedValues: any = {
      ...values,
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

  const handleSend = async () => {
    mutate(formData, {
      onSuccess: () => {
        setApelidosNaoEncontrados(new Set());
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          (typeof err === "string" ? err : JSON.stringify(err));
        const notFound = extractApelidosFromError(msg);
        if (notFound.size > 0) setApelidosNaoEncontrados(notFound);
        else toast.error("Erro ao enviar ordens.");
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
    setNome(item.nome);
    setValue("nome", item.nome);
    setApelido(item.apelido);
    setValue("apelido", item.apelido);
    setQuantidade(item.quantidade);
    setValue("quantidade", item.quantidade);
    setValor(item.valor);
    setValue("valor", item.valor);
    setValorToken(item.valorToken);
    setValue("valorToken", item.valorToken);
    setTaxa(item.taxa);
    setValue("taxa", item.taxa);

    handleDelete(numeroOrdem);
  };

  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatDateTime(e.target.value);
    setDataHora(formattedDate);
  };

  const handleNomeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setNome(nome);

    if (nome.trim() === "") return;

    const userEncontrado = data?.find(
      (user: { name: string; counterparty: string }) => user?.name === nome,
    );

    if (userEncontrado) {
      setApelido(userEncontrado.counterparty);
      context.setValue("apelido", userEncontrado.counterparty);
    } else return;
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
        <div className="mb-4 flex gap-4">
          <Button
            onClick={() => toggleView("automatic")}
            className={`rounded-6 px-4 py-2 ${view === "automatic" ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            Registro Automático
          </Button>
          <Button
            onClick={() => toggleView("manual")}
            className={`rounded-6 px-4 py-2 ${view === "manual" ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            Registro Manual
          </Button>
        </div>
        {view === "automatic" && <UploadXLSButton setFormData={setFormData} formData={formData} />}
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
                  <InputX
                    title="Nome"
                    placeholder="Fulano Ciclano Banano"
                    value={nome || ""}
                    onChange={handleNomeChange}
                    busca
                    options={data
                      ?.filter((item: any) =>
                        (item?.User?.name || "").toLowerCase().includes((nome || "").toLowerCase()),
                      )
                      .map((item: any) => item?.User?.name)}
                  />
                  <InputX
                    title="Apelido"
                    placeholder="User9079vYwmKU"
                    value={apelido || ""}
                    onChange={(e) => setApelido(e.target.value)}
                    busca
                    options={data
                      ?.filter((item: any) =>
                        (item.counterparty || "")
                          .toLowerCase()
                          .includes((apelido || "").toLowerCase()),
                      )
                      .map((item: any) => item.counterparty)}
                    required
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
        />
      )}
    </FlexCol>
  );
};
