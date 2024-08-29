import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FlexRow } from "src/components/Flex/FlexRow";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { UploadXLSButton } from "./components/UploadXLSButton";
import { handleDownload } from "./config/handleDownload";
import { ITransactionData, useTransaction } from "./useTransactions";

export const Transactions = () => {
  const { mutate, isPending, context } = useTransaction();
  const { reset, getValues } = context;

  const [vendas, setVendas] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);
  const [tipoTransacao, setTipoTransacao] = useState<string>("compras");
  const [formData, setFormData] = useState<any[]>([]);

  const [numeroOrdem, setNumeroOrdem] = useState<string>("");
  const [dataHoraTransacao, setDataHoraTransacao] = useState<string>("");
  const [exchangeUtilizada, setExchangeUtilizada] = useState<string>("");
  const [ativoDigital, setAtivoDigital] = useState<string>("");
  const [nomeVendedor, setNomeVendedor] = useState<string>("");
  const [nomeComprador, setNomeComprador] = useState<string>("");
  const [cpfComprador, setCpfComprador] = useState<string>("");
  const [quantidadeComprada, setQuantidadeComprada] = useState<string>("");
  const [quantidadeVendida, setQuantidadeVendida] = useState<string>("");
  const [valorCompra, setValorCompra] = useState<string>("");
  const [valorVenda, setValorVenda] = useState<string>("");
  const [valorTokenDataCompra, setValorTokenDataCompra] = useState<string>("");
  const [valorTokenDataVenda, setValorTokenDataVenda] = useState<string>("");
  const [taxaTransacao, setTaxaTransacao] = useState<string>("");

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

  const handleSave = () => {
    const values = getValues();
    const updatedValues = {
      ...values,
      tipoTransacao,
    };
    setFormData((prevData) => [...prevData, updatedValues]);
    if (tipoTransacao === "vendas") setVendas((prevData) => [...prevData, updatedValues]);
    if (tipoTransacao === "compras") setCompras((prevData) => [...prevData, updatedValues]);
    toast.success("Adicionado");
  };

  const handleSend = () => {
    const combinedData = {
      vendas,
      compras,
    };

    handleDownload(formData);
    mutate(combinedData);
  };

  const handleDelete = (index: number) => {
    const itemToDelete = formData[index];

    setFormData((prevData) => prevData.filter((_, i) => i !== index));

    if (itemToDelete.tipoTransacao === "vendas") {
      setVendas((prevVendas) =>
        prevVendas.filter((_, i) => i !== vendas.findIndex((v) => v === itemToDelete)),
      );
    } else if (itemToDelete.tipoTransacao === "compras") {
      setCompras((prevCompras) =>
        prevCompras.filter((_, i) => i !== compras.findIndex((c) => c === itemToDelete)),
      );
    }
  };

  const handleEdit = (index: number) => {
    const item = formData[index];
    setNumeroOrdem(item.numeroOrdem);
    setDataHoraTransacao(item.dataHoraTransacao);
    setExchangeUtilizada(item.exchangeUtilizada);
    setAtivoDigital(item.ativoDigital);
    setNomeVendedor(item.nomeVendedor);
    setNomeComprador(item.nomeComprador);
    setCpfComprador(item.cpfComprador);
    setQuantidadeComprada(item.quantidadeComprada);
    setQuantidadeVendida(item.quantidadeVendida);
    setValorCompra(item.valorCompra);
    setValorVenda(item.valorVenda);
    setValorTokenDataCompra(item.valorTokenDataCompra);
    setValorTokenDataVenda(item.valorTokenDataVenda);
    setTaxaTransacao(item.taxaTransacao);
    setTipoTransacao(item.tipoTransacao);
    handleDelete(index);
  };

  return (
    <FlexCol className="w-full p-4 pb-2">
      <FlexRow>
        <h1 className="text-24 font-bold">Formulário de Compra e Venda de Criptoativos</h1>
        <Select
          title="Tipo Transação"
          options={["compras", "vendas"]}
          value={tipoTransacao}
          onChange={handleTipoTransacaoChange}
        />
      </FlexRow>
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
              placeholder="Data e Hora da Transação"
              value={dataHoraTransacao}
              onChange={(e) => setDataHoraTransacao(e.target.value)}
              required
            />
            <Select
              title="Exchange Utilizada"
              placeholder="Bybit https://www.bybit.com/ SG"
              options={[
                "Bybit https://www.bybit.com/ SG",
                "Binance https://www.binance.com/ CN",
                "Gate.IO https://www.gate.io/ AE",
                "Kucoin https://www.kucoin.com/ SC",
              ]}
              value={exchangeUtilizada}
              onChange={(e) => setExchangeUtilizada(e.target.value)}
              required
            />
            <Select
              title="Ativo Digital"
              placeholder="Tether (USDT)"
              options={["BTC", "USDT", "BNB", "ETH", "USDC", "DOGE"]}
              value={ativoDigital}
              onChange={(e) => setAtivoDigital(e.target.value)}
              required
            />
          </div>
          {tipoTransacao === "vendas" && (
            <div className="flex w-full flex-col flex-wrap gap-2 md:w-5/12 md:flex-row">
              <InputX
                title="Nome Comprador"
                placeholder="Nome do Comprador"
                value={nomeComprador}
                onChange={(e) => setNomeComprador(e.target.value)}
              />
              <InputX
                title="Cpf Comprador"
                placeholder="CPF do Comprador"
                value={cpfComprador}
                onChange={(e) => setCpfComprador(e.target.value)}
              />
              <InputX
                title="Quantidade Vendida"
                placeholder="Quantidade Vendida"
                value={quantidadeVendida}
                onChange={(e) => setQuantidadeVendida(e.target.value)}
              />
              <InputX
                title="Valor Venda"
                placeholder="Valor da Venda"
                value={valorVenda}
                onChange={(e) => setValorVenda(e.target.value)}
              />
              <InputX
                title="Valor Token Data Venda"
                placeholder="Valor do Token na Data da Venda"
                value={valorTokenDataVenda}
                onChange={(e) => setValorTokenDataVenda(e.target.value)}
              />
            </div>
          )}
          {tipoTransacao === "compras" && (
            <div className="flex w-full flex-col flex-wrap gap-2 md:w-5/12 md:flex-row">
              <InputX
                title="Nome Vendedor"
                placeholder="Nome do Vendedor"
                value={nomeVendedor}
                onChange={(e) => setNomeVendedor(e.target.value)}
              />
              <InputX
                title="Quantidade Comprada"
                placeholder="Quantidade Comprada"
                value={quantidadeComprada}
                onChange={(e) => setQuantidadeComprada(e.target.value)}
              />
              <InputX
                title="Valor Compra"
                placeholder="Valor da Compra"
                value={valorCompra}
                onChange={(e) => setValorCompra(e.target.value)}
              />
              <InputX
                title="Valor Token Data Compra"
                placeholder="Valor do Token na Data da Compra"
                value={valorTokenDataCompra}
                onChange={(e) => setValorTokenDataCompra(e.target.value)}
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
      <div className="flex w-full flex-col gap-2 pt-2">
        <Button onClick={handleSave} disabled={isPending}>
          Salvar
        </Button>
        <Button onClick={handleSend} disabled={isPending}>
          Enviar
        </Button>
        <UploadXLSButton setFormData={setFormData} formData={formData} />
      </div>
      <div className="mt-4">
        <h2 className="text-20 font-bold">Dados Armazenados:</h2>
        <ul className="flex flex-row flex-wrap gap-2">
          {formData.map((item, index) => (
            <li
              key={index}
              className="cursor-pointer rounded-lg border bg-gray-100 p-4"
              onClick={() => handleEdit(index)}
            >
              {item.tipoTransacao === "compras" && (
                <>
                  <p>
                    <strong>Número Ordem:</strong> {item.numeroOrdem}
                  </p>
                  <p>
                    <strong>Data e Hora Transação:</strong> {item.dataHoraTransacao}
                  </p>
                  <p>
                    <strong>Exchange Utilizada:</strong> {item.exchangeUtilizada}
                  </p>
                  <p>
                    <strong>Ativo Digital:</strong> {item.ativoDigital}
                  </p>
                  <p>
                    <strong>Nome Vendedor:</strong> {item.nomeVendedor}
                  </p>
                  <p>
                    <strong>Quantidade Comprada:</strong> {item.quantidadeComprada}
                  </p>
                  <p>
                    <strong>Valor Compra:</strong> {item.valorCompra}
                  </p>
                  <p>
                    <strong>Valor Token Data Compra:</strong> {item.valorTokenDataCompra}
                  </p>
                  <p>
                    <strong>Taxa Transação:</strong> {item.taxaTransacao}
                  </p>
                </>
              )}
              {item.tipoTransacao === "vendas" && (
                <>
                  <p>
                    <strong>Número Ordem:</strong> {item.numeroOrdem}
                  </p>
                  <p>
                    <strong>Data e Hora Transação:</strong> {item.dataHoraTransacao}
                  </p>
                  <p>
                    <strong>Exchange Utilizada:</strong> {item.exchangeUtilizada}
                  </p>
                  <p>
                    <strong>Ativo Digital:</strong> {item.ativoDigital}
                  </p>
                  <p>
                    <strong>Nome Comprador:</strong> {item.nomeComprador}
                  </p>
                  <p>
                    <strong>CPF Comprador:</strong> {item.cpfComprador}
                  </p>
                  <p>
                    <strong>Quantidade Vendida:</strong> {item.quantidadeVendida}
                  </p>
                  <p>
                    <strong>Valor Venda:</strong> {item.valorVenda}
                  </p>
                  <p>
                    <strong>Valor Token Data Venda:</strong> {item.valorTokenDataVenda}
                  </p>
                  <p>
                    <strong>Taxa Transação:</strong> {item.taxaTransacao}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </FlexCol>
  );
};
