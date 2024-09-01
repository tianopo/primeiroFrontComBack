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
  const excelEpoch = new Date(Date.UTC(1900, 0, 1));

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
