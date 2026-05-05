type ImportedRow = {
  apelido?: string;
  [key: string]: any;
};

type UserLike = {
  counterparty?: string;
};

const normalize = (value: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const autoFillApelidoFromUsers = <T extends ImportedRow>(
  rows: T[],
  users: UserLike[] = [],
): T[] => {
  return rows.map((row) => {
    const apelidoOriginal = String(row?.apelido ?? "").trim();

    // regra 1: só tenta preencher se tiver @
    if (!apelidoOriginal.includes("@")) {
      return row;
    }

    const matches = users
      .filter((item) => normalize(item?.counterparty ?? "").includes(normalize(apelidoOriginal)))
      .map((item) => String(item?.counterparty ?? "").trim())
      .filter(Boolean);

    // regra 2: só preenche se tiver exatamente 1 resultado
    if (matches.length !== 1) {
      return row;
    }

    return {
      ...row,
      apelido: matches[0],
      apelidoOriginal,
      apelidoAutoPreenchido: true,
    };
  });
};
