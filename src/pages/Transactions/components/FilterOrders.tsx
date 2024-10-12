import React, { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { handleDownload } from "../config/handleDownload";
import { useListTransactions } from "../hooks/useListTransactions";

export const FilterOrders = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDates, setFilterDates] = useState({ startDate: "", endDate: "" });

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
    if (!data) return;

    const hoje = new Date();
    const dataHojeAtual = hoje.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    let fileContent = `
- Vendas: ${data.filter((transaction: any) => transaction.tipo === "venda").length}
- Compras: ${data.filter((transaction: any) => transaction.tipo === "compra").length}
- Lucro: R$ ${total.toFixed(2)}

A seguir estão as transações realizadas no período de ${startDate} a ${endDate}:

Ordem dos campos:
- Nome: Nome do comprador ou vendedor
- CPF: CPF apenas do comprador
- Ordem: Número da ordem
- Tempo: Data da transação
- Exchange: Plataforma utilizada
- Ativo: Ativo digital negociado
- Quantidade: Quantidade negociada
- Valor: Valor total da transação (em BRL)

Vendas:
`;

    data.forEach((transaction: any, index: number) => {
      if (transaction.tipo === "venda") {
        fileContent += `${index + 1}:\n${transaction.buyer?.name || "N/A"}\n${transaction.buyer?.document || "N/A"}\n${transaction.numeroOrdem}\n${transaction.dataTransacao}\n${transaction.exchange.split(" ")[0]}\n${transaction.ativoDigital}\n${transaction.quantidade}\n${transaction.valor}\n\n`;
      }
    });

    fileContent += `\nCompras:\n`;

    data.forEach((transaction: any, index: number) => {
      if (transaction.tipo === "compra") {
        fileContent += `${index + 1}:\n${transaction.seller?.name || "N/A"}\n${transaction.numeroOrdem}\n${transaction.dataTransacao}\n${transaction.exchange.split(" ")[0]}\n${transaction.ativoDigital}\n${transaction.quantidade}\n${transaction.valor}\n\n`;
      }
    });

    // Adicione políticas e termos
    fileContent += `
Política de Pagamento com termos e condições:
- Identificação por CPF.
- Não aceitamos pagamentos de terceiros. Conta PJ somente com sócio ou titular.

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

    handleDownload(data);
  };

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

      <Button onClick={handleOrder}>Filtrar</Button>
      <Button onClick={handleGenerate}>Gerar</Button>

      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro ao carregar dados</p>}

      {data && (
        <div>
          <h6>Quantidade de ordens: {data.length}</h6>
          <h6>Vendas: {totalVendas.toFixed(2)} BRL</h6>
          <h6>Compras: {totalCompras.toFixed(2)} BRL</h6>
          <h6>Lucro: {total.toFixed(2)} BRL</h6>
          <div className="flex flex-row flex-wrap gap-2">
            {data.map((transaction: any) => (
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
                <p>
                  <strong>Exchange:</strong> {transaction.exchange}
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
        </div>
      )}
    </>
  );
};
