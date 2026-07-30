type DeCriptoAcesso = string | null | undefined;
type DeCriptoRecordType = "0110" | "0120";

type DeCriptoTransaction = {
  tipo?: "compras" | "vendas" | string;
  numeroOrdem?: string | number;
  dataHora?: string;
  data?: string;
  exchange?: string;
  ativo?: string;
  quantidade?: string | number;
  valor?: string | number;
  taxa?: string | number;
  taxas?: string | number;
  User?: {
    name?: string;
    document?: string;
    country?: string;
    pais?: string;
    ni?: string;
    address?: string;
    endereco?: string;
  };
  user?: {
    name?: string;
    document?: string;
    country?: string;
    pais?: string;
    ni?: string;
    address?: string;
    endereco?: string;
  };
};

type DeCriptoParty = {
  name?: string;
  document?: string;
  pais?: string;
  country?: string;
  ni?: string;
  endereco?: string;
  address?: string;
  plataforma?: string;
  tipoNI?: string;
};

type HandleCompraVendaDeCriptoOptions = {
  /**
   * Quando true, gera somente os registros 0120, ou seja,
   * somente as vendas feitas pelo declarante.
   *
   * Isso respeita o acesso:
   * - Master/Cryptotech: item.tipo === "vendas"
   * - User: item.tipo === "compras", porque nesse caso o usuário vendeu para a Cryptotech
   */
  onlyDeclaredSales?: boolean;

  /**
   * Dados da Cryptotech usados como contraparte quando o acesso é User
   * e a operação foi feita diretamente com CRYPTOTECH, fora de corretora.
   */
  cryptotechParty?: DeCriptoParty;

  filePrefix?: string;
};

const DEFAULT_CRYPTOTECH_PARTY: Required<Pick<DeCriptoParty, "name" | "document" | "pais">> = {
  name: "CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA",
  document: "55.636.113/0001-70",
  pais: "BR",
};

const onlyDigits = (value: unknown) => {
  return String(value ?? "").replace(/\D/g, "");
};

