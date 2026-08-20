import { parseBRL, parseNum, toBRDate } from "../config/helpers";

type CommissionMode = "fixa" | "dinamica";

type SituacaoRps = "T" | "F" | "A" | "B" | "D" | "M" | "N" | "R" | "S" | "X" | "V" | "P" | "C";

type IssRetido = "1" | "2" | "3";

type GenerateRpsNfseTxtParams = {
  transactions: any[];
  precoMedioCompraMensal?: number;
  startDate: string;
  endDate: string;
  fileName?: string;

  prestadorCcm?: string;
  rpsSerie?: string;
  rpsNumeroInicial?: number;

  codigoServico?: string;
  aliquotaPercentual?: number;
  issRetidoPadrao?: IssRetido;
  situacaoRps?: SituacaoRps;

  commissionMode?: CommissionMode;
  comissaoFixaPercentual?: number;
  margemErroPorToken?: number;
};

type GenerateRpsNfseTxtResult = {
  totalValorNotas: number;
  totalValorNotasFormatado: string;
  quantidadeNotas: number;
};

const CRYPTOTECH_RPS_CONFIG = {
  prestadorCcm: "4251350",
  codigoServico: "02496",
  aliquotaPercentual: 5,
  situacaoRps: "T" as SituacaoRps,
  issRetidoPadrao: "2" as IssRetido,
  rpsSerie: "",
};

const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

const blank = (size: number) => "".padEnd(size, " ");

const optionalNumBlank = (value: unknown, size: number) => {
  const digits = onlyDigits(value);

  if (!digits) return blank(size);

  return digits.slice(-size).padStart(size, "0");
};

const isValidCep = (value: unknown) => {
  const digits = onlyDigits(value);

  if (digits.length !== 8) return false;
  if (digits === "00000000") return false;

  return true;
};

const cepField = (value: unknown) => {
  if (!isValidCep(value)) return blank(8);

  return num(value, 8);
};

const isValidCpf = (value: unknown) => {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }

  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;

  if (digit !== Number(cpf[9])) return false;

  sum = 0;

  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }

  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;

  return digit === Number(cpf[10]);
};

const isValidCnpj = (value: unknown) => {
  const cnpj = onlyDigits(value);

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (base: string, factors: number[]) => {
    const sum = factors.reduce((acc, factor, index) => {
      return acc + Number(base[index]) * factor;
    }, 0);

    const rest = sum % 11;

    return rest < 2 ? 0 : 11 - rest;
  };

  const digit1 = calc(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calc(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digit1 === Number(cnpj[12]) && digit2 === Number(cnpj[13]);
};

const isStable = (symbol: string) => ["USDT", "USDC"].includes(String(symbol).toUpperCase());

const isBtcOrEth = (symbol: string) => ["BTC", "ETH"].includes(String(symbol).toUpperCase());

const moneyDisplay = (value: number) =>
  Number(value || 0)
    .toFixed(2)
    .replace(".", ",");

const sanitizeText = (value: unknown) => {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n|\n|\r/g, "|")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    .trim();
};

const txt = (value: unknown, size: number) => {
  return sanitizeText(value).slice(0, size).padEnd(size, " ");
};

const num = (value: unknown, size: number) => {
  return onlyDigits(value).slice(-size).padStart(size, "0");
};

const parseMoney = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : 0;
};

const money15 = (value: unknown) => {
  const cents = Math.round(parseMoney(value) * 100);

  return String(Math.max(0, cents)).padStart(15, "0").slice(-15);
};

const percent4 = (value: number) => {
  const percent = Number(value || 0);
  const normalized = percent <= 1 ? percent * 100 : percent;
  const cents = Math.round(normalized * 100);

  return String(cents).padStart(4, "0").slice(-4);
};

