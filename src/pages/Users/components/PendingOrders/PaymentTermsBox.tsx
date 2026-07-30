import { Copy } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";

type PaymentTerm = {
  nome?: string;
  paymentType?: string | number;
  pix?: string;
  mensagem?: string;
  telefone?: string;
  realName?: string;
  accountNo?: string;
  payMessage?: string;
  mobile?: string;
};

interface PaymentTermsBoxProps {
  title?: string;
  terms?: PaymentTerm[];
}

const isEmpty = (v: unknown) => v === undefined || v === null || String(v).trim() === "";

const copyToClipboard = async (text: string) => {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt("Copie o conteúdo:", text);
  }
};

const normalize = (t: PaymentTerm) =>
  [
    { label: "Nome", value: t.nome ?? t.realName ?? "" },
    { label: "Pix", value: t.pix ?? t.accountNo ?? "" },
    { label: "Mensagem", value: t.mensagem ?? t.payMessage ?? "" },
    { label: "Telefone", value: t.telefone ?? t.mobile ?? "" },
    { label: "Tipo", value: t.paymentType !== undefined ? String(t.paymentType) : "" },
  ].filter((row) => !isEmpty(row.value));

const copyAll = (t: PaymentTerm) =>
  normalize(t)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");

const FieldRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex w-full min-w-0 items-start justify-between gap-2 rounded-6 border border-gray-100 px-2 py-1">
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="text-[11px] font-semibold text-gray-600">{label}</span>
      <span className="break-words text-xs text-gray-900 sm:text-sm">{value}</span>
    </div>

    <button
      type="button"
      className="shrink-0 rounded-6 border border-gray-200 bg-white p-2 hover:bg-gray-100"
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(value);
      }}
      title="Copiar"
    >
      <Copy width={16} height={16} weight="duotone" />
    </button>
  </div>
);

export const PaymentTermsBox = ({
  terms,
  title = "Dados para pagamento",
}: PaymentTermsBoxProps) => {
  const [open, setOpen] = useState(false);
  const safeTerms = useMemo(() => (Array.isArray(terms) ? terms : []), [terms]);

  if (!safeTerms.length) return null;

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white md:w-96">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex flex-col">
          <span className="truncate text-sm font-semibold text-gray-900">{title}</span>
          <span className="text-xs text-gray-500">
            {open ? "Clique para recolher" : "Clique para expandir"}
          </span>
        </div>
        <span className="shrink-0 text-xs font-semibold text-gray-600">{open ? "▲" : "▼"}</span>
      </button>

      <div className={`overflow-hidden transition-all ${open ? "max-h-[2000px]" : "max-h-0"}`}>
        <div className="grid gap-2 p-3">
          {safeTerms.map((term, index) => {
            const rows = normalize(term);
            if (!rows.length) return null;

            return (
              <div
                key={`${term.pix ?? term.accountNo ?? index}-${index}`}
                className="w-full rounded-xl border border-gray-100 p-2"
              >
                <div className="mb-2 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-600">Recebedor</div>
                    <div className="break-words text-sm font-semibold text-gray-900">
                      {term.nome ?? "—"}
                    </div>
                  </div>

                  <Button
                    className="rounded-6 bg-blue-500 px-3 py-1.5 text-xs text-white"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      copyToClipboard(copyAll(term));
                    }}
                    title="Copiar pagamentos"
                  >
                    <div className="flex items-center gap-2">
                      <Copy width={16} height={16} weight="duotone" />
                      <span className="hidden sm:inline">Copiar Pagamentos</span>
                    </div>
                  </Button>
                </div>

                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {rows.map((row) => (
                    <FieldRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
