/** ======== SANITIZADORES (FRONTEND) ======== */

// TXID (identificador): A–Z/0–9, min 26, máx 35
export const sanitizeTxId = (raw?: string) => {
  const MIN = 26,
    MAX = 35;
  let s = (
    raw && String(raw).trim().length > 0
      ? String(raw)
      : `CT${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
  )
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (s.length < MIN) {
    const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    while (s.length < MIN) s += ABC[Math.floor(Math.random() * ABC.length)];
  }
  if (s.length > MAX) s = s.slice(0, MAX);
  return s;
};

// CPF/CNPJ somente dígitos
export const sanitizeDoc = (s: string) => String(s ?? "").replace(/\D/g, "");

// Valor → "1234.56" (aceita "1.234,56", "1234,56", "1234.5"...)
export const sanitizeValor = (v: string | number) => {
  const raw = String(v ?? "").trim();
  const n = Number(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

// Chave PIX recebedora (trim)
export const sanitizeKey = (s: string) => String(s ?? "").trim();

// Expiração (segundos) segura
export const sanitizeExpiracao = (n?: number) => {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return 3600;
  // (opcional) clamp leve
  return Math.min(Math.max(x, 60), 86400);
};

// Formato (1 ou 2)
export const sanitizeFormato = (f?: number) => (f === 2 ? 2 : 1);

// Texto com trim (mantém null se vazio)
export const sanitizeTextOrNull = (s?: string | null) => {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  return t.length ? t : null;
};