const toYYYYMMDD = (value: unknown) => {
  const raw = String(value ?? "").trim();

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;

  const br = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (br) return `${br[3]}${br[2]}${br[1]}`;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}${mm}${dd}`;
};

const resolveDateKey = (value: unknown) => {
  const ymd = toYYYYMMDD(value);
  if (!ymd) return "";

  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
};

const downloadIso88591Txt = (content: string, fileName: string) => {
  const sanitized = content
    .normalize("NFC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\xFF]/g, "");

  const bytes = new Uint8Array(sanitized.length);

  for (let i = 0; i < sanitized.length; i += 1) {
    bytes[i] = sanitized.charCodeAt(i) & 0xff;
  }

  const blob = new Blob([bytes], {
    type: "text/plain;charset=ISO-8859-1;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const buildDailyPurchaseAverageByDate = (transactions: any[]) => {
  const grouped = new Map<string, { weightedSum: number; quantitySum: number }>();

  for (const transaction of transactions) {
    if (String(transaction?.tipo ?? "").toLowerCase() !== "compras") continue;

    const ativo = String(transaction?.ativo ?? "").toUpperCase();
    if (!isStable(ativo)) continue;

    const dateKey = resolveDateKey(transaction?.dataHora ?? transaction?.data);
    if (!dateKey) continue;

    const precoTokenCompra = parseNum(transaction?.valorToken);
    const quantidadeCompra = parseNum(transaction?.quantidade);

    if (
      !Number.isFinite(precoTokenCompra) ||
      !Number.isFinite(quantidadeCompra) ||
      precoTokenCompra <= 0 ||
      quantidadeCompra <= 0
    ) {
      continue;
    }

    const current = grouped.get(dateKey) ?? {
      weightedSum: 0,
      quantitySum: 0,
    };

    current.weightedSum += precoTokenCompra * quantidadeCompra;
    current.quantitySum += quantidadeCompra;

    grouped.set(dateKey, current);
  }

  const averages = new Map<string, number>();

  grouped.forEach((value, dateKey) => {
    if (value.quantitySum > 0) {
      averages.set(dateKey, value.weightedSum / value.quantitySum);
    }
  });

  return averages;
};

const resolvePrecoMedioCompraReferencia = ({
  transaction,
  dailyPurchaseAverageByDate,
  precoMedioCompraMensal,
}: {
  transaction: any;
  dailyPurchaseAverageByDate: Map<string, number>;
  precoMedioCompraMensal: number;
}) => {
  const dateKey = resolveDateKey(transaction?.dataHora ?? transaction?.data);
  const dailyAverage = dateKey ? dailyPurchaseAverageByDate.get(dateKey) : undefined;

  if (Number.isFinite(dailyAverage) && Number(dailyAverage) > 0) {
    return Number(dailyAverage);
  }

  return Number.isFinite(precoMedioCompraMensal) ? precoMedioCompraMensal : 0;
};

const calculateSaleCommission = ({
  transaction,
  precoMedioCompraReferencia,
  commissionMode,
  comissaoFixaPercentual,
  margemErroPorToken,
}: {
  transaction: any;
  precoMedioCompraReferencia: number;
  commissionMode: CommissionMode;
  comissaoFixaPercentual: number;
  margemErroPorToken: number;
}) => {
  const ativo = String(transaction?.ativo ?? "").toUpperCase();
  const valorTokenVendido = parseNum(transaction?.valorToken);

  if (isBtcOrEth(ativo)) return 9.5;

  if (commissionMode === "fixa") return comissaoFixaPercentual;

  if (!isStable(ativo)) return comissaoFixaPercentual;

  if (
    !Number.isFinite(valorTokenVendido) ||
    valorTokenVendido <= 0 ||
    !Number.isFinite(precoMedioCompraReferencia) ||
    precoMedioCompraReferencia <= 0
  ) {
    return comissaoFixaPercentual;
  }

  const precoAjustado = Number((valorTokenVendido - margemErroPorToken).toFixed(8));

  if (precoAjustado <= precoMedioCompraReferencia) {
    return comissaoFixaPercentual;
  }

  const diferencaPorToken = Number((precoAjustado - precoMedioCompraReferencia).toFixed(8));

  const comissaoCalculada = Number(
    ((diferencaPorToken / precoMedioCompraReferencia) * 100).toFixed(2),
  );

  return Math.max(comissaoCalculada, comissaoFixaPercentual);
};

const getUserField = (user: any, keys: string[]) => {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && String(value).trim()) {
      return value;
    }
  }

  return "";
};

const getTomador = (transaction: any) => {
  const user = transaction?.User ?? {};

  const rawDocument = onlyDigits(user?.document ?? transaction?.document ?? transaction?.cpfCnpj);

  const validCpf = isValidCpf(rawDocument);
  const validCnpj = isValidCnpj(rawDocument);

  const rawCep = getUserField(user, ["cep", "zipCode", "postalCode"]);
  const hasValidCep = isValidCep(rawCep);

  /**
   * Regra prática:
   *
   * CPF válido:
   * envia CPF e não força endereço/CEP.
   *
   * CNPJ válido com CEP válido:
   * envia CNPJ e endereço.
   *
   * CNPJ sem CEP, CPF inválido ou documento ausente:
   * envia como CPF não-informado.
   *
   * Isso evita:
   * - erro 231: CEP 00000000 inválido
   * - erro 337: CPF com dígito verificador inválido
   */
  const shouldSendCpf = validCpf;
  const shouldSendCnpj = validCnpj && hasValidCep;

  const indicator = shouldSendCpf ? "1" : shouldSendCnpj ? "2" : "3";

  const document =
    indicator === "1"
      ? rawDocument.padStart(11, "0")
      : indicator === "2"
        ? rawDocument.padStart(14, "0")
        : "00000000000000";

  const shouldSendAddress = indicator === "2" && hasValidCep;

  return {
    indicator,
    document,

    inscricaoMunicipal:
      indicator === "2"
        ? getUserField(user, ["inscricaoMunicipal", "municipalRegistration", "ccm"])
        : "",

    inscricaoEstadual:
      indicator === "2" ? getUserField(user, ["inscricaoEstadual", "stateRegistration"]) : "",

    nome: String(user?.name ?? transaction?.nome ?? "Consumidor Final").trim(),

    tipoEndereco: shouldSendAddress
      ? getUserField(user, ["tipoEndereco", "addressType"]) || "Rua"
      : "",
    endereco: shouldSendAddress
      ? getUserField(user, ["logradouro", "street", "addressStreet", "endereco"])
      : "",
    numero: shouldSendAddress ? getUserField(user, ["numero", "number", "addressNumber"]) : "",
    complemento: shouldSendAddress
      ? getUserField(user, ["complemento", "complement", "addressComplement"])
      : "",
    bairro: shouldSendAddress ? getUserField(user, ["bairro", "neighborhood", "district"]) : "",
    cidade: shouldSendAddress ? getUserField(user, ["cidade", "city"]) : "",
    uf: shouldSendAddress ? getUserField(user, ["uf", "state"]) : "",
    cep: shouldSendAddress ? rawCep : "",
    email: getUserField(user, ["email"]),
  };
};

const resolveIssRetido = (transaction: any, issRetidoPadrao: IssRetido): IssRetido => {
  const user = transaction?.User ?? {};

  const explicit =
    transaction?.issRetido ??
    transaction?.issRetidoTomador ??
    user?.issRetido ??
    user?.issRetidoTomador;

  if (explicit === true || explicit === "true" || explicit === "1" || explicit === 1) {
    return "1";
  }

  if (explicit === false || explicit === "false" || explicit === "2" || explicit === 2) {
    return "2";
  }

  return issRetidoPadrao;
};

const buildDescricaoRps = ({
  transaction,
  valorNota,
  comissao,
  precoMedioCompraReferencia,
}: {
  transaction: any;
  valorNota: number;
  comissao: number;
  precoMedioCompraReferencia: number;
}) => {
  return sanitizeText(
    [
      "Prestacao de servicos de promocao de vendas e intermediacao comercial.",
      `Valor da nota fiscal: ${moneyDisplay(valorNota)} BRL.`,
      `Criterio de calculo do spread/comissao: ${comissao.toFixed(2)}% sobre a operacao.`,
      `Valor total da operacao de referencia: ${transaction?.valor ?? ""}.`,
      `Identificador da ordem: ${transaction?.numeroOrdem ?? ""}.`,
      `Data da operacao: ${toBRDate(transaction?.dataHora ?? transaction?.data)}.`,
      `Ativo digital: ${transaction?.ativo ?? ""}.`,
      `Quantidade: ${transaction?.quantidade ?? ""}.`,
      `Valor unitario do token: ${transaction?.valorToken ?? ""}.`,
      `Preco medio de compra usado como referencia: ${moneyDisplay(
        precoMedioCompraReferencia,
      )} BRL.`,
      `Exchange/corretora: ${String(transaction?.exchange ?? "").split(" ")[0]}.`,
      "A nota fiscal refere-se a remuneracao pela prestacao do servico, e nao ao valor total movimentado na operacao.",
    ].join("|"),
  ).slice(0, 1000);
};

const resolveRpsNumber = ({
  index,
  rpsNumeroInicial,
  usedRpsNumbers,
}: {
  index: number;
  rpsNumeroInicial: number;
  usedRpsNumbers: Set<string>;
}) => {
  let nextNumber = rpsNumeroInicial + index;
  let rpsNumber = String(nextNumber).padStart(12, "0").slice(-12);

  while (usedRpsNumbers.has(rpsNumber)) {
    nextNumber += 1;
    rpsNumber = String(nextNumber).padStart(12, "0").slice(-12);
  }

  usedRpsNumbers.add(rpsNumber);

  return rpsNumber;
};

const buildHeader = ({
  prestadorCcm,
  startDate,
  endDate,
}: {
  prestadorCcm: string;
  startDate: string;
  endDate: string;
}) => {
  return ["1", "002", num(prestadorCcm, 8), toYYYYMMDD(startDate), toYYYYMMDD(endDate)].join("");
};

const buildDetail = ({
  transaction,
  index,
  rpsNumeroInicial,
  usedRpsNumbers,
  rpsSerie,
  codigoServico,
  aliquotaPercentual,
  issRetidoPadrao,
  situacaoRps,
  valorNota,
  comissao,
  precoMedioCompraReferencia,
}: {
  transaction: any;
  index: number;
  rpsNumeroInicial: number;
  usedRpsNumbers: Set<string>;
  rpsSerie: string;
  codigoServico: string;
  aliquotaPercentual: number;
  issRetidoPadrao: IssRetido;
  situacaoRps: SituacaoRps;
  valorNota: number;
  comissao: number;
  precoMedioCompraReferencia: number;
}) => {
  const tomador = getTomador(transaction);
  const issRetido = resolveIssRetido(transaction, issRetidoPadrao);

  const rpsNumber = resolveRpsNumber({
    index,
    rpsNumeroInicial,
    usedRpsNumbers,
  });

  const descricao = buildDescricaoRps({
    transaction,
    valorNota,
    comissao,
    precoMedioCompraReferencia,
  });

  return [
    "6",
    txt("RPS", 5),
    txt(rpsSerie, 5),
    rpsNumber,
    toYYYYMMDD(transaction?.dataHora ?? transaction?.data),
    situacaoRps,
    money15(valorNota),
    money15(0),
    num(codigoServico, 5),
    percent4(aliquotaPercentual),
    issRetido,
    tomador.indicator,
    num(tomador.document, 14),
    optionalNumBlank(tomador.inscricaoMunicipal, 8),
    optionalNumBlank(tomador.inscricaoEstadual, 12),
    txt(tomador.nome, 75),
    txt(tomador.tipoEndereco, 3),
    txt(tomador.endereco, 50),
    txt(tomador.numero, 10),
    txt(tomador.complemento, 30),
    txt(tomador.bairro, 30),
    txt(tomador.cidade, 50),
    txt(tomador.uf, 2),
    cepField(tomador.cep),
    txt(tomador.email, 75),

    money15(0), // PIS/PASEP
    money15(0), // COFINS
    money15(0), // INSS
    money15(0), // IR
    money15(0), // CSLL/CSSL

    money15(0), // Carga tributária valor
    num(0, 5), // Carga tributária percentual
    txt("", 10), // Fonte da carga tributária

    num(0, 12), // CEI
    num(0, 12), // Matrícula da obra
    num(0, 7), // Município prestação cód. IBGE
    num(0, 10), // Número de encapsulamento
    txt("", 10), // Reservado

    money15(0), // Valor Total Recebido

    txt("", 175), // Reservado
    descricao,
  ].join("");
};

const buildFooter = ({ count, totalServicos }: { count: number; totalServicos: number }) => {
  return ["9", num(count, 7), money15(totalServicos), money15(0)].join("");
};

export const generateRpsNfseTxt = ({
  transactions,
  precoMedioCompraMensal = 0,
  startDate,
  endDate,
  fileName,

  prestadorCcm = CRYPTOTECH_RPS_CONFIG.prestadorCcm,
  rpsSerie = CRYPTOTECH_RPS_CONFIG.rpsSerie,
  rpsNumeroInicial = 1,

  codigoServico = CRYPTOTECH_RPS_CONFIG.codigoServico,
  aliquotaPercentual = CRYPTOTECH_RPS_CONFIG.aliquotaPercentual,
  issRetidoPadrao = CRYPTOTECH_RPS_CONFIG.issRetidoPadrao,
  situacaoRps = CRYPTOTECH_RPS_CONFIG.situacaoRps,

  commissionMode = "dinamica",
  comissaoFixaPercentual = 0.01,
  margemErroPorToken = 0.03,
}: GenerateRpsNfseTxtParams): GenerateRpsNfseTxtResult | null => {
  const allTransactions = Array.isArray(transactions) ? transactions : [];

  const validPrestadorCcm =
    onlyDigits(prestadorCcm).length === 8 ? prestadorCcm : CRYPTOTECH_RPS_CONFIG.prestadorCcm;

  const validCodigoServico =
    onlyDigits(codigoServico).length > 0 && onlyDigits(codigoServico).length <= 5
      ? codigoServico
      : CRYPTOTECH_RPS_CONFIG.codigoServico;

  const numeroInicial = Number(rpsNumeroInicial);

  const validRpsNumeroInicial =
    Number.isFinite(numeroInicial) && numeroInicial > 0 ? numeroInicial : 1;

  const salesTransactions = allTransactions.filter((transaction) => {
    return String(transaction?.tipo ?? "").toLowerCase() === "vendas";
  });

  const transactionsToGenerate = salesTransactions.length > 0 ? salesTransactions : allTransactions;

  const fallbackDate = new Date().toISOString().slice(0, 10);

  const firstTransactionDate =
    transactionsToGenerate.find((transaction) =>
      toYYYYMMDD(transaction?.dataHora ?? transaction?.data),
    )?.dataHora ??
    transactionsToGenerate.find((transaction) =>
      toYYYYMMDD(transaction?.dataHora ?? transaction?.data),
    )?.data;

  const headerStartDate =
    toYYYYMMDD(startDate) || toYYYYMMDD(firstTransactionDate) || toYYYYMMDD(fallbackDate);

  const headerEndDate =
    toYYYYMMDD(endDate) || toYYYYMMDD(firstTransactionDate) || toYYYYMMDD(fallbackDate);

  const normalizedStartDate = `${headerStartDate.slice(0, 4)}-${headerStartDate.slice(
    4,
    6,
  )}-${headerStartDate.slice(6, 8)}`;

  const normalizedEndDate = `${headerEndDate.slice(0, 4)}-${headerEndDate.slice(
    4,
    6,
  )}-${headerEndDate.slice(6, 8)}`;

  const dailyPurchaseAverageByDate = buildDailyPurchaseAverageByDate(allTransactions);
  const usedRpsNumbers = new Set<string>();

  let totalValorNotas = 0;

  const details = transactionsToGenerate
    .map((transaction, index) => {
      const valorBRL = parseBRL(transaction?.valor);

      if (!Number.isFinite(valorBRL) || valorBRL <= 0) {
        return "";
      }

      const dataOriginal = transaction?.dataHora ?? transaction?.data;
      const dataRps = toYYYYMMDD(dataOriginal) || headerStartDate || toYYYYMMDD(fallbackDate);

      if (!dataRps) {
        return "";
      }

      const transactionForRps = {
        ...transaction,
        dataHora: transaction?.dataHora || dataRps,
      };

      const precoMedioCompraReferencia = resolvePrecoMedioCompraReferencia({
        transaction: transactionForRps,
        dailyPurchaseAverageByDate,
        precoMedioCompraMensal,
      });

      const comissao = calculateSaleCommission({
        transaction: transactionForRps,
        precoMedioCompraReferencia,
        commissionMode,
        comissaoFixaPercentual,
        margemErroPorToken,
      });

      const valorNota = Number((valorBRL * (comissao / 100)).toFixed(2));

      if (!Number.isFinite(valorNota) || valorNota <= 0) {
        return "";
      }

      totalValorNotas += valorNota;

      return buildDetail({
        transaction: transactionForRps,
        index,
        rpsNumeroInicial: validRpsNumeroInicial,
        usedRpsNumbers,
        rpsSerie,
        codigoServico: validCodigoServico,
        aliquotaPercentual,
        issRetidoPadrao,
        situacaoRps,
        valorNota,
        comissao,
        precoMedioCompraReferencia,
      });
    })
    .filter(Boolean);

  const content = [
    buildHeader({
      prestadorCcm: validPrestadorCcm,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    }),
    ...details,
    buildFooter({
      count: details.length,
      totalServicos: totalValorNotas,
    }),
    "",
  ].join("\r\n");

  const outputFileName =
    fileName || `rps-nfse-v002-${normalizedStartDate}_${normalizedEndDate}.txt`;

  downloadIso88591Txt(content, outputFileName);

  return {
    totalValorNotas: Number(totalValorNotas.toFixed(2)),
    totalValorNotasFormatado: moneyDisplay(totalValorNotas),
    quantidadeNotas: details.length,
  };
};
