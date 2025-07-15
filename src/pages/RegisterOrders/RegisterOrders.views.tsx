import { ChangeEvent, useState } from "react";
import { FieldErrors, FormProvider, UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { formatCPFOrCNPJ, formatCurrency, formatDateTime } from "src/utils/formats";
import { assetsOptions, exchangeOptions } from "src/utils/selectsOptions";
import { HandleListEdit } from "./components/HandleListEdit";
import { UploadXLSButton } from "./components/UploadXLSButton";
import { useListBuyers } from "./hooks/useListBuyers";
import { ICompra, ITransactionData, IVenda, useTransaction } from "./hooks/useTransactions";
import "./registerOrders.css";

export const RegisterOrders = () => {
  const { mutate, isPending, context, contextCompra, contextVenda } = useTransaction();
  const { data } = useListBuyers();
  const { reset, getValues } = context;

  const [vendas, setVendas] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [tipoTransacao, setTipoTransacao] = useState<string>("");
  const [formData, setFormData] = useState<any[]>([]);

  const [numeroOrdem, setNumeroOrdem] = useState<string>("");
  const [dataHoraTransacao, setDataHoraTransacao] = useState<string>("");
  const [exchangeUtilizada, setExchangeUtilizada] = useState<string>("");
  const [ativoDigital, setAtivoDigital] = useState<string>("");
  const [nomeVendedor, setNomeVendedor] = useState<string>("");
  const [nomeComprador, setNomeComprador] = useState<string>("");
  const [apelidoVendedor, setApelidoVendedor] = useState<string>("");
  const [apelidoComprador, setApelidoComprador] = useState<string>("");
  const [quantidadeComprada, setQuantidadeComprada] = useState<string>("");
  const [quantidadeVendida, setQuantidadeVendida] = useState<string>("");
  const [valorCompra, setValorCompra] = useState<string>("");
  const [valorVenda, setValorVenda] = useState<string>("");
  const [valorTokenDataCompra, setValorTokenDataCompra] = useState<string>("");
  const [valorTokenDataVenda, setValorTokenDataVenda] = useState<string>("");
  const [taxaTransacao, setTaxaTransacao] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);

  const handleTipoTransacaoChange = (e: { target: { value: string } }) => {
    reset();
    setTipoTransacao(e.target.value);
  };

  const onSubmit = (data: ITransactionData) => {
    const newData = {
      ...data,
      tipoTransacao,
    };

    setFormData((prevData) => [...prevData, newData]);

    data.vendas.forEach((venda) => setVendas((prevVendas) => [...prevVendas, venda]));
    data.compras.forEach((compra) => setCompras((prevCompras) => [...prevCompras, compra]));

    reset();
  };

  const formatErrors = (errors: FieldErrors<any>): string => {
    return Object.values(errors)
      .map((error) => {
        if (typeof error === "object" && "message" in error) {
          return error.message;
        }
        return "Erro desconhecido";
      })
      .join(". ");
  };

  const isFormValid = async (
    tipoTransacao: string,
    values: any,
    contextVenda: UseFormReturn<IVenda>,
    contextCompra: UseFormReturn<ICompra>,
  ): Promise<boolean> => {
    let isValid = true;
    const contextTipo = tipoTransacao === "vendas" ? contextVenda : contextCompra;
    await contextTipo.reset(values);

    await contextTipo.trigger();
    const { errors } = contextTipo.formState;
    const errorMessages = formatErrors(errors);

    if (errorMessages) {
      toast.error(`Erros de ${tipoTransacao}: ${errorMessages}`);
      isValid = false;
    }

    return isValid;
  };

  const handleSave = async () => {
    const values = getValues();
    const updatedValues: any = {
      ...values,
      tipoTransacao,
      dataHoraTransacao,
      ativoDigital,
      valorCompra,
      valorVenda,
    };

    const numeroOrdem = updatedValues.numeroOrdem;
    const isDuplicate = formData.some((order) => order.numeroOrdem === numeroOrdem);

    if (isDuplicate) {
      toast.error(`Já existe uma ordem com o número ${numeroOrdem}.`);
      return; // Cancela o salvamento
    }

    if (isValid) {
      setIsValid(false);
      await isFormValid(tipoTransacao, updatedValues, contextVenda, contextCompra);
    }

    if (tipoTransacao.length > 0) {
      const isValidForm = await isFormValid(
        tipoTransacao,
        updatedValues,
        contextVenda,
        contextCompra,
      );

      if (!isValidForm) {
        return;
      }

      setFormData((prevData) => [...prevData, updatedValues]);
      if (tipoTransacao === "vendas") setVendas((prevData) => [...prevData, updatedValues]);
      if (tipoTransacao === "compras") setCompras((prevData) => [...prevData, updatedValues]);
      toast.success("Ordem Adicionada");
    } else {
      toast.error("Não há Tipo de Transação");
    }
  };

  const handleSend = async () => {
    const combinedData = {
      vendas,
      compras,
    };
    mutate(combinedData, {
      onSuccess: () => {},
    });
  };

  const handleDelete = (numeroOrdem: string) => {
    const itemToDelete = formData.find((item) => item.numeroOrdem === numeroOrdem);

    if (!itemToDelete) {
      toast.error("Item não encontrado para exclusão.");
      return;
    }

    setFormData((prevData) => prevData.filter((item) => !(item.numeroOrdem === numeroOrdem)));

    if (itemToDelete.tipoTransacao === "vendas") {
      setVendas((prevVendas) => prevVendas.filter((venda) => !(venda.numeroOrdem === numeroOrdem)));
    } else if (itemToDelete.tipoTransacao === "compras") {
      setCompras((prevCompras) =>
        prevCompras.filter((compra) => !(compra.numeroOrdem === numeroOrdem)),
      );
    }
  };

  const handleEdit = (numeroOrdem: string) => {
    const item = formData.find((dataItem) => dataItem.numeroOrdem === numeroOrdem);

    if (!item) {
      toast.error("Item não encontrado para edição.");
      return;
    }

    reset();
    setNumeroOrdem(item.numeroOrdem);
    setTipoTransacao(item.tipoTransacao);
    setDataHoraTransacao(item.dataHoraTransacao);
    setExchangeUtilizada(item.exchangeUtilizada);
    setAtivoDigital(item.ativoDigital);

    if (item.tipoTransacao === "compras") {
      setNomeVendedor(item.nomeVendedor);
      setNomeComprador("");
      setApelidoVendedor(item.apelidoVendedor);
      setApelidoComprador("");
      setQuantidadeComprada(item.quantidadeComprada);
      setQuantidadeVendida("");
      setValorCompra(item.valorCompra);
      setValorVenda("");
      setValorTokenDataCompra(item.valorTokenDataCompra);
      setValorTokenDataVenda("");
    } else if (item.tipoTransacao === "vendas") {
      setNomeVendedor("");
      setNomeComprador(item.nomeComprador);
      setApelidoVendedor("");
      setApelidoComprador(item.apelidoComprador);
      setQuantidadeComprada("");
      setQuantidadeVendida(item.quantidadeVendida);
      setValorCompra("");
      setValorVenda(item.valorVenda);
      setValorTokenDataCompra("");
      setValorTokenDataVenda(item.valorTokenDataVenda);
    }

    setTaxaTransacao(item.taxaTransacao);

    // Excluir o item baseado no número da ordem e no vendedor
    handleDelete(numeroOrdem);
  };

  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatDateTime(e.target.value);
    setDataHoraTransacao(formattedDate);
  };

  const handleNomeCompradorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setNomeComprador(nome);

    if (nome.trim() === "") return;

    const compradorEncontrado = data?.find(
      (comprador: { name: string; counterparty: string }) => comprador.name === nome,
    );

    if (compradorEncontrado) {
      setApelidoComprador(compradorEncontrado.counterparty);
      contextVenda.setValue("apelidoComprador", compradorEncontrado.counterparty);
    } else return;
  };

  const handleValorVendaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCurrency(e.target.value);
    setValorVenda(formattedCPF);
  };

  const handleValorCompraChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCurrency(e.target.value);
    setValorCompra(formattedCPF);
  };

  const [view, setView] = useState<"manual" | "automatic">("automatic");

  const toggleView = (selectedView: "manual" | "automatic") => setView(selectedView);
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
        {view === "automatic" && (
          <UploadXLSButton
            setFormData={setFormData}
            formData={formData}
            setCompras={setCompras}
            setVendas={setVendas}
          />
        )}
        {view === "manual" && (
          <>
            <div className="mb-4">
              <Select
                title="Tipo Transação"
                options={["compras", "vendas"]}
                placeholder="compras"
                value={tipoTransacao}
                onChange={handleTipoTransacaoChange}
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
                    title="Data Hora Transação"
                    placeholder="AAAA-MM-DD HH:MM:SS"
                    value={dataHoraTransacao}
                    onChange={handleDateTimeChange}
                    required
                  />
                  <Select
                    title="Exchange Utilizada"
                    placeholder="Bybit https://www.bybit.com/ SG"
                    options={exchangeOptions}
                    value={exchangeUtilizada}
                    onChange={(e) => setExchangeUtilizada(e.target.value)}
                    required
                  />
                  <Select
                    title="Ativo Digital"
                    placeholder="USDT"
                    options={assetsOptions}
                    value={ativoDigital}
                    onChange={(e) => setAtivoDigital(e.target.value)}
                    required
                  />
                </div>
                {tipoTransacao === "vendas" && (
                  <div className={"flex w-full flex-col flex-wrap gap-2 md:w-5/12 md:flex-row"}>
                    <InputX
                      title="Nome Comprador"
                      placeholder="Nome do Comprador"
                      value={nomeComprador || ""}
                      onChange={handleNomeCompradorChange}
                      busca
                      options={data
                        ?.filter((item: any) =>
                          (item.name || "")
                            .toLowerCase()
                            .includes((nomeComprador || "").toLowerCase()),
                        )
                        .map((item: any) => item.name)}
                    />
                    <InputX
                      title="Apelido Comprador"
                      placeholder="Apelido do Comprador"
                      value={apelidoComprador || ""}
                      onChange={(e) => setApelidoComprador(e.target.value)}
                      busca
                      options={data
                        ?.filter((item: any) =>
                          (item.counterparty || "")
                            .toLowerCase()
                            .includes((apelidoComprador || "").toLowerCase()),
                        )
                        .map((item: any) => item.counterparty)}
                      required
                    />
                    <InputX
                      title="Quantidade Vendida"
                      placeholder="Quantidade Vendida"
                      value={quantidadeVendida}
                      onChange={(e) => setQuantidadeVendida(e.target.value)}
                      required
                    />
                    <InputX
                      title="Valor Venda"
                      placeholder="Valor da Venda"
                      value={valorVenda}
                      onChange={handleValorVendaChange}
                      required
                    />
                    <InputX
                      title="Valor Token Data Venda"
                      placeholder="Valor do Token na Data da Venda"
                      value={valorTokenDataVenda}
                      onChange={(e) => setValorTokenDataVenda(e.target.value)}
                      required
                    />
                  </div>
                )}
                {tipoTransacao === "compras" && (
                  <div className={`flex w-full flex-col flex-wrap gap-2 md:w-5/12 md:flex-row`}>
                    <InputX
                      title="Nome Vendedor"
                      placeholder="Nome do Vendedor"
                      value={nomeVendedor}
                      onChange={(e) => setNomeVendedor(e.target.value)}
                    />
                    <InputX
                      title="Apelido Vendedor"
                      placeholder="Apelido do Vendedor"
                      value={apelidoVendedor}
                      onChange={(e) => setApelidoVendedor(e.target.value)}
                      required
                    />
                    <InputX
                      title="Quantidade Comprada"
                      placeholder="Quantidade Comprada"
                      value={quantidadeComprada}
                      onChange={(e) => setQuantidadeComprada(e.target.value)}
                      required
                    />
                    <InputX
                      title="Valor Compra"
                      placeholder="Valor da Compra"
                      value={valorCompra}
                      onChange={handleValorCompraChange}
                      required
                    />
                    <InputX
                      title="Valor Token Data Compra"
                      placeholder="Valor do Token na Data da Compra"
                      value={valorTokenDataCompra}
                      onChange={(e) => setValorTokenDataCompra(e.target.value)}
                      required
                    />
                  </div>
                )}
                <InputX
                  title="Taxa Transação"
                  placeholder="Taxa da Transação"
                  value={taxaTransacao}
                  onChange={(e) => setTaxaTransacao(e.target.value)}
                  required
                />
              </FormX>
            </FormProvider>
          </>
        )}
        <div className="flex w-full flex-col gap-2 pt-2">
          <Button onClick={handleSave} disabled={isPending}>
            Salvar
          </Button>
          <Button onClick={handleSend} disabled={isPending || formData.length === 0}>
            Enviar
          </Button>
        </div>
      </div>
      {formData.length > 0 && <HandleListEdit formData={formData} handleEdit={handleEdit} />}
    </FlexCol>
  );
};
