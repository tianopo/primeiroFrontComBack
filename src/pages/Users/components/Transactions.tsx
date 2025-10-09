import { CaretDown, CaretRight, PaperPlaneTilt } from "@phosphor-icons/react";
import { Fragment, useMemo, useState } from "react";
import { CardContainer } from "src/components/Layout/CardContainer";
import { PaginationBar } from "src/components/Pagination/PaginationBar";
import { useAccountBalance } from "../hooks/fiducia/useAccountBalance";
import { useListTransactions } from "../hooks/fiducia/useListTransactions";
import {
  detailsTone,
  fmtBalance,
  fmtBank,
  fmtDateTime,
  fmtTxValue,
  MY_CNPJ,
  rowTone,
  valueTone,
} from "../utils/transactions";
import { PixEndToEndPanel } from "./Transactions/PixEndToEndPanel";
import { PixTransferModal } from "./Transactions/PixTransferModal";
import { TransactionsSearchBar } from "./Transactions/TransactionsSearchBar";

const isEndToEnd = (s: string) => {
  const t = s.trim();
  // bem permissivo: a maioria começa com "E" e é longa
  return t.length >= 20 && /^E[A-Za-z0-9]+$/.test(t);
};

export const Transactions = () => {
  // paginação
  const [page, setPage] = useState(1);
  const limit = 25;

  // busca
  const [search, setSearch] = useState("");
  const [endToEndId, setEndToEndId] = useState<string>("");

  const { data, error, isLoading, isFetching } = useListTransactions(page, limit);
  const { data: balance, error: balError, isLoading: balLoading } = useAccountBalance();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  const rows = useMemo<any[]>(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.retorno)) return (data as any).retorno;
    return [];
  }, [data]);

  if (isLoading) return <CardContainer full>Carregando...</CardContainer>;
  if (error) return <CardContainer full>Erro ao carregar transações</CardContainer>;

  const pickCompactSide = (tx: any) => {
    const deb = tx.cnpj_cpf_debito;
    const cre = tx.cnpj_cpf_clienteCredtada;
    if (deb === MY_CNPJ) return "credit";
    if (cre === MY_CNPJ) return "debit";
    return "credit";
  };

  const renderCompactRow = (tx: any) => {
    const side = pickCompactSide(tx);
    const nome =
      side === "credit" ? (tx.nome_clienteCredtada ?? "-") : (tx.nome_cliente_debito ?? "-");
    const doc =
      side === "credit" ? (tx.cnpj_cpf_clienteCredtada ?? "-") : (tx.cnpj_cpf_debito ?? "-");
    const valor = fmtTxValue(tx.valor_lancamento ?? tx.valor ?? tx.valor_original);
    const dataFmt = fmtDateTime(tx.created_at, tx.dt_movto);
    return { nome, doc, valor, dataFmt };
  };

  const toggleExpand = (id: number | string | undefined) => {
    const key = id ?? `idx-${Math.random()}`;
    setExpandedId((prev) => (prev === key ? null : key));
  };

  const goPrev = () => {
    if (page <= 1) return;
    setExpandedId(null);
    setPage((p) => Math.max(1, p - 1));
  };

  const goNext = () => {
    if (rows.length < limit) return;
    setExpandedId(null);
    setPage((p) => p + 1);
  };

  // handlers busca
  const handleSearchChange = (v: string) => {
    setSearch(v);
    if (isEndToEnd(v)) {
      setEndToEndId(v.trim());
      setExpandedId(null);
    } else {
      setEndToEndId("");
    }
  };

  const handleSearchClear = () => {
    setSearch("");
    setEndToEndId("");
    setPage(1);
  };

  return (
    <CardContainer full>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-28 font-bold">TRANSAÇÕES</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center rounded-2xl bg-black px-4 py-2 font-bold text-white"
          >
            <PaperPlaneTilt size={18} className="mr-2" /> PIX
          </button>

          {balLoading && <span className="text-sm text-gray-500">Carregando saldo…</span>}
          {balError && <span className="text-sm text-red-600">Erro ao carregar saldo</span>}
          {balance && (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-6 bg-gray-100 px-3 py-1 text-sm">
                <strong>Saldo:</strong> {fmtBalance(balance.Saldo)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de busca (aceita EndToEnd) */}
      <TransactionsSearchBar
        value={search}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
      />

      {/* MODO CONSULTA: se endToEndId está setado, mostramos o painel e ocultamos a lista/paginação */}
      {endToEndId ? (
        <PixEndToEndPanel endToEndId={endToEndId} onClear={handleSearchClear} />
      ) : (
        <>
          <PaginationBar
            page={page}
            limit={limit}
            rowCount={rows.length}
            isFetching={isFetching}
            onPrev={goPrev}
            onNext={goNext}
          />

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-3 py-2 text-left">Valor</th>
                  <th className="border px-3 py-2 text-left">Nome</th>
                  <th className="border px-3 py-2 text-left">CPF/CNPJ</th>
                  <th className="border px-3 py-2 text-left">Data</th>
                  <th className="w-10 border px-3 py-2 text-left"> </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((tx: any, idx: number) => {
                  const key = tx.id ?? `row-${idx}`;
                  const compact = renderCompactRow(tx);
                  const isOpen = expandedId === key;

                  return (
                    <Fragment key={key}>
                      <tr className={rowTone(tx.tipo_transacao)}>
                        <td
                          className={`border px-3 py-2 font-medium ${valueTone(tx.tipo_transacao)}`}
                        >
                          {compact.valor}
                        </td>
                        <td className="border px-3 py-2">{compact.nome}</td>
                        <td className="border px-3 py-2">{compact.doc}</td>
                        <td className="border px-3 py-2">{compact.dataFmt}</td>
                        <td
                          className="cursor-pointer border px-3 py-2 text-gray-600"
                          onClick={() => toggleExpand(key)}
                        >
                          {isOpen ? <CaretDown size={16} /> : <CaretRight size={16} />}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td
                            className={`border px-3 py-3 ${detailsTone(tx.tipo_transacao)}`}
                            colSpan={5}
                          >
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <div className="mb-2 font-semibold">Identificação</div>
                                <ul className="text-sm leading-6">
                                  <li>
                                    <strong>ID (NumCtrlSTR):</strong> {tx.NumCtrlSTR ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Tipo Transação:</strong> {tx.tipo_transacao ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Finalidade:</strong> {tx.finalidade ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Data movimento:</strong> {fmtDateTime(tx.dt_movto)}
                                  </li>
                                  <li>
                                    <strong>Criado em:</strong> {fmtDateTime(tx.created_at)}
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <div className="mb-2 font-semibold">Valores</div>
                                <ul className="text-sm leading-6">
                                  <li>
                                    <strong>Valor lançamento:</strong>{" "}
                                    {fmtTxValue(
                                      tx.valor_lancamento ?? tx.valor ?? tx.valor_original,
                                    )}
                                  </li>
                                  <li>
                                    <strong>Histórico:</strong> {tx.hist || "-"}
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <div className="mb-2 font-semibold">Débito</div>
                                <ul className="text-sm leading-6">
                                  <li>
                                    <strong>Tipo Pessoa:</strong>{" "}
                                    {tx.tpPessoaDebtd ?? tx.TpPessoaDebtd ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Nome:</strong> {tx.nome_cliente_debito ?? "-"}
                                  </li>
                                  <li>
                                    <strong>CPF/CNPJ:</strong> {tx.cnpj_cpf_debito ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Ag/Conta:</strong> {tx.agDebtd ?? "-"} /{" "}
                                    {tx.ctDebtd ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Tipo de Conta:</strong> {tx.tpCtDebitada ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Banco:</strong> {fmtBank(tx.banco_debito)}
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <div className="mb-2 font-semibold">Crédito</div>
                                <ul className="text-sm leading-6">
                                  <li>
                                    <strong>Tipo Pessoa:</strong> {tx.tpPessoaCredtda ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Nome:</strong> {tx.nome_clienteCredtada ?? "-"}
                                  </li>
                                  <li>
                                    <strong>CPF/CNPJ:</strong> {tx.cnpj_cpf_clienteCredtada ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Ag/Conta:</strong> {tx.agCredtda ?? "-"} /{" "}
                                    {tx.ctCredtda ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Tipo de Conta:</strong> {tx.tpCtCredtda ?? "-"}
                                  </li>
                                  <li>
                                    <strong>Banco:</strong> {fmtBank(tx.banco_credito)}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td className="border px-3 py-4 text-center text-gray-500" colSpan={5}>
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {open && <PixTransferModal onClose={() => setOpen(false)} />}
    </CardContainer>
  );
};
