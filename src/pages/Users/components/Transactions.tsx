import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useState } from "react";
import { CardContainer } from "src/components/Layout/CardContainer";
import { formatCurrency } from "src/utils/formats"; // você já usa em outras telas
import { useAccountBalance } from "../hooks/fiducia/useAccountBalance";
import { useListTransactions } from "../hooks/fiducia/useListTransactions";
import { PixTransferModal } from "./PixTransferModal";

export const Transactions = () => {
  const { data, error, isLoading } = useListTransactions();
  const { data: balance, error: balError, isLoading: balLoading } = useAccountBalance();
  const [open, setOpen] = useState(false);

  if (isLoading) return <CardContainer full>Carregando...</CardContainer>;
  if (error) return <CardContainer full>Erro ao carregar transações</CardContainer>;

  const fmt = (v?: number) => (typeof v === "number" ? formatCurrency(String(v)) : "-");

  return (
    <CardContainer full>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-28 font-bold">TRANSAÇÕES</h3>

        {/* Bloco de saldo à direita */}
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
                <strong>Saldo:</strong> {fmt(balance.Saldo)}
              </span>
              <span className="rounded-6 bg-gray-100 px-3 py-1 text-sm">
                <strong>Crédito:</strong> {fmt(balance.Credito)}
              </span>
              <span className="rounded-6 bg-gray-100 px-3 py-1 text-sm">
                <strong>Débito:</strong> {fmt(balance.Debito)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Data</th>
              <th className="border px-4 py-2 text-left">Valor</th>
              <th className="border px-4 py-2 text-left">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {data?.retorno?.map((tx: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{tx.data || tx.created_at}</td>
                <td className="border px-4 py-2">
                  {formatCurrency(String(tx.valor || tx.valor_original))}
                </td>
                <td className="border px-4 py-2">{tx.descricao || tx.historico || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && <PixTransferModal onClose={() => setOpen(false)} />}
    </CardContainer>
  );
};
