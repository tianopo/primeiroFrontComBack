import { PencilSimple, Trash } from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { IconX } from "src/components/Icons/IconX";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { useAccessControl } from "src/routes/context/AccessControl";
import { EditOrderModal } from "./components/EditOrderModal";
import { GenerateContractButton } from "./components/GenerateContractButton";
import { generateSalesInvoiceCsv } from "./components/generateSalesInvoiceCsv";
import { IN1888 } from "./components/IN1888";
import { fortnigthlyFiduciaTable } from "./config/fortnigthlyFiduciaTable";
import { handleCompraVendaDeCripto } from "./config/handleDeCripto";
import { handleCompraVendaIN1888 } from "./config/handleDownload";
import { handleReceipt } from "./config/handleReceipt";
import { parseBRL, parseNum } from "./config/helpers";
import { mensalFiduciaTable } from "./config/mensalFiduciaTable";
import { useDeleteOrder } from "./hooks/useDeleteOrder";
import { useListTransactionsInDate } from "./hooks/useListTransactionsInDate";
import { useUpdateOrder } from "./hooks/useUpdateOrder";
import { generateRpsNfseTxt } from "./components/generateRpsNfseTxt";

export const Home = () => {
  const { acesso } = useAccessControl();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const today = () => new Date().toISOString().slice(0, 10);
  const [filterDates, setFilterDates] = useState(() => {
    if (acesso === "User") {
      return { startDate: "2024-06-21", endDate: "3000-12-31" };
    }
    const now = today();
    return { startDate: now, endDate: now };
  });
  const [showModal, setShowModal] = useState(false);
  const [buyer, setBuyer] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [visibleExchanges, setVisibleExchanges] = useState<{ [key: string]: boolean }>({});
  const [valorTotalNFE, setValorTotalNFE] = useState(0);

  // estado para confirmação de deleção e edição
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any | null>(null);

  const { data, error, isLoading } = useListTransactionsInDate(
    filterDates.startDate,
    filterDates.endDate,
  );
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  // 🔹 handler de edição: só abre o modal
  const handleEditOrder = (transaction: any) => {
    setTransactionToEdit(transaction);
    setShowEditModal(true);
  };

  // 🔹 envio do formulário do modal de edição
  const handleEditSubmit = (payload: {
    ativo: string;
    quantidade: string;
    valor: string;
    valorToken: string;
    taxa: string;
    tipo: "compras" | "vendas";
  }) => {
    if (!transactionToEdit) return;

    updateOrder({
      id: transactionToEdit.id,
      ativo: payload.ativo,
      quantidade: payload.quantidade,
      valor: payload.valor,
      valorToken: payload.valorToken,
      taxa: payload.taxa,
      tipo: payload.tipo,
    });

    setShowEditModal(false);
    setTransactionToEdit(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setTransactionToEdit(null);
  };
  // 🔹 abrir modal de confirmação de deleção
  const handleDeleteOrderClick = (transaction: any) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (!transactionToDelete) return;
    deleteOrder(transactionToDelete.id);
    setShowDeleteConfirmation(false);
    setTransactionToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setTransactionToDelete(null);
  };

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterDates({ startDate, endDate });
  };

  const calculateTotals = (filteredData: any[]) => {
    let totalVendas = 0;
    let totalCompras = 0;

    // Acumuladores para média ponderada (apenas USDT/USDC)
    let sumValorTokenCompraPonderado = 0; // Σ (preço * quantidade)
    let sumQuantCompra = 0; // Σ quantidade

    let sumValorTokenVendaPonderado = 0; // Σ (preço * quantidade)
    let sumQuantVenda = 0; // Σ quantidade

    for (const t of filteredData) {
      // Totais em BRL (base real das NFs)
      const valorBRL = parseBRL(t.valor);
      if (t.tipo === "vendas") totalVendas += Number.isFinite(valorBRL) ? valorBRL : 0;
      else if (t.tipo === "compras") totalCompras += Number.isFinite(valorBRL) ? valorBRL : 0;

      // Médias ponderadas somente para stablecoins
      const isStablecoin = ["USDT", "USDC"].includes(String(t.ativo).toUpperCase());
      if (!isStablecoin) continue;

      const precoToken = parseNum(t.valorToken); // preço unitário (ex.: 5.40)
      const quantidade = parseNum(t.quantidade); // peso
      if (!Number.isFinite(precoToken) || !Number.isFinite(quantidade) || quantidade <= 0) continue;

      if (t.tipo === "compras") {
        sumValorTokenCompraPonderado += precoToken * quantidade;
        sumQuantCompra += quantidade;
      } else if (t.tipo === "vendas") {
        sumValorTokenVendaPonderado += precoToken * quantidade;
        sumQuantVenda += quantidade;
      }
    }

    const precoMedioCompra = sumQuantCompra > 0 ? sumValorTokenCompraPonderado / sumQuantCompra : 0;

    const precoMedioVenda = sumQuantVenda > 0 ? sumValorTokenVendaPonderado / sumQuantVenda : 0;

    return { totalVendas, totalCompras, precoMedioCompra, precoMedioVenda };
  };

  const filteredData =
    buyer === "" || buyer === " N/A"
      ? data || []
      : data?.filter((transaction: any) => transaction.User?.name === buyer);

  const { totalVendas, totalCompras, precoMedioCompra, precoMedioVenda } = filteredData
    ? calculateTotals(filteredData)
    : { totalVendas: 0, totalCompras: 0, precoMedioCompra: 0, precoMedioVenda: 0 };

  const handleGenerate = async () => {
    handleCompraVendaIN1888(filteredData, acesso);
  };

  useEffect(() => {
    if (data) {
      const uniqueBuyers = Array.from(
        new Set(data.map((t: any) => t.User?.name || " N/A")),
      ) as string[];

      setUsers(uniqueBuyers.sort());
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

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  const showFortnightButton = diffDays >= 12 && diffDays <= 16;
  const showMonthlyButton = diffDays >= 27;

  const exportSalesInvoiceCsv = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("Nenhuma ordem filtrada para gerar o CSV de notas fiscais.");
      return;
    }

    const result = generateSalesInvoiceCsv({
      transactions: filteredData,
      precoMedioCompraMensal: precoMedioCompra,
      endDate: filterDates.endDate,
      fileName: `notas-fiscais-vendas-${filterDates.startDate}_${filterDates.endDate}.csv`,
      modeloNf: "nfse",
      produtoCod: "S100",
      produtoDescricao: "Promoção de Vendas e Intermediação Comercial",
      commissionMode: "dinamica",
      comissaoFixaPercentual: 0.01,
      margemErroPorToken: 0.03,
    });

    if (!result) return;

    setValorTotalNFE(result.totalValorNotas);
  };

  const exportRpsNfseTxt = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("Nenhuma ordem filtrada para gerar o TXT de RPS.");
      return;
    }

    const result = generateRpsNfseTxt({
      transactions: filteredData,
      precoMedioCompraMensal: precoMedioCompra,
      startDate: filterDates.startDate,
      endDate: filterDates.endDate,
      fileName: `rps-nfse-v002-${filterDates.startDate}_${filterDates.endDate}.txt`,

      // preencher com os dados reais da sua empresa
      prestadorCcm: "SEU_CCM_AQUI",

      // confirme com sua contabilidade/prefeitura
      codigoServico: "02496",
      aliquotaPercentual: 5,
      issRetido: "2",
      situacaoRps: "T",

      rpsSerie: "RPS",
      rpsNumeroInicial: 1,

      commissionMode: "dinamica",
      comissaoFixaPercentual: 0.01,
      margemErroPorToken: 0.03,
    });

    if (!result) return;

    setValorTotalNFE(result.totalValorNotas);
  };

  const handleGenerateDeCriptoVendas = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert("Nenhuma ordem filtrada para gerar a DeCripto.");
      return;
    }

    handleCompraVendaDeCripto(filteredData, acesso, {
      onlyDeclaredSales: true,
      filePrefix: `DeCripto_Vendas_${filterDates.startDate}_${filterDates.endDate}`,
    });
  };

  return (
    <div className="flex h-fit w-full flex-col gap-3 rounded-16 bg-white p-4 shadow-2xl">
      <div className="flex items-center gap-5">
        <h3 className="text-28 font-bold">Ordens</h3>
        {acesso === "Master" && <Button onClick={() => setShowModal(true)}>IN1888</Button>}
      </div>
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
        {users.length > 0 && acesso !== "User" && (
          <InputX
            title="Compradores"
            placeholder="Selecione um comprador"
            value={buyer === " N/A" ? "" : buyer}
            onChange={(e) => setBuyer(e.target.value)}
            busca
            options={users}
          />
        )}
        <Button onClick={handleOrder} disabled={startDate.length !== 10 || endDate.length !== 10}>
          Filtrar
        </Button>
        {validationDates && (
          <>
            <Button onClick={handleGenerate}>Gerar IN188</Button>
            <Button onClick={handleGenerateDeCriptoVendas}>Gerar DeCripto Vendas</Button>
            {acesso === "Master" && validationEmptyBuyers && (
              <>
                {showFortnightButton && (
                  <Button onClick={() => fortnigthlyFiduciaTable(filteredData)}>
                    Tabela Quinzenal
                  </Button>
                )}
                {showMonthlyButton && (
                  <Button onClick={() => mensalFiduciaTable(filteredData)}>Tabela Mensal</Button>
                )}
              </>
            )}
          </>
        )}
        {validationDates && acesso === "Master" && (
          <>
            <Button onClick={exportSalesInvoiceCsv}>Exportar CSV Nota Fiscal Vendas</Button>
            <Button onClick={exportRpsNfseTxt}>Exportar TXT RPS NFS-e V.002</Button>
          </>
        )}
        {validationDates && <Button onClick={() => handleReceipt(filteredData)}>Recibo</Button>}
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro ao carregar dados</p>}

      {filteredData && (
        <div>
          <h6>Quantidade de ordens: {filteredData.length}</h6>
          <h6>Vendas: {totalVendas.toFixed(2)} BRL</h6>
          <h6>Compras: {totalCompras.toFixed(2)} BRL</h6>
          {acesso !== "User" && (
            <>
              <h6>Preço Médio de Compra em USDT/USDC: {precoMedioCompra.toFixed(2)} BRL</h6>
              <h6>Preço Médio de Venda em USDT/USDC: {precoMedioVenda.toFixed(2)} BRL</h6>
            </>
          )}
          {valorTotalNFE > 0 && (
            <div className="rounded bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
              Total das notas fiscais geradas:{" "}
              {valorTotalNFE.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          )}
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
                      className="my-1.5 w-full rounded-8 border-1 border-edge-primary p-4 sm:w-72"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="max-w-[250px] truncate">
                          <strong>Ordem:</strong> {transaction.numeroOrdem}
                        </p>

                        {acesso === "Master" && (
                          <div className="flex gap-2">
                            <IconX
                              name="Editar"
                              icon={
                                <PencilSimple
                                  className="cursor-pointer rounded-6 hover:bg-secundary hover:text-write-primary"
                                  width={19.45}
                                  height={20}
                                  weight="regular"
                                  onClick={() => handleEditOrder(transaction)}
                                />
                              }
                            />
                            <IconX
                              name="Excluir"
                              icon={
                                <Trash
                                  className="cursor-pointer rounded-6 text-variation-error hover:bg-secundary hover:text-write-primary"
                                  width={19.45}
                                  height={20}
                                  weight="regular"
                                  onClick={() => handleDeleteOrderClick(transaction)}
                                />
                              }
                            />
                          </div>
                        )}
                      </div>

                      <p>
                        <strong>Data/Hora:</strong> {transaction.dataHora}
                      </p>
                      <p>
                        <p className="max-w-[250px] truncate">
                          <strong>Usuário:</strong> {transaction.User?.name}
                        </p>
                        <strong>Ativo:</strong> {transaction.ativo}
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
                        <strong>Taxa:</strong> {transaction.taxa === "" ? 0 : transaction.taxa}
                      </p>
                      <p>
                        <strong>Tipo:</strong> {transaction.tipo}
                      </p>
                      <div className="mt-3">
                        <GenerateContractButton transaction={transaction} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <>
          <IN1888 onClose={() => setShowModal(false)} />
        </>
      )}

      {showDeleteConfirmation && transactionToDelete && (
        <ConfirmationModalButton
          text={`Tem certeza que deseja excluir a ordem ${transactionToDelete.numeroOrdem}?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {showEditModal && transactionToEdit && (
        <EditOrderModal
          order={transactionToEdit}
          onClose={handleCloseEditModal}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};
