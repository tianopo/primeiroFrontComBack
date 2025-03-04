import React, { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { handleDownload } from "./config/handleDownload";
import { useListTransactionsInDate } from "./hooks/useListTransactionsInDate";

export const DocumentsGenerator = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDates, setFilterDates] = useState({ startDate: "", endDate: "" });
  const [buyer, setBuyer] = useState("");
  const [buyers, setBuyers] = useState<string[]>([]);
  const [visibleExchanges, setVisibleExchanges] = useState<{ [key: string]: boolean }>({});

  const { data, error, isLoading } = useListTransactionsInDate(
    filterDates.startDate,
    filterDates.endDate,
  );

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterDates({ startDate, endDate });
  };

  const calculateTotals = (filteredData: any[]) => {
    let totalVendas = 0;
    let totalCompras = 0;

    filteredData.forEach((transaction: any) => {
      const valor = parseFloat(
        transaction.valor.replace(".", "").replace(",", ".").replace("R$", ""),
      );

      if (transaction.tipo === "venda") {
        totalVendas += valor;
      } else if (transaction.tipo === "compra") {
        totalCompras += valor;
      }
    });

    return { totalVendas, totalCompras, total: totalVendas - totalCompras };
  };

  const filteredData =
    buyer === "" || buyer === " N/A"
      ? data || []
      : data?.filter((transaction: any) => transaction.buyer?.name === buyer);

  const { totalVendas, totalCompras, total } = filteredData
    ? calculateTotals(filteredData)
    : { totalVendas: 0, totalCompras: 0, total: 0 };

  const handleGenerate = async () => {
    handleDownload(filteredData);
  };

  const handleTransactions = async () => {
    if (!filteredData) return;

    const today = new Date();
    const monthName = today.toLocaleDateString("pt-BR", { month: "long" });
    const yearName = today.toLocaleDateString("pt-BR", { year: "2-digit" });

    const groupedByBuyer = filteredData.reduce((acc: any, transaction: any) => {
      const buyerDocument = transaction.buyer?.document || "N/A";
      if (buyerDocument !== "N/A") {
        if (!acc[buyerDocument]) {
          acc[buyerDocument] = {
            buyer: transaction.buyer,
            totalVendas: 0,
            totalCompras: 0,
            transactions: [],
          };
        }
        acc[buyerDocument].transactions.push(transaction);

        const valor = parseFloat(
          transaction.valor.replace(".", "").replace(",", ".").replace("R$", ""),
        );
        if (transaction.tipo === "venda") {
          acc[buyerDocument].totalVendas += valor;
        } else if (transaction.tipo === "compra") {
          acc[buyerDocument].totalCompras += valor;
        }
      }
      return acc;
    }, {});

    let csvContent = `Indicador de Tipo de Serviço,""Número RPS"",""Serie RPS"",""Data Prestação de Serviço"",""Data Emissão do RPS"",""RPS Substitutivo"",""Documento CPF/CNPJ"",""Inscrição Mobiliária"",""Razão Social"",Endereço,Número,Complemento,Bairro,""Código do Município"",""Código do País"",Cep,Telefone,Email,""ISS Retido no Tomador"",""Código do Município onde o Serviço foi Prestado"",""Código da Atividade"",""Código da Lista de Serviços"",Discriminação,""Valor NF"",""Valor Deduções"",""Valor Desconto Condicionado"",""Valor Desconto Incondicionado"",""Valor INSS"",""Valor Csll"",""Valor Outras Retenções"",""Valor Pis"",""Valor Cofins"",""Valor Ir"",""Valor Iss"",""Prestador Optante Simples Nacional"",Alíquota,""Código da Obra"",""Código ART"",""Inscrição Própria"",""Código do Benefício""\n`;

    const hoje = new Date();
    const comissao = 0.8;
    const codMunicipioServicoPrestado = 352440;
    const codAtividade = 6619399;
    const codListaServicos = 10.02;
    const aliquota = 201; // 2,01%
    const inscricaoMunicipal = 90598;
    let numeroRPS = parseInt(localStorage.getItem("numeroRPS") || "0", 10);

    Object.values(groupedByBuyer).forEach((group: any) => {
      const buyer = group.buyer;
      const buyerName = buyer?.name || "N/A";
      const cpfCnpj = buyer?.document?.replace(/[^0-9]/g, "");
      const totalVendas = group.totalVendas;
      const valorNfe = Math.round(totalVendas * comissao);
      const valorIss = Math.round(valorNfe * (aliquota / 10000));
      const exchangeName = group.transactions[0].exchange.split(" ")[0];

      const endDateObj = group.transactions.reduce((latest: Date, transaction: any) => {
        const transactionDate = new Date(transaction.dataTransacao);
        return transactionDate > latest ? transactionDate : latest;
      }, new Date(group.transactions[0].dataTransacao));

      // Discriminação formatada corretamente
      let fileContent = `"- Serviço: Intermediação de Ativos Digitais\n  - Comissão: ${comissao}%\n  - Quantidade Vendida: ${group.transactions.filter((transaction: any) => transaction.tipo === "venda").length}\n  - Mês/Ano: ${monthName}/${yearName}\n  - Valor da Nota: ${(valorNfe / 100).toFixed(2)}\n  Ordem dos Campos após nome da corretora:\n  - Identificador da Ordem\n  - Dia e Hora\n  - Ativo Digital\n  - Quantidade de Tokens\n  - Valor Pago\n  Exchange/Corretora: ${exchangeName}\n`;

      group.transactions.forEach((transaction: any) => {
        if (transaction.tipo === "venda") {
          fileContent += `  ${transaction.numeroOrdem}\n  ${transaction.dataTransacao}\n  ${transaction.ativoDigital}\n  ${transaction.quantidade}\n  ${transaction.valor}\n\n`;
        }
      });

      fileContent += `  Suporte de Dúvidas:\n  - Para informações do P2P, consulte documentação ou o suporte da corretora"`;

      // Criar o conteúdo CSV
      const csvData = `R,${numeroRPS},RPS,${endDateObj.toLocaleDateString("pt-BR")},${hoje.toLocaleDateString("pt-BR")},,${cpfCnpj},,${buyerName},,,,,,48,,,,S,${codMunicipioServicoPrestado},${codAtividade},${codListaServicos},${fileContent},${valorNfe},0,0,0,0,0,0,0,0,0,${valorIss},S,${aliquota},0,0,${inscricaoMunicipal},\n`;

      csvContent += csvData;
      numeroRPS += 1;
    });

    localStorage.setItem("numeroRPS", numeroRPS.toString());

    const buyerNames = buyer.split(" ");
    const formattedBuyer = `${buyerNames[0]} ${buyerNames[buyerNames.length - 1]}`;

    // Criar o arquivo .csv para download
    const blobCsv = new Blob([csvContent], { type: "text/csv" });
    const linkCsv = document.createElement("a");
    linkCsv.href = URL.createObjectURL(blobCsv);
    linkCsv.download = `nota_fiscal_${validationEmptyBuyers ? monthName : `${formattedBuyer}_${monthName}`}.csv`;
    document.body.appendChild(linkCsv);
    linkCsv.click();
    document.body.removeChild(linkCsv);
  };

  useEffect(() => {
    if (data) {
      const uniqueBuyers = Array.from(
        new Set(data.map((t: any) => t.buyer?.name || " N/A")),
      ) as string[];

      setBuyers(uniqueBuyers.sort());
    }
  }, [data]);

  // Função para agrupar transações por exchange
  const groupByExchange = (transactions: any[]) => {
    return transactions.reduce((acc: any, transaction: any) => {
      const exchange = transaction.exchange.split(" ")[0];
      if (!acc[exchange]) {
        acc[exchange] = [];
      }
      acc[exchange].push(transaction);
      return acc;
    }, {});
  };

  // Alternar visibilidade das ordens de uma exchange
  const toggleExchangeVisibility = (exchange: string) => {
    setVisibleExchanges((prev) => ({
      ...prev,
      [exchange]: !prev[exchange],
    }));
  };

  const groupedTransactions = filteredData ? groupByExchange(filteredData) : {};
  const validationDates = filterDates.startDate.length > 0 && filterDates.endDate.length > 0;
  const validationEmptyBuyers = buyer === "" || buyer === " N/A";
  return (
    <div className="flex h-fit w-full flex-col gap-3 rounded-16 bg-white p-4 shadow-2xl">
      <h3 className="text-28 font-bold">Gerador de Documentos</h3>
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
        <InputX
          title="Data Início"
          typ="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <InputX
          title="Data Final"
          typ="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        {buyers.length > 0 && (
          <InputX
            title="Compradores"
            placeholder="Selecione um comprador"
            value={buyer === " N/A" ? "" : buyer}
            onChange={(e) => setBuyer(e.target.value)}
            busca
            options={buyers}
          />
        )}
        <Button onClick={handleOrder} disabled={startDate.length !== 10 || endDate.length !== 10}>
          Filtrar
        </Button>
        {validationDates && validationEmptyBuyers && (
          <Button onClick={handleGenerate}>Gerar IN188</Button>
        )}
        {validationDates && <Button onClick={handleTransactions}>Emitir NFE</Button>}
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro ao carregar dados</p>}

      {filteredData && (
        <div>
          <h6>Quantidade de ordens: {filteredData.length}</h6>
          <h6>Vendas: {totalVendas.toFixed(2)} BRL</h6>
          <h6>Compras: {totalCompras.toFixed(2)} BRL</h6>
          <h6>
            Lucro: {!validationEmptyBuyers ? (total * 0.01).toFixed(2) : total.toFixed(2)} BRL
          </h6>

          {/* Listar as ordens agrupadas por exchange */}
          {Object.keys(groupedTransactions).map((exchange) => (
            <div key={exchange} className="mb-4">
              <h4
                className="cursor-pointer text-blue-600"
                onClick={() => toggleExchangeVisibility(exchange)}
              >
                {exchange} ({groupedTransactions[exchange].length} ordens)
              </h4>
              {visibleExchanges[exchange] && (
                <div className="flex flex-row flex-wrap gap-2">
                  {groupedTransactions[exchange].map((transaction: any) => (
                    <div
                      key={transaction.numeroOrdem}
                      className="my-2.5 w-full rounded-8 border-1 border-edge-primary p-5 sm:w-80"
                    >
                      <h6>
                        <strong>Ordem:</strong> {transaction.numeroOrdem}
                      </h6>
                      <p>
                        <strong>Data Transação:</strong> {transaction.dataTransacao}
                      </p>
                      <p>
                        <strong>Ativo Digital:</strong> {transaction.ativoDigital}
                      </p>
                      <p>
                        <strong>Quantidade:</strong> {transaction.quantidade}
                      </p>
                      <p>
                        <strong>Valor:</strong> {transaction.valor}
                      </p>
                      <p>
                        <strong>Valor Token:</strong> {transaction.valorToken}
                      </p>
                      <p>
                        <strong>Taxa de Transação:</strong> {transaction.taxaTransacao}
                      </p>
                      <p>
                        <strong>Tipo:</strong> {transaction.tipo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
