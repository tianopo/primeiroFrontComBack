export const parseDateToYYYYMMDD = (value: string) => {
  const s = String(value || "").trim();

  // caso clássico: dd/mm/yyyy
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return `${yyyy}${mm}${dd}`;
  }

  const digits = s.replace(/\D/g, "");
  if (digits.length < 8) return "";

  // tenta YYYYMMDD (validando mes/dia)
  const y = Number(digits.slice(0, 4));
  const mo = Number(digits.slice(4, 6));
  const d = Number(digits.slice(6, 8));
  if (y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
    return digits.slice(0, 8);
  }

  // fallback: DDMMAAAA (validando mes/dia/ano)
  const d2 = Number(digits.slice(0, 2));
  const mo2 = Number(digits.slice(2, 4));
  const y2 = Number(digits.slice(4, 8));
  if (y2 >= 1900 && y2 <= 2100 && mo2 >= 1 && mo2 <= 12 && d2 >= 1 && d2 <= 31) {
    return `${digits.slice(4, 8)}${digits.slice(2, 4)}${digits.slice(0, 2)}`;
  }

  return "";
};
