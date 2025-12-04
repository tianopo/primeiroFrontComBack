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
