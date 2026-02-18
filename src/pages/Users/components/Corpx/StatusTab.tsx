import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { useCorpxTransactionStatus } from "../../hooks/Corpx/useCorpxTransactionStatus";

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 py-2 last:border-b-0">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <span className="break-all text-sm text-gray-900">{value ?? "-"}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-gray-200 p-3">
    <div className="mb-2 text-sm font-semibold text-gray-900">{title}</div>
    <div className="flex flex-col">{children}</div>
  </div>
);

const money = (amount?: number, currency?: string) => {
  if (typeof amount !== "number") return "-";
  const cur = currency ?? "BRL";
  // amount vem em centavos ou valor? no seu exemplo parece inteiro (1000 = R$ 10,00?) — não vou assumir.
  // Se você quiser formatar como centavos, me diga que eu adapto.
  return `${amount} ${cur}`;
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR");
};

export const StatusTab = () => {
  const [endToEndId, setEndToEndId] = useState("");
  const { mutate, data, isPending } = useCorpxTransactionStatus();

  const normalized = useMemo(() => {
    const d: any = data ?? {};
    return {
      transactionId: d.transactionId,
      endToEndId: d.endToEndId,
      identifier: d.identifier,
      status: d.status,
      type: d.type,
      transactionType: d.transactionType,
      method: d.method,
      amount: d.amount,
      currency: d.currency,
      transactionDate: d.transactionDate,

      counterparty: d.counterparty ?? {},
      payer: d.payer ?? {},
      payee: d.payee ?? {},
    };
  }, [data]);

  return (
    <div className="grid w-full gap-3">
      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-2 font-semibold">Consultar Status por E2E</div>
        <div className="flex flex-col gap-1.5">
          <input
            value={endToEndId}
            onChange={(e) => setEndToEndId(e.target.value)}
            placeholder="EndToEndId (E...)"
            className="w-full rounded-6 border border-gray-200 px-3 py-2"
          />
          <Button disabled={!endToEndId || isPending} onClick={() => mutate({ endToEndId })}>
            {isPending ? "Consultando..." : "Consultar"}
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Dica: cole o E2E completo (ex.: <span className="font-mono">E003603052026...</span>)
        </div>
        <div className="mb-2 font-semibold">Resultado</div>

        {!data ? (
          <div className="text-sm text-gray-600">Sem consulta ainda.</div>
        ) : (
          <div className="grid gap-3">
            <Section title="Transação">
              <Row label="Transaction ID" value={normalized.transactionId} />
              <Row label="EndToEnd ID (E2E)" value={normalized.endToEndId} />
              <Row label="Identifier" value={normalized.identifier} />
              <Row label="Status" value={normalized.status} />
              <Row label="Tipo" value={normalized.type} />
              <Row label="Transaction Type" value={normalized.transactionType} />
              <Row label="Método" value={normalized.method} />
              <Row label="Valor" value={money(normalized.amount, normalized.currency)} />
              <Row label="Data/Hora" value={formatDate(normalized.transactionDate)} />
            </Section>

            <Section title="Contraparte (Counterparty)">
              <Row label="Nome" value={normalized.counterparty?.name} />
              <Row label="Documento" value={normalized.counterparty?.document} />
              <Row label="Banco (Código)" value={normalized.counterparty?.bankCode} />
              <Row label="Agência" value={normalized.counterparty?.branch} />
              <Row label="Conta" value={normalized.counterparty?.account} />
            </Section>

            <Section title="Pagador (Payer)">
              <Row label="Nome" value={normalized.payer?.name} />
              <Row label="Documento" value={normalized.payer?.document} />
              <Row label="Banco (Código)" value={normalized.payer?.bankCode} />
              <Row label="Agência" value={normalized.payer?.branch} />
              <Row label="Conta" value={normalized.payer?.account} />
            </Section>

            <Section title="Recebedor (Payee)">
              <Row label="Documento" value={normalized.payee?.document} />
              <Row label="Banco (Código)" value={normalized.payee?.bankCode} />
              <Row label="Agência" value={normalized.payee?.branch} />
              <Row label="Conta" value={normalized.payee?.account} />
              <Row label="Chave PIX" value={normalized.payee?.pixKey} />
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};
