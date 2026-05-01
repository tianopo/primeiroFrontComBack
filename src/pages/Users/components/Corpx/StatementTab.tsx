import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { Modal } from "src/components/Modal/Modal";
import { generateStatementReceipt } from "src/pages/Home/config/handleReceipt";
import { GowdStatementItem } from "../../hooks/Gowd/useGowdStatement";

const formatBRL = (v: number) =>
  Number(v).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString("pt-BR");
};

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex min-h-[34px] items-center justify-between gap-2 border-b border-gray-100 px-2 py-1 last:border-b-0">
    <span className="text-[11px] font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

type Props = {
  statementQ: any;
  startDate: string;
  endDate: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  onApply: () => void;
  page: number;
  size: number;
  onPrev: () => void;
  onNext: () => void;
};

export const StatementTab = ({
  statementQ,
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  onApply,
  page,
  size,
  onPrev,
  onNext,
}: Props) => {
  const [selected, setSelected] = useState<GowdStatementItem | null>(null);

  const items = useMemo(() => {
    const rawItems = statementQ.data?.items ?? [];

    return rawItems.filter((item: GowdStatementItem) =>
      ["LOAD", "TRANSFER"].includes(String(item?.operation ?? "").toUpperCase()),
    );
  }, [statementQ.data]);

  const downloadReceipt = async (it: any) => {
    const base64 = await generateStatementReceipt(it);
    if (!base64) return;

    const e2e = String(it?.endToEndId || it?.transactionId || it?.orderId || "statement");
    const safe = e2e.replace(/[^\w-]+/g, "_").slice(0, 50);

    const a = document.createElement("a");
    a.href = base64;
    a.download = `recibo_${safe}.png`;
    a.click();
  };

  const getDirectionStyles = (operation?: string) => {
    const op = String(operation ?? "").toUpperCase();

    if (op === "TRANSFER") {
      return {
        rowClass: "bg-red-50 hover:bg-red-100",
        amountClass: "text-red-700",
      };
    }

    if (op === "LOAD") {
      return {
        rowClass: "bg-green-50 hover:bg-green-100",
        amountClass: "text-green-700",
      };
    }

    return {
      rowClass: "hover:bg-gray-50",
      amountClass: "text-gray-900",
    };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-sm">
          Data inicial
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStart(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>

        <label className="text-sm">
          Data final
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChangeEnd(e.target.value)}
            className="mt-1 w-full rounded-6 border border-gray-200 px-3 py-2"
          />
        </label>

        <div className="flex items-end">
          <Button onClick={onApply}>Filtrar</Button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Documento</th>
              <th className="px-3 py-2">Valor</th>
            </tr>
          </thead>

          <tbody>
            {statementQ.isLoading ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              items.map((item: GowdStatementItem) => {
                const { rowClass, amountClass } = getDirectionStyles(item.operation);

                return (
                  <tr
                    key={item.transactionId ?? item.identifier ?? item.endToEndId}
                    className={`border-t border-gray-100 ${rowClass}`}
                  >
                    <td className="cursor-pointer px-3 py-2" onClick={() => setSelected(item)}>
                      {formatDateTime(item.timestamp)}
                    </td>

                    <td className="cursor-pointer px-3 py-2" onClick={() => setSelected(item)}>
                      {item.payer?.name ?? "-"}
                    </td>

                    <td className="cursor-pointer px-3 py-2" onClick={() => setSelected(item)}>
                      {item.payer?.document ?? "-"}
                    </td>

                    <td
                      className={`cursor-pointer px-3 py-2 font-semibold ${amountClass}`}
                      onClick={() => setSelected(item)}
                    >
                      {formatBRL(Number(item.amount ?? 0))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Página {page} • {items.length} itens exibidos
        </span>

        <div className="flex gap-2">
          <Button onClick={onPrev} disabled={page <= 1}>
            Anterior
          </Button>
          <Button onClick={onNext} disabled={items.length < size}>
            Próxima
          </Button>
        </div>
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)} fit>
          <div className="flex flex-row justify-between">
            <h3 className="w-full text-xl font-semibold">Detalhes da transação</h3>
            <Button onClick={() => downloadReceipt(selected)}>Baixar recibo</Button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 p-2">
            <Row label="Data" value={formatDateTime(selected.timestamp)} />
            <Row label="Valor" value={formatBRL(Number(selected.amount ?? 0))} />
            <Row label="Tipo" value={selected.transactionType ?? selected.operation} />
            <Row label="OrderId" value={selected.orderId} />
            <Row label="Code" value={selected.code} />
            <Row label="TransactionId" value={selected.transactionId} />
            <Row label="EndToEndId" value={selected.endToEndId} />
            <Row label="Nome" value={selected.payer?.name} />
            <Row label="Documento" value={selected.payer?.document} />
            <Row label="Banco" value={selected.payer?.bankName} />
            <Row label="ISPB" value={selected.payer?.bankCode} />
            <Row label="Agência" value={selected.payer?.branch} />
            <Row label="Conta" value={selected.payer?.account} />
          </div>
        </Modal>
      )}
    </div>
  );
};
