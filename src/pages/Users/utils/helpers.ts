export const MY_CNPJ = "55636113000170";

// Saldo: se vier em centavos, use (v/100) aqui.
export const fmtBalance = (v?: number) => {
  if (typeof v !== "number" || !Number.isFinite(v)) return "-";
  const reais = v; // ou v/100
  return reais.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const fmtTxValue = (v: unknown) => {
  if (v === null || v === undefined) return "-";
  let n: number | null = null;
  if (typeof v === "number") n = v;
  else if (typeof v === "string") n = Number(v.replace(",", "."));
  if (!Number.isFinite(n)) return "-";
  return n!.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const fmtDateTime = (iso?: string, fallbackIso?: string) => {
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

export const fmtBank = (bk?: { nome_reduzido?: string; numero_codigo?: string }) => {
  if (!bk) return "-";
  const nome = bk.nome_reduzido ?? "-";
  const cod = bk.numero_codigo ?? "-";
  return `${nome} (${cod})`;
};

export const rowTone = (t?: string) =>
  t === "D"
    ? "bg-red-50 hover:bg-red-100"
    : t === "C"
      ? "bg-green-50 hover:bg-green-100"
      : "hover:bg-gray-50";

export const valueTone = (t?: string) =>
  t === "D" ? "text-red-700" : t === "C" ? "text-green-700" : "";

export const detailsTone = (t?: string) =>
  t === "D"
    ? "bg-red-50/60 border-red-200"
    : t === "C"
      ? "bg-green-50/60 border-green-200"
      : "bg-gray-50 border-gray-200";

export const toBRDate = (formatted?: string) => {
  if (!formatted) return "-";
  // exemplos aceitos:
  // "2026-02-20 10:54:31"
  // "2026-02-20T10:54:31"
  const datePart = formatted.split("T")[0]?.split(" ")[0] ?? formatted;
  const [yyyy, mm, dd] = datePart.split("-");
  if (!yyyy || !mm || !dd) return formatted;
  return `${dd}/${mm}/${yyyy}`;
};

export const parseDateParts = (raw: string) => {
  if (!raw) return { dia: "-", mesExtenso: "-", ano: "-" };

  let d: Date | null = null;

  // "DD/MM/YYYY"
  if (/^\d{2}\/\d{2}\/\d{4}/.test(raw)) {
    const [dd, mm, yyyy] = raw.split("/");
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  // "YYYY-MM-DD ..." ou "YYYY-MM-DD"
  else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const onlyDate = raw.split("T")[0]?.split(" ")[0] ?? raw;
    const [yyyy, mm, dd] = onlyDate.split("-");
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }

  if (!d || Number.isNaN(d.getTime())) return { dia: "-", mesExtenso: "-", ano: "-" };

  const dia = String(d.getDate()).padStart(2, "0");
  const ano = String(d.getFullYear());
  const mesExtenso = d.toLocaleDateString("pt-BR", { month: "long" });

  return { dia, mesExtenso, ano };
};
