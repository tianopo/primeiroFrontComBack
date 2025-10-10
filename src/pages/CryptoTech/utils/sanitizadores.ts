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

// Formato (1 ou 2)
export const sanitizeFormato = (f?: number) => (f === 2 ? 2 : 1);

// Texto com trim (mantém null se vazio)
export const sanitizeTextOrNull = (s?: string | null) => {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  return t.length ? t : null;
};

export const dataUrlFromBase64 = (b64?: string | null) =>
  !b64 ? "" : b64.startsWith("data:image") ? b64 : `data:image/png;base64,${b64}`;
export const dataUrlFromSvg = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
export const safeAtob = (s: string) => {
  try {
    return atob(s);
  } catch {
    return "";
  }
};

export const pickQrFields = (ret: any) => {
  const payload =
    ret?.qrcode_payload ??
    ret?.copia_e_cola ??
    ret?.payload ??
    (ret?.payloadBase64 ? safeAtob(ret.payloadBase64) : "") ??
    "";
  const raw =
    ret?.imagem ??
    ret?.imagem_base64 ??
    ret?.qrCodeBase64 ??
    ret?.qrCodeImageBase64 ??
    ret?.qrcode_png_base64 ??
    ret?.imagemPNGBase64 ??
    ret?.imagemBase64 ??
    ret?.qr_image ??
    ret?.qrImage ??
    ret?.image ??
    "";
  if (typeof raw === "string" && raw.trim().startsWith("<svg"))
    return { payload, imgDataUrl: dataUrlFromSvg(raw) };
  if (typeof raw === "string" && raw.startsWith("data:image")) return { payload, imgDataUrl: raw };
  if (typeof raw === "string" && /^https?:\/\//.test(raw)) return { payload, imgDataUrl: raw };
  return { payload, imgDataUrl: typeof raw === "string" && raw ? dataUrlFromBase64(raw) : "" };
};
