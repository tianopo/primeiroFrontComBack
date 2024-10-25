import React, { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Select } from "src/components/Form/Select/Select";
import { handleDownload } from "../config/handleDownload";
import { useListTransactions } from "../hooks/useListTransactions";

export const FilterOrders = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDates, setFilterDates] = useState({ startDate: "", endDate: "" });
  const [buyer, setBuyer] = useState("");
  const [buyers, setBuyers] = useState<string[]>([]);
  const [visibleExchanges, setVisibleExchanges] = useState<{ [key: string]: boolean }>({});

  const { data, error, isLoading } = useListTransactions(
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

  // Filtrar as transações com base no comprador selecionado
  const filteredData =
    buyer === "" || buyer === "N/A"
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

    const startDateObj = new Date(startDate);
    const month = new Date(startDateObj);
    month.setMonth(startDateObj.getMonth());
    const monthName = month.toLocaleDateString("pt-BR", { month: "long" });

    let fileContent = `- Serviço: Intermediação de Compra/Venda de criptomoedas.
- Comissão: 1%
- Quantidade de Vendas: ${filteredData.filter((transaction: any) => transaction.tipo === "venda").length}
- Mês/Ano: ${monthName} de 2024
- Valor Total da Nota: R$ ${(totalVendas * 0.01).toFixed(2)}

Vendas:
`;

    filteredData.forEach((transaction: any, index: number) => {
      if (transaction.tipo === "venda") {
        fileContent += `Transação ${index + 1}:\nOrdem ID: ${transaction.numeroOrdem}\nData: ${transaction.dataTransacao}\nExchange: ${transaction.exchange.split(" ")[0]}\nAtivo: ${transaction.ativoDigital}\nQuantidade: ${transaction.quantidade}\nValor: ${transaction.valor}\n\n`;
      }
    });

    filteredData.forEach((transaction: any, index: number) => {
      if (transaction.tipo === "compra") {
        fileContent += `\nCompras:\n`;
        fileContent += `${index + 1}:\nNome: ${transaction.seller?.name || "N/A"}\Número da Ordem: ${transaction.numeroOrdem}\nData: ${transaction.dataTransacao}\nExchange: ${transaction.exchange.split(" ")[0]}\nAtivo: ${transaction.ativoDigital}\nQuantidade: ${transaction.quantidade}\nValor: ${transaction.valor}\n\n`;
      }
    });

    // Adicione políticas e termos
    fileContent += `
Política de Pagamento com termos e condições:
- Identificação por CPF.
- Não aceitamos pagamentos de terceiros. Conta PJ somente com sócio ou titular.
- Ativos digitais são muito voláteis, então sem reembolso.

Suporte de Dúvidas:
- Para informações sobre pedidos de compra P2P, consulte a documentação de suporte das plataformas utilizadas.
`;

    // Criação do arquivo para download
    const blob = new Blob([fileContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${buyer}_${monthName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (data) {
      const uniqueBuyers = Array.from(
        new Set(data.map((t: any) => t.buyer?.name || "N/A")),
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
  const validationEmptyBuyers = buyer === "" || buyer === "N/A";

  return (
    <>
      <label>
        Data de Início:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </label>

      <label>
        Data de Fim:
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </label>

      <div className="flex w-full flex-col gap-2">
        {buyers.length > 0 && (
          <Select
            title="Compradores"
            placeholder="Selecione um comprador"
            options={buyers}
            value={buyer === "N/A" ? "" : buyer}
            onChange={(e) => setBuyer(e.target.value)}
          />
        )}
        <Button onClick={handleOrder}>Filtrar</Button>
        {validationDates && validationEmptyBuyers && (
          <Button onClick={handleGenerate}>Gerar IN188</Button>
        )}
        {validationDates && !validationEmptyBuyers && (
          <Button onClick={handleTransactions}>Emitir Transacoes</Button>
        )}
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro ao carregar dados</p>}

      {filteredData && (
        <div>
          <h6>Quantidade de ordens: {filteredData.length}</h6>
          <h6>Vendas: {totalVendas.toFixed(2)} BRL</h6>
          <h6>Compras: {totalCompras.toFixed(2)} BRL</h6>
          <h6>Lucro: {total.toFixed(2)} BRL</h6>

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
    </>
  );
};
