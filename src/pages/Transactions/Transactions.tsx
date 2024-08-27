import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import { Button } from "src/components/Buttons/Button";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FlexRow } from "src/components/Flex/FlexRow";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { ITransactionData, useTransaction } from "./useTransactions";

export const Transactions = () => {
  const { mutate, isPending, context } = useTransaction();
  const { reset, getValues } = context;

  const [vendas, setVendas] = useState<any[]>([]);
  const [compras, setCompras] = useState<any[]>([]);

  const [tipoTransacao, setTipoTransacao] = useState<string>("compras");
  const [formData, setFormData] = useState<any[]>([]);

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
    console.log("Dados combinados:", combinedData);
    handleDownload();
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

  const handleDownload = () => {
    const textContent = formData
      .map((item) => {
        const operationCode = item.tipoTransacao === "compras" ? "0110" : "0120";
        const dataSeparada = item.dataHoraTransacao.split(" ")[0].split("-");
        const dataHoraTransacao = `${dataSeparada[2]}${dataSeparada[1]}${dataSeparada[0]}`;
        const tipoTransaction = (item: string) => item.replace("R$", "").replace(/\./g, "");
        const valorOperacao = `${item.tipoTransacao === "compras" ? tipoTransaction(item.valorCompra) : tipoTransaction(item.valorVenda)}`;
        const simboloAtivoDigital = item.ativoDigital.match(/\(([^)]+)\)/)?.[1] || "";
        const quantidadeRaw =
          item.tipoTransacao === "compras" ? item.quantidadeComprada : item.quantidadeVendida;
        const quantidade = parseFloat(quantidadeRaw.replace(",", ""))
          .toFixed(10)
          .toString()
          .replace(".", ",");
        const exchange = item.exchangeUtilizada.split(" ")[0];
        const exchangeURL = item.exchangeUtilizada.split(" ")[1];
        const siglaPaisOrigemExchange = item.exchangeUtilizada.split(" ")[2];

        return {
          line: `${operationCode}|${dataHoraTransacao}|I|${valorOperacao}|0,00|${simboloAtivoDigital}|${quantidade}|${exchange}|${exchangeURL}|${siglaPaisOrigemExchange}`,
          operationCode: parseInt(operationCode, 10),
        };
      })
      .sort((a, b) => a.operationCode - b.operationCode)
      .map((item) => item.line)
      .join("\r\n");

    const dataAtual = new Date();
    dataAtual.setDate(dataAtual.getDate() - 1);
    const dia = String(dataAtual.getDate()).padStart(2, "0");
    const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
    const ano = dataAtual.getFullYear();
    const dataFormatada = `${dia}${mes}${ano}`;

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Relatorio_IN188_${dataFormatada}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <FormX onSubmit={onSubmit}>
          <div className="flex w-full flex-col gap-2">
            <InputX title="Número Ordem" placeholder="Número da Ordem" required />
            <InputX title="Data Hora Transação" placeholder="Data e Hora da Transação" required />
            <Select
              title="Exchange Utilizada"
              options={[
                "Bybit https://www.bybit.com/ SG",
                "Binance https://www.binance.com/ CN",
                "Gate.IO https://www.gate.io/ AE",
                "Kucoin https://www.kucoin.com/ SC",
              ]}
              placeholder="Exchange Utilizada"
              required
            />
            <Select
              title="Ativo Digital"
              placeholder="Ativo Digital"
              options={[
                "Bitcoin (BTC)",
                "Tether (USDT)",
                "Binance Coin (BNB)",
                "Ethereum (ETH)",
                "USD Coin (USDC)",
                "Dogecoin (DOGE)",
              ]}
              required
            />
            {tipoTransacao === "vendas" && (
              <>
                <InputX title="Nome Comprador" placeholder="Nome do Comprador" />
                <InputX title="CPF Comprador" placeholder="CPF do Comprador" />
                <InputX title="Quantidade Vendida" placeholder="Quantidade Vendida" />
                <InputX title="Valor Venda" placeholder="Valor da Venda" />
                <InputX
                  title="Valor Token Data Venda"
                  placeholder="Valor do Token na Data da Venda"
                />
              </>
            )}
            {tipoTransacao === "compras" && (
              <>
                <InputX title="Nome Vendedor" placeholder="Nome do Vendedor" />
                <InputX title="Quantidade Comprada" placeholder="Quantidade Comprada" />
                <InputX title="Valor Compra" placeholder="Valor da Compra" />
                <InputX
                  title="Valor Token Data Compra"
                  placeholder="Valor do Token na Data da Compra"
                />
              </>
            )}
            <InputX title="Taxa Transação" placeholder="Taxa de Transação" required />
          </div>
        </FormX>
      </FormProvider>
      <div className="flex w-full flex-col gap-2 pt-2">
        <Button onClick={handleSave} disabled={isPending}>
          Salvar
        </Button>
        <Button onClick={handleSend} disabled={isPending}>
          Enviar
        </Button>
        <Button onClick={handleDownload}>Baixar Arquivo TXT</Button>
      </div>
      <div className="mt-4">
        <h2 className="text-20 font-bold">Dados Armazenados:</h2>
        <ul>
          {formData.map((item, index) => (
            <li key={index} className="mb-2 rounded-lg border bg-gray-100 p-4">
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
              <Button onClick={() => handleDelete(index)} className="mt-2">
                Excluir
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </FlexCol>
  );
};
