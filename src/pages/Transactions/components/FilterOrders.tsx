import React, { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { handleDownload } from "../config/handleDownload";
import { useListTransactions } from "../hooks/useListTransactions";

export const FilterOrders = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDates, setFilterDates] = useState({ startDate: "", endDate: "" });
  const [visibleExchanges, setVisibleExchanges] = useState<{ [key: string]: boolean }>({});

  const { data, error, isLoading } = useListTransactions(
    filterDates.startDate,
    filterDates.endDate,
  );

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterDates({ startDate, endDate });
  };

  const calculateTotals = () => {
    let totalVendas = 0;
    let totalCompras = 0;

    data.forEach((transaction: any) => {
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

  const { totalVendas, totalCompras, total } = data
    ? calculateTotals()
    : { totalVendas: 0, totalCompras: 0, total: 0 };

  const handleGenerate = async () => {
    handleDownload(data);
  };

  const handleTransactions = async () => {
    if (!data) return;

    const hoje = new Date();
    const mesAnterior = new Date();
    mesAnterior.setMonth(hoje.getMonth() - 1);
    const nomeMesAnterior = mesAnterior.toLocaleDateString("pt-BR", { month: "long" });

    let fileContent = `- Serviço: Intermediação de Compra/Venda de criptomoedas.
- Comissão: 1%
- Quantidade de Vendas: ${data.filter((transaction: any) => transaction.tipo === "venda").length}
- Mês/Ano: ${nomeMesAnterior} de 2024
- Valor Total da Nota: R$ ${(totalVendas * 0.01).toFixed(2)}

A seguir estão as transações realizadas no período de ${startDate} a ${endDate}:

Vendas:
`;

    data.forEach((transaction: any, index: number) => {
      if (transaction.tipo === "venda") {
        fileContent += `Transação${index + 1}:\n${transaction.numeroOrdem}\nData: ${transaction.dataTransacao}\nExchange: ${transaction.exchange.split(" ")[0]}\nAtivo: ${transaction.ativoDigital}\nQuantidade: ${transaction.quantidade}\nValor: ${transaction.valor}\n\n`;
      }
    });

    fileContent += `\nCompras:\n`;

    data.forEach((transaction: any, index: number) => {
      if (transaction.tipo === "compra") {
        fileContent += `${index + 1}:\nNome: ${transaction.seller?.name || "N/A"}\Número da Ordem: ${transaction.numeroOrdem}\nData: ${transaction.dataTransacao}\nExchange: ${transaction.exchange.split(" ")[0]}\n$Ativo: ${transaction.ativoDigital}\nQuantidade: ${transaction.quantidade}\nValor: ${transaction.valor}\n\n`;
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
    link.download = `transacoes_${startDate}_${endDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const groupedTransactions = data ? groupByExchange(data) : {};

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
        <Button onClick={handleOrder}>Filtrar</Button>
        <Button onClick={handleGenerate}>Gerar IN188</Button>
        <Button onClick={handleTransactions}>Emitir Transacoes</Button>
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro ao carregar dados</p>}

      {data && (
        <div>
          <h6>Quantidade de ordens: {data.length}</h6>
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

                      {transaction.buyer && (
                        <div className="mt-2.5">
                          <h6>
                            <strong>Comprador:</strong>
                          </h6>
                          <p>
                            <strong>Nome:</strong> {transaction.buyer.name}
                          </p>
                          <p>
                            <strong>CPF:</strong> {transaction.buyer.document}
                          </p>
                        </div>
                      )}

                      {transaction.seller && (
                        <div className="mt-2.5">
                          <h6>
                            <strong>Vendedor:</strong>
                          </h6>
                          <p>
                            <strong>Nome:</strong> {transaction.seller.name}
                          </p>
                        </div>
                      )}
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
