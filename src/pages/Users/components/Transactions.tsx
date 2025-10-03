import { CaretDown, CaretRight, PaperPlaneTilt } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CardContainer } from "src/components/Layout/CardContainer";
import { useAccountBalance } from "../hooks/fiducia/useAccountBalance";
import { useListTransactions } from "../hooks/fiducia/useListTransactions";
import { PixTransferModal } from "./PixTransferModal";

const MY_CNPJ = "55636113000170";

// saldo: vem em centavos (number)
const fmtBalance = (v?: number) => {
  if (typeof v !== "number" || !Number.isFinite(v)) return "-";
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// extrato: vem em reais (string/number), ex.: "1500", "24.52", "15000.00"
const fmtTxValue = (v: unknown) => {
  if (v === null || v === undefined) return "-";
  let n: number | null = null;
  if (typeof v === "number") n = v;
  else if (typeof v === "string") n = Number(v.replace(",", "."));
  if (!Number.isFinite(n)) return "-";
  return n!.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDateTime = (iso?: string, fallbackIso?: string) => {
  const s = iso ?? fallbackIso;
  if (!s) return "-";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString("pt-BR");
  } catch {
    return s!;
  }
};

const fmtBank = (bk?: { nome_reduzido?: string; numero_codigo?: string }) => {
  if (!bk) return "-";
  const nome = bk.nome_reduzido ?? "-";
  const cod = bk.numero_codigo ?? "-";
  return `${nome} (${cod})`;
};

export const Transactions = () => {
  const { data, error, isLoading } = useListTransactions();
  const { data: balance, error: balError, isLoading: balLoading } = useAccountBalance();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  // Normaliza: array direto OU { retorno: [] }
  const rows = useMemo<any[]>(() => {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.retorno)) return (data as any).retorno;
    return [];
  }, [data]);

  if (isLoading) return <CardContainer full>Carregando...</CardContainer>;
  if (error) return <CardContainer full>Erro ao carregar transações</CardContainer>;

  // decide qual lado mostrar no modo compacto (somente contraparte)
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

  return (
    <CardContainer full>
      <div className="mb-4 flex items-center justify-between">
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

      {/* Responsivo: sem min-width fixa; tabela ocupa 100% e detalhes expandem por linha */}
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
                <>
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="border px-3 py-2 font-medium">{compact.valor}</td>
                    <td className="border px-3 py-2">{compact.nome}</td>
                    <td className="border px-3 py-2">{compact.doc}</td>
                    <td className="border px-3 py-2">{compact.dataFmt}</td>
                    <td
                      className="cursor-pointer border px-3 py-2 text-gray-500 "
                      onClick={() => toggleExpand(key)}
                    >
                      {isOpen ? <CaretDown size={16} /> : <CaretRight size={16} />}
                    </td>
                  </tr>

                  {isOpen && (
                    <tr key={`${key}-details`}>
                      <td className="border bg-gray-50 px-3 py-3" colSpan={5}>
                        {/* detalhes completos */}
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
                                {fmtTxValue(tx.valor_lancamento ?? tx.valor ?? tx.valor_original)}
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
                                <strong>Ag/Conta:</strong> {tx.agDebtd ?? "-"} / {tx.ctDebtd ?? "-"}
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
                </>
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

      {open && <PixTransferModal onClose={() => setOpen(false)} />}
    </CardContainer>
  );
};
