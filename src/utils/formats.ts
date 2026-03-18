// validadors to Input

export const formatPhone = (value: string): string => {
  let input = value.replace(/\D/g, "");
  if (input.length > 11) {
    input = input.slice(0, 11);
  }
  if (input.length > 0) {
    input = input.replace(/^(\d{2})(\d)/, "($1) $2");
  }

  if (input.length > 6) {
    input = input.replace(/(\d{4})(\d{0,4})$/, "$1-$2");
  }

  if (input.endsWith("-")) {
    input = input.slice(0, -1);
  }
  return input;
};

export const formatCep = (value: string): string => {
  let input = value.replace(/\D/g, "");
  if (input.length > 8) {
    input = input.slice(0, 8);
  }
  if (input.length > 0) {
    input = input.replace(/^(\d{2})(\d)/, "$1.$2");
  }

  if (input.length > 4) {
    input = input.replace(/(\d{3})(\d)/, "$1-$2");
  }

  return input;
};

export const formatRG = (value: string): string => {
  let input = value.replace(/\D/g, "");
  if (input.length > 9) {
    input = input.slice(0, 9);
  }
  if (input.length > 0) {
    input = input.replace(/^(\d{2})(\d)/, "$1.$2");
  }

  if (input.length > 5) {
    input = input.replace(/(\d{3})(\d)/, "$1.$2");
  }

  if (input.length > 8) {
    input = input.replace(/(\d{3})(\d{0,1})$/, "$1-$2");
  }

  if (input.endsWith("-")) {
    input = input.slice(0, -1);
  }

  return input;
};

export const formatCPF = (value: string): string => {
  let input = value.replace(/\D/g, "");
  if (input.length > 11) {
    input = input.slice(0, 11);
  }
  if (input.length > 0) {
    input = input.replace(/^(\d{3})(\d)/, "$1.$2");
  }
  if (input.length > 6) {
    input = input.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  }
  if (input.length > 9) {
    input = input.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  if (input.endsWith("-")) {
    input = input.slice(0, -1);
  }
  return input;
};

export const formatCNPJ = (value: string): string => {
  let input = value.replace(/\D/g, "");
  if (input.length > 14) {
    input = input.slice(0, 14);
  }
  if (input.length > 2) {
    input = input.replace(/^(\d{2})(\d)/, "$1.$2");
  }
  if (input.length > 5) {
    input = input.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  }
  if (input.length > 8) {
    input = input.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
  }
  if (input.length > 12) {
    input = input.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
  }
  if (input.endsWith("-")) {
    input = input.slice(0, -1);
  }
  return input;
};

export const formatCPFOrCNPJ = (value: string): string => {
  let input = value.replace(/\D/g, "");

  if (input.length > 14) {
    input = input.slice(0, 14);
  }

  if (input.length <= 11) {
    if (input.length > 0) {
      input = input.replace(/^(\d{3})(\d)/, "$1.$2");
    }
    if (input.length > 6) {
      input = input.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    }
    if (input.length > 9) {
      input = input.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    }

    if (input.endsWith("-")) {
      input = input.slice(0, -1);
    }
  } else {
    if (input.length > 2) {
      input = input.replace(/^(\d{2})(\d)/, "$1.$2");
    }
    if (input.length > 5) {
      input = input.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    }
    if (input.length > 8) {
      input = input.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4");
    }
    if (input.length > 12) {
      input = input.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }
    if (input.endsWith("-")) {
      input = input.slice(0, -1);
    }
  }

  return input;
};

export const formatState = (value: string): string => {
  let input = value.replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (input.length > 2) {
    input = input.slice(0, 2);
  }

  return input;
};

export const formatCurrency = (value: string): string => {
  let input = value.replace(/[^0-9,]/g, "");
  if (input.length > 2) {
    input = input.replace(/,/g, "");
    input = input.replace(/(\d*)(\d{2})$/, "$1,$2");
  }
  if (input.length > 0) {
    input = `R$ ${input}`;
  }
  input = input.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  if (input.endsWith(",")) {
    input = input.slice(0, -1);
  }

  return input;
};

export const formatCurrencyNoReal = (value: string): string => {
  let input = value.replace(/[^0-9,]/g, "");
  if (input.length > 2) {
    input = input.replace(/,/g, "");
    input = input.replace(/(\d*)(\d{2})$/, "$1,$2");
  }
  return input;
};

export const formatDateHour = (value: string): string => {
  let input = value.replace(/[^0-9]/g, "");
  if (input.length <= 2) {
    input = input.replace(/^(\d{1,2})/, "$1");
  } else if (input.length <= 4) {
    input = input.replace(/^(\d{2})(\d{1,2})/, "$1/$2");
  } else if (input.length <= 8) {
    input = input.replace(/^(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
  } else if (input.length <= 10) {
    input = input.replace(/^(\d{2})(\d{2})(\d{4})(\d{1,2})/, "$1/$2/$3 $4");
  } else if (input.length < 12) {
    input = input.replace(/^(\d{2})(\d{2})(\d{4})(\d{2})(\d{1,2})/, "$1/$2/$3 $4:$5");
  } else if (input.length === 12) {
    input = input.replace(/^(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})/, "$1/$2/$3 $4:$5");
  } else if (input.length > 12) {
    input = input = input
      .slice(0, -1)
      .replace(/^(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})/, "$1/$2/$3 $4:$5");
  }
  return input;
};

export const excelDateToJSDate = (serial: number) => {
  const excelEpoch = new Date(Date.UTC(1900, 0, 0));

  const jsDate = new Date(excelEpoch.getTime() + (serial - 1) * 86400 * 1000);

  return jsDate.toISOString().slice(0, 19).replace("T", " ");
};

export const formatDateTime = (value: string): string => {
  let input = value.replace(/\D/g, "");
  if (input.length > 14) {
    input = input.slice(0, 14);
  }
  if (input.length > 4) {
    input = input.replace(/^(\d{4})(\d)/, "$1-$2");
  }
  if (input.length > 7) {
    input = input.replace(/^(\d{4})-(\d{2})(\d)/, "$1-$2-$3");
  }
  if (input.length > 10) {
    input = input.replace(/^(\d{4})-(\d{2})-(\d{2})(\d)/, "$1-$2-$3 $4");
  }
  if (input.length > 13) {
    input = input.replace(/^(\d{4})-(\d{2})-(\d{2}) (\d{2})(\d)/, "$1-$2-$3 $4:$5");
  }
  if (input.length > 15) {
    input = input.replace(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(\d)/, "$1-$2-$3 $4:$5:$6");
  }

  return input;
};

export const maskDocument = (doc?: string) => {
  const digits = String(doc ?? "").replace(/\D/g, "");

  // ✅ máscara apenas para CPF
  if (digits.length === 11) return `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;

  // ✅ CNPJ sem censura (só formata bonitinho se tiver 14 dígitos)
  if (digits.length === 14) return formatCNPJ(digits);

  return doc ?? "-";
};

export const formatBRL = (v: number) =>
  Math.abs(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatTimestampBR = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  // fuso SP e formato: DD/MM/YYYY, HH:MM:SS
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const dd = pick("day");
  const mm = pick("month");
  const yyyy = pick("year");
  const hh = pick("hour");
  const mi = pick("minute");
  const ss = pick("second");

  return `${dd}/${mm}/${yyyy}, ${hh}:${mi}:${ss}`;
};
