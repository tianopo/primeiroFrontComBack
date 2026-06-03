export const parseBRL = (v: any): number => {
  if (typeof v === "number") return v;

  let raw = String(v).replace("R$", "").trim();
  raw = raw.replace(/\s/g, "");

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    // Formato pt-BR: 1.234,56
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else if (hasComma && !hasDot) {
    // Formato: 1234,56
    raw = raw.replace(",", ".");
  } else {
    // Só ponto ou só dígitos: 1234.56 ou 1234 (mantém)
  }

  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
};

export const parseNum = (v: any): number => {
  if (typeof v === "number") return v;
  return parseFloat(String(v).replace(",", "."));
};

export const toBRDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const normalizeVendaCodigo = (raw: unknown): string => {
  let v = String(raw ?? "").trim();

  // remove wrappers comuns do Excel
  v = v
    .replace(/^="(.+)"$/, "$1")
    .replace(/^'(.*)$/, "$1")
    .trim();

  // notação científica: "1,5738E+18" ou "1.5738e+18"
  const m = v.match(/^(\d+(?:[.,]\d+)?)[eE]\+?(\d+)$/);
  if (m) {
    const mantissa = m[1].replace(",", "."); // usa ponto internamente
    const exp = parseInt(m[2], 10);

    const [intPart, fracPart = ""] = mantissa.split(".");
    const digits = (intPart + fracPart).replace(/^0+/, "") || "0";
    const decPlaces = fracPart.length;

    const zeros = exp - decPlaces;
    if (zeros >= 0) return digits + "0".repeat(zeros);

    // caso raro (não deveria ocorrer em IDs): mantém apenas parte inteira possível
    const cut = digits.length + zeros;
    return cut > 0 ? digits.slice(0, cut) : "0";
  }

  // se vier com vírgulas/perfis estranhos, mantém só letras+digitos (remove separadores)
  return v.replace(/[^\da-zA-Z]/g, "");
};