const sanitizeField = (value: unknown, maxLength = 255) => {
  return String(value ?? "")
    .replace(/[|\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
};

const sanitizeCountry = (value: unknown, fallback = "BR") => {
  const country = sanitizeField(value, 2).toUpperCase();
  return country.length === 2 ? country : fallback;
};

const normalizeExchangeName = (value: unknown) => {
  return sanitizeField(String(value ?? "").split(/\s+/)[0] || "", 60).toUpperCase();
};

const isCryptotechExchange = (exchange: unknown) => {
  return normalizeExchangeName(exchange) === "CRYPTOTECH";
};

const parseNumberSafe = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const normalized = raw
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatValorDeCripto = (value: unknown, decimals = 2) => {
  return parseNumberSafe(value).toFixed(decimals).replace(".", ",");
};

const formatQuantidadeDeCripto = (value: unknown) => {
  return parseNumberSafe(value).toFixed(10).replace(".", ",");
};

const resolveOperacaoData = (item: DeCriptoTransaction) => {
  const raw = String(item.dataHora ?? item.data ?? "").trim();

  // Aceita "YYYY-MM-DD HH:mm:ss" ou "YYYY-MM-DDTHH:mm:ss"
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${dd}${mm}${yyyy}`;
  }

  // Aceita "DD/MM/YYYY" ou "DD-MM-YYYY"
  const brMatch = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    return `${dd}${mm}${yyyy}`;
  }

  return "";
};

/**
 * Na base atual, item.tipo está na visão da Cryptotech:
 * - compras: Cryptotech comprou do usuário
 * - vendas: Cryptotech vendeu para o usuário
 *
 * Para acesso User, a visão precisa inverter:
 * - se a Cryptotech comprou, o usuário vendeu => 0120
 * - se a Cryptotech vendeu, o usuário comprou => 0110
 */
const resolveDeCriptoRecordType = (
  transaction: DeCriptoTransaction,
  acesso?: DeCriptoAcesso,
): DeCriptoRecordType | null => {
  const tipo = String(transaction?.tipo ?? "")
    .trim()
    .toLowerCase();
  if (tipo !== "compras" && tipo !== "vendas") return null;

  const isUserAccess = acesso === "User";

  if (isUserAccess) {
    return tipo === "compras" ? "0120" : "0110";
  }

  return tipo === "compras" ? "0110" : "0120";
};

const resolvePartyFromTransaction = (item: DeCriptoTransaction): DeCriptoParty => {
  const user = item.User ?? item.user ?? {};

  return {
    name: user.name,
    document: user.document,
    pais: user.pais ?? user.country ?? "BR",
    ni: user.ni,
    endereco: user.endereco ?? user.address,
  };
};

const resolveCounterpartyForDirectOperation = (
  item: DeCriptoTransaction,
  acesso?: DeCriptoAcesso,
  cryptotechParty?: DeCriptoParty,
): DeCriptoParty => {
  if (acesso === "User") {
    return {
      ...DEFAULT_CRYPTOTECH_PARTY,
      ...(cryptotechParty ?? {}),
    };
  }

  return resolvePartyFromTransaction(item);
};

const resolveTipoNI = (party: DeCriptoParty) => {
  const explicitTipoNI = sanitizeField(party.tipoNI, 2);
  if (explicitTipoNI) return explicitTipoNI;

  const digits = onlyDigits(party.document);
  if (digits.length === 11) return "1";
  if (digits.length === 14) return "2";

  return sanitizeField(party.ni, 30) ? "3" : "";
};

const resolvePartyFields = (party: DeCriptoParty) => {
  const tipoNI = resolveTipoNI(party);
  const pais = sanitizeCountry(party.pais ?? party.country ?? "BR");
  const documentDigits = onlyDigits(party.document);

  const isBrazilianCpfCnpj = pais === "BR" && (tipoNI === "1" || tipoNI === "2");

  return {
    tipoNI,
    pais,
    cpfCnpj: isBrazilianCpfCnpj ? documentDigits.slice(0, 14) : "",
    ni: isBrazilianCpfCnpj ? "" : sanitizeField(party.ni ?? party.document, 30),
    nome: sanitizeField(party.name, 80),
    endereco: pais === "BR" ? "" : sanitizeField(party.endereco ?? party.address, 120),
    plataforma: sanitizeField(party.plataforma, 80),
  };
};

const resolveExchangeFields = (exchangeRaw: unknown) => {
  const parts = String(exchangeRaw ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    nome: sanitizeField(parts[0] ?? "", 60),
    url: sanitizeField(parts[1] ?? "", 80),
    pais: sanitizeCountry(parts[2] ?? "", ""),
  };
};

const buildDeCriptoSemExchangeLine = ({
  item,
  recordType,
  acesso,
  cryptotechParty,
}: {
  item: DeCriptoTransaction;
  recordType: DeCriptoRecordType;
  acesso?: DeCriptoAcesso;
  cryptotechParty?: DeCriptoParty;
}) => {
  const party = resolvePartyFields(
    resolveCounterpartyForDirectOperation(item, acesso, cryptotechParty),
  );

  const base = [
    recordType,
    resolveOperacaoData(item),
    "I",
    formatValorDeCripto(item.valor, 2),
    formatValorDeCripto(item.taxa ?? item.taxas ?? 0, 2),
    sanitizeField(item.ativo, 10).toUpperCase(),
    formatQuantidadeDeCripto(item.quantidade),
  ];

  if (recordType === "0110") {
    // Registro 0110 SEM Exchange: Compra de criptoativo.
    // A contraparte informada é o VENDEDOR.
    return [
      ...base,
      party.tipoNI,
      party.pais,
      party.cpfCnpj,
      party.ni,
      party.nome,
      party.plataforma,
    ].join("|");
  }

  // Registro 0120 SEM Exchange: Venda de criptoativo.
  // A contraparte informada é o COMPRADOR.
  return [
    ...base,
    party.tipoNI,
    party.pais,
    party.cpfCnpj,
    party.ni,
    party.nome,
    party.plataforma,
  ].join("|");
};

const buildDeCriptoExchangeEstrangeiraLine = ({
  item,
  recordType,
}: {
  item: DeCriptoTransaction;
  recordType: DeCriptoRecordType;
}) => {
  const exchange = resolveExchangeFields(item.exchange);

  return [
    recordType,
    resolveOperacaoData(item),
    "I",
    formatValorDeCripto(item.valor, 2),
    formatValorDeCripto(item.taxa ?? item.taxas ?? 0, 2),
    sanitizeField(item.ativo, 10).toUpperCase(),
    formatQuantidadeDeCripto(item.quantidade),
    exchange.nome,
    exchange.url,
    exchange.pais,
  ].join("|");
};

const sortDeCriptoLines = (lines: string[]) => {
  return [...lines].sort((a, b) => {
    const [recordA, dateA] = a.split("|");
    const [recordB, dateB] = b.split("|");

    if (recordA === recordB) return dateA.localeCompare(dateB);

    return recordA.localeCompare(recordB);
  });
};

const gerarArquivoTxt = (linhas: string[], nome: string) => {
  if (linhas.length === 0) return;

  const datas = linhas
    .map((linha) => linha.split("|")[1])
    .filter(Boolean)
    .sort();
  const dataInicial = datas[0] || "sem-data";
  const dataFinal = datas[datas.length - 1] || "sem-data";

  const content = sortDeCriptoLines(linhas).join("\r\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${nome}_${dataInicial}-${dataFinal}.txt`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const validateRequiredBaseFields = (item: DeCriptoTransaction) => {
  const missing: string[] = [];

  if (!resolveOperacaoData(item)) missing.push("dataHora/data");
  if (!sanitizeField(item.ativo, 10)) missing.push("ativo");
  if (parseNumberSafe(item.valor) <= 0) missing.push("valor");
  if (parseNumberSafe(item.quantidade) <= 0) missing.push("quantidade");

  return missing;
};

export const handleCompraVendaDeCripto = (
  formData: DeCriptoTransaction[],
  acesso?: DeCriptoAcesso,
  options: HandleCompraVendaDeCriptoOptions = {},
) => {
  const linhasSemExchange: string[] = [];
  const linhasExchangeEstrangeira: string[] = [];
  const erros: string[] = [];

  const transactions = Array.isArray(formData) ? formData : [];

  transactions.forEach((item, index) => {
    const recordType = resolveDeCriptoRecordType(item, acesso);

    if (!recordType) return;

    if (options.onlyDeclaredSales && recordType !== "0120") {
      return;
    }

    const missing = validateRequiredBaseFields(item);
    if (missing.length > 0) {
      erros.push(
        `Ordem ${item.numeroOrdem ?? index + 1}: campos obrigatórios ausentes/inválidos: ${missing.join(", ")}.`,
      );
      return;
    }

    if (isCryptotechExchange(item.exchange)) {
      const party = resolvePartyFields(
        resolveCounterpartyForDirectOperation(item, acesso, options.cryptotechParty),
      );

      if (!party.tipoNI || !party.pais || (!party.cpfCnpj && !party.ni && !party.plataforma)) {
        erros.push(
          `Ordem ${item.numeroOrdem ?? index + 1}: contraparte sem CPF/CNPJ/NI/plataforma para layout SEM Exchange.`,
        );
        return;
      }

      linhasSemExchange.push(
        buildDeCriptoSemExchangeLine({
          item,
          recordType,
          acesso,
          cryptotechParty: options.cryptotechParty,
        }),
      );

      return;
    }

    const exchange = resolveExchangeFields(item.exchange);

    if (!exchange.nome || !exchange.url || !exchange.pais) {
      erros.push(
        `Ordem ${item.numeroOrdem ?? index + 1}: exchange precisa estar no formato "NOME URL PAIS", exemplo "Bybit https://www.bybit.com SG".`,
      );
      return;
    }

    linhasExchangeEstrangeira.push(
      buildDeCriptoExchangeEstrangeiraLine({
        item,
        recordType,
      }),
    );
  });

  const prefix = options.filePrefix ?? "DeCripto_Compra_Venda";

  gerarArquivoTxt(linhasSemExchange, `${prefix}_SEM_Exchange`);

  gerarArquivoTxt(linhasExchangeEstrangeira, `${prefix}_Exchange_Estrangeira`);

  if (erros.length > 0) {
    alert(
      `Algumas operações não foram geradas na DeCripto:\n\n${erros
        .slice(0, 20)
        .join("\n")}${erros.length > 20 ? `\n... e mais ${erros.length - 20} erro(s).` : ""}`,
    );
  }

  if (linhasSemExchange.length === 0 && linhasExchangeEstrangeira.length === 0) {
    alert("Nenhuma operação válida encontrada para gerar a DeCripto.");
  }

  return {
    semExchange: linhasSemExchange.length,
    exchangeEstrangeira: linhasExchangeEstrangeira.length,
    erros,
  };
};
