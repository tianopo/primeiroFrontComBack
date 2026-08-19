import { parseBRL, parseNum, toBRDate } from "../config/helpers";

type CommissionMode = "fixa" | "dinamica";

type GenerateRpsNfseTxtParams = {
  transactions: any[];
  precoMedioCompraMensal?: number;
  startDate: string;
  endDate: string;
  fileName?: string;

  prestadorCcm: string;
  rpsSerie?: string;
  rpsNumeroInicial?: number;

  codigoServico: string;
  aliquotaPercentual?: number;
  issRetido?: "1" | "2" | "3";
  situacaoRps?: "T" | "F" | "A" | "B" | "D" | "M" | "N" | "R" | "S" | "X" | "V" | "P" | "C";

  commissionMode?: CommissionMode;
  comissaoFixaPercentual?: number;
  margemErroPorToken?: number;
};

type GenerateRpsNfseTxtResult = {
  totalValorNotas: number;
  totalValorNotasFormatado: string;
  quantidadeNotas: number;
};

const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

const isStable = (symbol: string) => ["USDT", "USDC"].includes(String(symbol).toUpperCase());

const isBtcOrEth = (symbol: string) => ["BTC", "ETH"].includes(String(symbol).toUpperCase());

const moneyDisplay = (value: number) =>
  Number(value || 0)
    .toFixed(2)
    .replace(".", ",");

const toLatin1Safe = (value: unknown) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n|\n|\r/g, "|")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    .trim();

const txt = (value: unknown, size: number) => {
  return toLatin1Safe(value).slice(0, size).padEnd(size, " ");
};

const num = (value: unknown, size: number) => {
  return onlyDigits(value).slice(-size).padStart(size, "0");
};

const money15 = (value: unknown) => {
  const parsed =
    typeof value === "number"
      ? value
      : Number(
          String(value ?? "0")
            .replace(/\./g, "")
            .replace(",", "."),
        );

  const cents = Math.round((Number.isFinite(parsed) ? parsed : 0) * 100);

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
    if (value !== undefined && value !== null && String(value).trim()) return value;
  }

  return "";
};

const getTomador = (transaction: any) => {
  const user = transaction?.User ?? {};
  const document = onlyDigits(user?.document ?? transaction?.document ?? transaction?.cpfCnpj);
  const indicator = document.length === 14 ? "2" : document.length === 11 ? "1" : "3";

  return {
    indicator,
    document: indicator === "3" ? "00000000000000" : document,
    inscricaoMunicipal: getUserField(user, ["inscricaoMunicipal", "municipalRegistration", "ccm"]),
    inscricaoEstadual: getUserField(user, ["inscricaoEstadual", "stateRegistration"]),
    nome: String(user?.name ?? transaction?.nome ?? "Consumidor Final").trim(),

    tipoEndereco: getUserField(user, ["tipoEndereco", "addressType"]) || "Rua",
    endereco: getUserField(user, ["logradouro", "street", "addressStreet", "endereco"]),
    numero: getUserField(user, ["numero", "number", "addressNumber"]),
    complemento: getUserField(user, ["complemento", "complement", "addressComplement"]),
    bairro: getUserField(user, ["bairro", "neighborhood", "district"]),
    cidade: getUserField(user, ["cidade", "city"]),
    uf: getUserField(user, ["uf", "state"]),
    cep: getUserField(user, ["cep", "zipCode", "postalCode"]),
    email: getUserField(user, ["email"]),
  };
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
  return toLatin1Safe(
    [
      "Prestacao de servicos de promocao de vendas e intermediacao comercial.",
      `Valor da nota fiscal: ${moneyDisplay(valorNota)} BRL.`,
      `Criterio de calculo do spread/comissao: ${comissao.toFixed(2)}% sobre a operacao.`,
      `Valor total da operacao de referencia: ${transaction?.valor ?? ""}.`,
      `Identificador da ordem: ${transaction?.numeroOrdem ?? ""}.`,
      `Data da operacao: ${toBRDate(transaction?.dataHora ?? transaction?.data)}`,
      `Ativo digital: ${transaction?.ativo ?? ""}.`,
      `Quantidade: ${transaction?.quantidade ?? ""}.`,
      `Valor unitario do token: ${transaction?.valorToken ?? ""}.`,
      `Preco medio de compra usado como referencia: ${moneyDisplay(precoMedioCompraReferencia)} BRL.`,
      `Exchange/corretora: ${String(transaction?.exchange ?? "").split(" ")[0]}.`,
      "A nota fiscal refere-se a remuneracao pela prestacao do servico, e nao ao valor total movimentado na operacao.",
    ].join("|"),
  ).slice(0, 1000);
};

