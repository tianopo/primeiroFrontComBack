import { Copy } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";

export type PaymentTermLite = {
  realName?: string;
  paymentType?: number;
  accountNo?: string;
  payMessage?: string;
  mobile?: string;
  paymentExt1?: string;
  paymentExt2?: string;
  paymentExt3?: string;
  paymentExt4?: string;
  paymentExt5?: string;
  paymentExt6?: string;
};

const isEmpty = (v: any) => v === undefined || v === null || String(v).trim() === "";

const copyToClipboard = async (text: string) => {
  try {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt("Copie o conteúdo:", text);
  }
};

const FieldRow = ({ label, value }: { label: string; value: string }) => {
  if (isEmpty(value)) return null;

  return (
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
};

const normalize = (t: PaymentTermLite) => {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Nome (RealName)", value: t.realName ?? "" },
    {
      label: "Tipo de pagamento (PaymentType)",
      value: t.paymentType !== undefined ? String(t.paymentType) : "",
    },
    { label: "Chave/Conta (AccountNo)", value: t.accountNo ?? "" },
    { label: "Mensagem (PayMessage)", value: t.payMessage ?? "" },
    { label: "Telefone (Mobile)", value: t.mobile ?? "" },
    { label: "Banco / Ext 1 (PaymentExt1)", value: t.paymentExt1 ?? "" },
    { label: "Ext 2 (PaymentExt2)", value: t.paymentExt2 ?? "" },
    { label: "CPF/CNPJ / Ext 3 (PaymentExt3)", value: t.paymentExt3 ?? "" },
    { label: "Ext 4 (PaymentExt4)", value: t.paymentExt4 ?? "" },
    { label: "Ext 5 (PaymentExt5)", value: t.paymentExt5 ?? "" },
    { label: "Ext 6 (PaymentExt6)", value: t.paymentExt6 ?? "" },
  ];

  return rows.filter((r) => !isEmpty(r.value));
};

const buildCopyAll = (t: PaymentTermLite) => {
  const rows = normalize(t);
  return rows.map((r) => `${r.label}: ${r.value}`).join("\n");
};

export const PaymentTermsBox = ({
  terms,
  title = "Dados para pagamento",
}: {
  terms?: PaymentTermLite[];
  title?: string;
}) => {
  const [open, setOpen] = useState(false);

  const safeTerms = useMemo(() => (Array.isArray(terms) ? terms : []), [terms]);
  if (!safeTerms.length) return null;

  return (
    <div className="mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white md:w-96">
      {/* Header clicável */}
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

      {/* Conteúdo */}
      <div className={`overflow-hidden transition-all ${open ? "max-h-[2000px]" : "max-h-0"}`}>
        <div className="grid gap-2 p-3">
          {safeTerms.map((t, idx) => {
            const rows = normalize(t);
            if (!rows.length) return null;

            const name = t.realName ?? "";

            return (
              <div key={idx} className="w-full rounded-xl border border-gray-100 p-2">
                {/* Header do termo (responsivo) */}
                <div className="mb-2 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-600">Recebedor</div>
                    <div className="break-words text-sm font-semibold text-gray-900">
                      {name || "—"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-6 bg-blue-500 px-3 py-1.5 text-xs text-white"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        copyToClipboard(buildCopyAll(t));
                      }}
                      title="Copiar Pagamentos"
                    >
                      <div className="flex items-center gap-2">
                        <Copy width={16} height={16} weight="duotone" />
                        {/* some no mobile pra não alargar o card */}
                        <span className="hidden sm:inline">Copiar Pagamentos</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Campos: 1 coluna no mobile, 2 no desktop */}
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {rows.map((r) => (
                    <FieldRow key={r.label} label={r.label} value={r.value} />
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
