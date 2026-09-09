const normalize = (value: unknown) => {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const cleanValue = (value: unknown) => {
  return String(value ?? "")
    .replace(/\r/g, "")
    .replace(/\n/g, " ")
    .replace(/Exchange:.*/i, "")
    .replace(/Ordem:.*/i, "")
    .replace(/Documento:.*/i, "")
    .replace(/Nome:.*/i, "")
    .replace(/[|;]+$/g, "")
    .trim();
};

export function extractApelidosFromError(message: string): Set<string> {
  const set = new Set<string>();

  const text = String(message ?? "");
  const normalizedText = normalize(text);

  const hasUserError =
    normalizedText.includes("apelido") ||
    normalizedText.includes("usuario nao encontrado") ||
    normalizedText.includes("usuarios nao encontrados") ||
    normalizedText.includes("nao cadastrado") ||
    normalizedText.includes("nao encontrado");

  if (!hasUserError) return set;

  const regexList = [
    /Apelido:\s*([^|\n\r;]+)/gi,
    /Apelidos?:\s*([^|\n\r;]+)/gi,
    /Counterparty:\s*([^|\n\r;]+)/gi,
    /Usu[aá]rio\s+n[aã]o\s+encontrado:\s*([^|\n\r;]+)/gi,
    /Usu[aá]rios\s+n[aã]o\s+encontrados:\s*([^|\n\r;]+)/gi,
    /Usu[aá]rio\s+n[aã]o\s+cadastrado:\s*([^|\n\r;]+)/gi,
    /Apelido\s+([^|\n\r;]+?)\s+n[aã]o\s+(?:cadastrado|encontrado)/gi,
  ];

  for (const regex of regexList) {
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text))) {
      const value = cleanValue(match[1]);

      if (value) {
        set.add(value);
      }
    }
  }

  return set;
}