const resolveRpsNumber = ({
  transaction,
  index,
  rpsNumeroInicial,
  used,
}: {
  transaction: any;
  index: number;
  rpsNumeroInicial: number;
  used: Set<string>;
}) => {
  const orderDigits = onlyDigits(transaction?.numeroOrdem);
  let candidate = orderDigits ? orderDigits.slice(-12).padStart(12, "0") : "";

  if (!candidate || used.has(candidate)) {
    let next = rpsNumeroInicial + index;
    candidate = String(next).padStart(12, "0").slice(-12);

    while (used.has(candidate)) {
      next += 1;
      candidate = String(next).padStart(12, "0").slice(-12);
    }
  }

  used.add(candidate);

  return candidate;
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
  rpsSerie,
  codigoServico,
  aliquotaPercentual,
  issRetido,
  situacaoRps,
  valorNota,
  comissao,
  precoMedioCompraReferencia,
}: {
  transaction: any;
  index: number;
  rpsNumeroInicial: number;
  rpsSerie: string;
  codigoServico: string;
  aliquotaPercentual: number;
  issRetido: "1" | "2" | "3";
  situacaoRps: string;
  valorNota: number;
  comissao: number;
  precoMedioCompraReferencia: number;
}) => {
  const used = buildDetail.used ?? new Set<string>();
  buildDetail.used = used;

  const tomador = getTomador(transaction);

  const rpsNumber = resolveRpsNumber({
    transaction,
    index,
    rpsNumeroInicial,
    used,
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
    num(tomador.inscricaoMunicipal, 8),
    num(tomador.inscricaoEstadual, 12),
    txt(tomador.nome, 75),
    txt(tomador.tipoEndereco, 3),
    txt(tomador.endereco, 50),
    txt(tomador.numero, 10),
    txt(tomador.complemento, 30),
    txt(tomador.bairro, 30),
    txt(tomador.cidade, 50),
    txt(tomador.uf, 2),
    num(tomador.cep, 8),
    txt(tomador.email, 75),

    // Retenções federais layout V.002
    money15(0), // PIS/PASEP
    money15(0), // COFINS
    money15(0), // INSS
    money15(0), // IR
    money15(0), // CSLL/CSSL

    // Carga tributária
    money15(0),
    num(0, 5),
    txt("", 10),

    // CEI / Obra / Município / Encapsulamento / Reservados
    num(0, 12),
    num(0, 12),
    num(0, 7),
    num(0, 10),
    txt("", 10),

    // Valor Total Recebido: deixei zerado porque o manual restringe esse campo a códigos específicos
    money15(0),

    txt("", 175),
    descricao,
  ].join("");
};

buildDetail.used = undefined as Set<string> | undefined;

const buildFooter = ({ count, totalServicos }: { count: number; totalServicos: number }) => {
  return ["9", num(count, 7), money15(totalServicos), money15(0)].join("");
};

export const generateRpsNfseTxt = ({
  transactions,
  precoMedioCompraMensal = 0,
  startDate,
  endDate,
  fileName = `rps-nfse-v002-${startDate}_${endDate}.txt`,

  prestadorCcm,
  rpsSerie = "RPS",
  rpsNumeroInicial = 1,

  codigoServico,
  aliquotaPercentual = 5,
  issRetido = "2",
  situacaoRps = "T",

  commissionMode = "dinamica",
  comissaoFixaPercentual = 0.01,
  margemErroPorToken = 0.03,
}: GenerateRpsNfseTxtParams): GenerateRpsNfseTxtResult | null => {
  if (onlyDigits(prestadorCcm).length !== 8) {
    alert("Informe o CCM/Inscrição Municipal do prestador com 8 dígitos.");
    return null;
  }

  if (onlyDigits(codigoServico).length === 0 || onlyDigits(codigoServico).length > 5) {
    alert("Informe o código de serviço da Prefeitura de São Paulo com até 5 dígitos.");
    return null;
  }

  if (!toYYYYMMDD(startDate) || !toYYYYMMDD(endDate)) {
    alert("Data inicial ou final inválida para gerar o RPS.");
    return null;
  }

  const salesTransactions = (transactions ?? []).filter((transaction) => {
    return String(transaction?.tipo ?? "").toLowerCase() === "vendas";
  });

  if (salesTransactions.length === 0) {
    alert("Nenhuma venda encontrada para gerar o TXT de RPS.");
    return null;
  }

  buildDetail.used = new Set<string>();

  const dailyPurchaseAverageByDate = buildDailyPurchaseAverageByDate(transactions);

  let totalValorNotas = 0;

  const details = salesTransactions
    .map((transaction, index) => {
      const valorBRL = parseBRL(transaction?.valor);

      if (!Number.isFinite(valorBRL) || valorBRL <= 0) return "";

      const precoMedioCompraReferencia = resolvePrecoMedioCompraReferencia({
        transaction,
        dailyPurchaseAverageByDate,
        precoMedioCompraMensal,
      });

      const comissao = calculateSaleCommission({
        transaction,
        precoMedioCompraReferencia,
        commissionMode,
        comissaoFixaPercentual,
        margemErroPorToken,
      });

      const valorNota = Number((valorBRL * (comissao / 100)).toFixed(2));

      if (!Number.isFinite(valorNota) || valorNota <= 0) return "";

      totalValorNotas += valorNota;

      return buildDetail({
        transaction,
        index,
        rpsNumeroInicial,
        rpsSerie,
        codigoServico,
        aliquotaPercentual,
        issRetido,
        situacaoRps,
        valorNota,
        comissao,
        precoMedioCompraReferencia,
      });
    })
    .filter(Boolean);

  if (details.length === 0) {
    alert("Nenhuma venda válida encontrada para gerar o TXT de RPS.");
    return null;
  }

  const content = [
    buildHeader({
      prestadorCcm,
      startDate,
      endDate,
    }),
    ...details,
    buildFooter({
      count: details.length,
      totalServicos: totalValorNotas,
    }),
    "",
  ].join("\r\n");

  downloadIso88591Txt(content, fileName);

  return {
    totalValorNotas: Number(totalValorNotas.toFixed(2)),
    totalValorNotasFormatado: moneyDisplay(totalValorNotas),
    quantidadeNotas: details.length,
  };
};
