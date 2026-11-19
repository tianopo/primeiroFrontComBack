import JSZip from "jszip";

type CommissionMode = "fixa" | "dinamica";
type IssRetido = "1" | "2" | "3";
type SituacaoRps = "T" | "F" | "A" | "B" | "D" | "M" | "N" | "R" | "S" | "X" | "V" | "P" | "C";

type NfseTransaction = {
  tipo?: string;
  numeroOrdem?: string | number;
  dataHora?: string | Date;
  data?: string | Date;
  exchange?: string;
  ativo?: string;
  valor?: string | number;
  quantidade?: string | number;
  valorToken?: string | number;
  User?: Record<string, unknown> | null;
  user?: Record<string, unknown> | null;
  documento?: string;
  [key: string]: unknown;
};

type GenerateRpsNfseTxtParams = {
  transactions: NfseTransaction[];
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
  valorMinimoNota?: number;

  itemListaServico?: string; // 17.06, correspondente a 170601
  codigoTributacaoMunicipio?: string; // "001" segundo última NFS-e informada; validar com emissor
  codigoNbs?: string; // 114061900 (NBS completa, começa com 1)
  municipioPrestacaoIbge?: string; // 7 dígitos
  municipioIncidenciaIbge?: string; // 7 dígitos

  codigoCnae?: string; // 7 dígitos, se aplicável
  regimeEspecialTributacao?: number; // 0 a 6 (conferir com contador)
  naturezaOperacao?: number; // 1 a 7
  exigibilidadeIss?: number; // 1 a 7
  incentivadorCultural?: boolean;
  aliquotaSimplesNacional?: number | null;
  ibsCbs?: {
    codigoClassificacaoTributaria?: string;
    codigoIndicadorOperacao?: string;
    aliquotaIbsUf?: number;
    aliquotaIbsMunicipio?: number;
    aliquotaCbs?: number;
    baseCalculo?: number;
  };
  // Dados do PRESTADOR: o modelo fornecido NÃO possui colunas próprias do emitente;
  // não misturá-los com os campos A:N do TOMADOR.
  prestador?: {
    razaoSocial: string;
    inscricaoMunicipal: string;
    inscricaoEstadual: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
  };
  templateUrl?: string; // reservado para compatibilidade; não utilizado
  maxNotasPorArquivo?: number; // máximo absoluto: 500

  ordensAutorizadasEmProducao?: string[];
};

type GenerateRpsNfseTxtResult = {
  totalValorNotas: number;
  totalValorNotasFormatado: string;
  quantidadeNotas: number;
  quantidadeArquivos: number;
  nomesArquivos: string[];
  quantidadeIgnoradaPorAutorizacaoConfirmada: number;
  // Permanecem apenas para compatibilidade com Home.tsx:
  primeiroRps: number;
  proximoRps: number;
};

const RPS_LOCAL_STORAGE_KEY = "cryptotech:nfse:rps:nextNumber";
const RPS_INITIAL_NUMBER = 35;
const MAX_NOTAS_POR_ARQUIVO = 500;
const NOTAS_COLUMNS = 52; // A:AZ

export const CRYPTOTECH_PRESTADOR_NFSE = {
  razaoSocial: "CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA",
  inscricaoMunicipal: "4251350",
  inscricaoEstadual: "392526832116",
  cep: "01311000",
  logradouro: "PAULISTA",
  numero: "91",
  complemento: "CONJ 905",
  bairro: "BELA VISTA",
  municipio: "São Paulo",
  uf: "SP",
} as const;

export const CRYPTOTECH_CODIGOS_SERVICO = {
  codigoNacional: "170601", // propaganda/publicidade, inclusive promoção de vendas
  itemListaServico: "17.06", // coluna P
  codigoTributacaoMunicipio: "001", // coluna Q — informado na última nota
  codigoServicoMunicipalSpHistorico: "02496", // referência; NÃO preencher Q sem confirmar
  codigoNbs: "114061900", // coluna S — propaganda não classificada em subposições anteriores
  codigoCnae: "7319002", // coluna R — promoção de vendas
  municipioIbge: "3550308", // colunas T/U — estabelecimento em São Paulo/SP
} as const;

export const CRYPTOTECH_ULTIMA_NFSE_INFORMADA = "999999999" as const;

export const CRYPTOTECH_CADASTRO_EMISSOR_BRASIL_NFE = {
  CNPJ: "55636113000170",
  IM: CRYPTOTECH_PRESTADOR_NFSE.inscricaoMunicipal,
  IE: CRYPTOTECH_PRESTADOR_NFSE.inscricaoEstadual,
  CNAE: CRYPTOTECH_CODIGOS_SERVICO.codigoCnae,
  codigoServicoNacional: CRYPTOTECH_CODIGOS_SERVICO.codigoNacional,
  itemListaServico: CRYPTOTECH_CODIGOS_SERVICO.itemListaServico,
  codigoMunicipioEmissor: CRYPTOTECH_CODIGOS_SERVICO.municipioIbge,
} as const;

export const getNextRpsNumber = () => {
  if (typeof window === "undefined") return RPS_INITIAL_NUMBER;
  try {
    const raw = Number(window.localStorage.getItem(RPS_LOCAL_STORAGE_KEY));
    return Number.isSafeInteger(raw) && raw >= RPS_INITIAL_NUMBER ? raw : RPS_INITIAL_NUMBER;
  } catch {
    return RPS_INITIAL_NUMBER; // modo privado ou localStorage indisponível
  }
};

export const resetNextRpsNumber = (nextNumber = RPS_INITIAL_NUMBER) => {
  if (!Number.isSafeInteger(nextNumber) || nextNumber < RPS_INITIAL_NUMBER) {
    throw new Error("Número inicial de RPS inválido.");
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RPS_LOCAL_STORAGE_KEY, String(nextNumber));
    } catch {
      /* armazenamento opcional */
    }
  }
};

const text = (value: unknown) => String(value ?? "").trim();
const digits = (value: unknown) => text(value).replace(/\D/g, "");
const pad = (value: number) => String(value).padStart(2, "0");
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const roundMoney = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const safeFilePart = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.(txt|xlsx|zip)$/i, "");

const getField = (obj: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const v = obj[key];
    if (v !== undefined && v !== null && text(v)) return text(v);
  }
  return "";
};

const calendarDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
  );
};

const dateParts = (input: unknown): { iso: string; br: string } | null => {
  if (input instanceof Date) {
    if (!Number.isFinite(input.getTime())) return null;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(input);
    const values = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return dateParts(`${values.year}-${values.month}-${values.day}`);
  }
  if (typeof input === "number" && input > 1e12) return dateParts(new Date(input));

  const raw = text(input);
  let y: number, m: number, d: number;
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(raw);
  const br = /^(\d{2})[/-](\d{2})[/-](\d{4})(?:\s.*)?$/.exec(raw);
  if (iso) {
    y = Number(iso[1]);
    m = Number(iso[2]);
    d = Number(iso[3]);
  } else if (br) {
    d = Number(br[1]);
    m = Number(br[2]);
    y = Number(br[3]);
  } else return null;
  if (!calendarDate(y, m, d)) return null;
  return { iso: `${y}-${pad(m)}-${pad(d)}`, br: `${pad(d)}/${pad(m)}/${y}` };
};

const numberCandidates = (input: unknown): number[] => {
  if (typeof input === "number") return Number.isFinite(input) ? [input] : [];
  const s = text(input).replace(/\s|R\$|USDT|USDC/gi, "");
  if (!s || !/^-?[\d.,]+$/.test(s)) return [];
  const candidates = new Set<number>();
  const add = (s2: string) => {
    const n = Number(s2);
    if (Number.isFinite(n)) candidates.add(n);
  };
  const commas = (s.match(/,/g) || []).length;
  const dots = (s.match(/\./g) || []).length;
  if (commas && dots) {
    const decimal = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
    add(decimal === "," ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, ""));
  } else if (commas === 1 && !dots) {
    add(s.replace(",", "."));
    if (/^-?\d{1,3},\d{3}$/.test(s)) add(s.replace(",", ""));
  } else if (dots === 1 && !commas) {
    add(s);
    if (/^-?\d{1,3}\.\d{3}$/.test(s)) add(s.replace(".", ""));
  } else if (commas > 1 && !dots && /^-?\d{1,3}(,\d{3})+$/.test(s)) {
    add(s.replace(/,/g, ""));
  } else if (dots > 1 && !commas && /^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    add(s.replace(/\./g, ""));
  } else if (!commas && !dots) {
    add(s);
  }
  return [...candidates];
};

const decimal = (raw: unknown, preferred: "decimal" | "money", expected?: number): number => {
  const c = numberCandidates(raw);
  if (!c.length) return NaN;
  if (c.length === 1) return c[0];
  if (expected && expected > 0) {
    return [...c].sort(
      (a, b) =>
        Math.abs(Math.log(Math.max(a, 1e-15) / expected)) -
        Math.abs(Math.log(Math.max(b, 1e-15) / expected)),
    )[0];
  }
  return preferred === "decimal" ? Math.min(...c) : Math.max(...c);
};

const normalizeAmounts = (t: NfseTransaction) => {
  const tokenPrice = decimal(t.valorToken, "decimal");
  const quantityCandidates = numberCandidates(t.quantidade).filter((n) => n > 0);
  const valueCandidates = numberCandidates(t.valor).filter((n) => n > 0);
  if (!valueCandidates.length || !quantityCandidates.length) {
    throw new Error("valor ou quantidade não informado/inválido");
  }
  let best: { total: number; quantity: number; err: number } | null = null;
  for (const total of valueCandidates)
    for (const quantity of quantityCandidates) {
      const err =
        Number.isFinite(tokenPrice) && tokenPrice > 0
          ? Math.abs(Math.log(total / (quantity * tokenPrice)))
          : (total === Math.max(...valueCandidates) ? 0 : 100) +
            (quantity === Math.min(...quantityCandidates) ? 0 : 10);
      if (!best || err < best.err) best = { total, quantity, err };
    }
  if (!best) throw new Error("não foi possível interpretar os valores");
  if (Number.isFinite(tokenPrice) && tokenPrice > 0 && best.err > Math.log(1.2)) {
    throw new Error(
      `valor/quantidade/preço unitário inconsistentes (valor=${text(t.valor)}, quantidade=${text(t.quantidade)}, preço=${text(t.valorToken)})`,
    );
  }
  return { total: best.total, quantity: best.quantity, price: tokenPrice };
};

const isStablecoin = (asset: string) => asset === "USDT" || asset === "USDC";
const isBtcEth = (asset: string) => asset === "BTC" || asset === "ETH";

const dailyPurchaseAverages = (transactions: NfseTransaction[]) => {
  const sums = new Map<string, { v: number; q: number }>();
  for (const t of transactions) {
    if (text(t.tipo).toLowerCase() !== "compras") continue;
    const asset = text(t.ativo).toUpperCase();
    if (!isStablecoin(asset)) continue;
    const date = dateParts(t.dataHora ?? t.data);
    if (!date) continue;
    try {
      const { quantity, price } = normalizeAmounts(t);
      if (!(quantity > 0 && price > 0)) continue;
      const key = `${date.iso}:${asset}`;
      const sum = sums.get(key) ?? { v: 0, q: 0 };
      sum.v += price * quantity;
      sum.q += quantity;
      sums.set(key, sum);
    } catch {}
  }
  const averages = new Map<string, number>();
  sums.forEach((sum, key) => {
    if (sum.q > 0) averages.set(key, sum.v / sum.q);
  });
  return averages;
};

const validCpf = (raw: string) => {
  if (!/^\d{11}$/.test(raw) || /^(\d)\1{10}$/.test(raw)) return false;
  const check = (size: number) => {
    let sum = 0;
    for (let i = 0; i < size; i++) sum += Number(raw[i]) * (size + 1 - i);
    const remainder = (sum * 10) % 11;
    return (remainder === 10 ? 0 : remainder) === Number(raw[size]);
  };
  return check(9) && check(10);
};

const validCnpj = (raw: string) => {
  if (!/^\d{14}$/.test(raw) || /^(\d)\1{13}$/.test(raw)) return false;
  const calc = (factors: number[]) => {
    const sum = factors.reduce((acc, f, i) => acc + Number(raw[i]) * f, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return (
    calc([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(raw[12]) &&
    calc([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(raw[13])
  );
};

const normalizeCountry = (value: string) => {
  const upper = value.trim().toUpperCase();
  return !upper || ["BR", "BRA", "BRASIL", "BRAZIL", "1058"].includes(upper) ? "" : upper;
};

const rowForTemplate = (
  t: NfseTransaction,
  dateBR: string,
  total: number,
  quantity: number,
  tokenPrice: number,
  commission: number,
  noteValue: number,
  avgBuy: number,
  p: GenerateRpsNfseTxtParams,
): (string | number | null)[] => {
  const user = (t.User ?? t.user ?? {}) as Record<string, unknown>;
  const country = normalizeCountry(getField(user, ["pais", "country", "countryCode"]));
  const doc = digits(getField(user, ["document", "documento"]) || t.documento);
  if (!country && doc && !validCpf(doc) && !validCnpj(doc)) {
    throw new Error(`CPF/CNPJ do tomador inválido: documento com ${doc.length} dígitos`);
  }
  const name = getField(user, ["name", "nome"]) || text(t.nome);
  if (!name && doc) throw new Error("nome do tomador ausente");
  const rawCep = digits(getField(user, ["cep", "zipCode", "postalCode"]));
  const cep = rawCep.length === 8 && rawCep !== "00000000" ? rawCep : "";
  const cityIbge = digits(
    getField(user, [
      "codigoMunicipioIbge",
      "municipioIbge",
      "codigoIbge",
      "ibgeMunicipio",
      "cityIbge",
    ]),
  );
  const issuerRetains = p.issRetidoPadrao === "1" ? "S" : "N";
  const op = text(t.numeroOrdem);
  const asset = text(t.ativo).toUpperCase();
  const exchange = text(t.exchange).split(/\s+/)[0];
  const description = [
    "Prestacao de servicos de promocao de vendas de ativos digitais.",
    `Remuneracao pela prestacao do servico (spread/comissao): R$ ${brl(noteValue)} (${commission.toFixed(2)}%).`,
    ...(noteValue > roundMoney((total * commission) / 100)
      ? ["Valor minimo de remuneracao contratado aplicado ao arredondamento."]
      : []),
    `Operacao de referencia: R$ ${brl(total)}; corretora ${exchange}; ordem ${op}; data ${dateBR}.`,
    `Ativo ${asset}; quantidade ${quantity}; preco unitario ${Number.isFinite(tokenPrice) ? tokenPrice : "N/D"}; referencia de compra ${avgBuy.toFixed(4)} BRL.`,
    "O valor total transacionado nao constitui o valor do servico.",
  ]
    .join(" ")
    .slice(0, 1800);

  const cols: (string | number | null)[] = Array(NOTAS_COLUMNS).fill(null);
  const put = (col: number, value: string | number | null | undefined) => {
    cols[col - 1] = value === undefined || value === "" ? null : value;
  };
  put(1, doc || null); // CPF/CNPJ como TEXTO, inclusive zeros iniciais
  put(2, name || null);
  put(3, getField(user, ["inscricaoMunicipal", "municipalRegistration", "ccm"]));
  put(4, cep);
  put(5, getField(user, ["logradouro", "street", "addressStreet", "endereco"]));
  put(6, getField(user, ["complemento", "complement", "addressComplement"]));
  put(7, getField(user, ["numero", "number", "addressNumber"]));
  put(8, getField(user, ["bairro", "neighborhood", "district"]));
  put(9, cityIbge.length === 7 ? cityIbge : null);
  put(10, getField(user, ["cidade", "city"]));
  put(11, getField(user, ["uf", "state"]));
  put(12, country || null); // vazio = Brasil, conforme modelo
  put(13, digits(getField(user, ["telefone", "phone", "mobile"])));
  put(14, getField(user, ["email"]));
  put(15, description);
  put(16, text(p.itemListaServico));
  put(17, text(p.codigoTributacaoMunicipio));
  put(18, digits(p.codigoCnae) || null);
  put(19, digits(p.codigoNbs));
  put(20, digits(p.municipioPrestacaoIbge));
  put(21, digits(p.municipioIncidenciaIbge));
  put(22, p.regimeEspecialTributacao ?? 0);
  put(23, p.naturezaOperacao ?? 1);
  put(24, p.exigibilidadeIss ?? 1);
  put(25, issuerRetains);
  put(26, p.incentivadorCultural ? "S" : "N");
  put(27, dateBR);
  put(28, noteValue);
  put(29, p.aliquotaPercentual ?? 5);
  // 30 a 35: retenções/deduções - sem preencher números não comprovados.
  put(36, p.ibsCbs?.codigoClassificacaoTributaria ?? null);
  put(37, p.ibsCbs?.codigoIndicadorOperacao ?? null);
  put(38, p.ibsCbs?.aliquotaIbsUf ?? null);
  put(39, p.ibsCbs?.aliquotaIbsMunicipio ?? null);
  put(40, p.ibsCbs?.aliquotaCbs ?? null);
  put(41, p.ibsCbs?.baseCalculo ?? null);
  put(42, p.aliquotaSimplesNacional ?? null);
  put(43, `Ordem ${op}; ${asset}; ${exchange}; operacao R$ ${brl(total)}.`);
  put(44, null);
  return cols;
};

const download = (data: BlobPart, name: string, mime: string) => {
  const objectUrl = URL.createObjectURL(new Blob([data], { type: mime }));
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
};

const mandatoryConfigErrors = (p: GenerateRpsNfseTxtParams) => {
  const missing: string[] = [];
  const prestador = p.prestador ?? CRYPTOTECH_PRESTADOR_NFSE;
  if (digits(prestador.inscricaoMunicipal) !== CRYPTOTECH_CADASTRO_EMISSOR_BRASIL_NFE.IM) {
    missing.push("IM do PRESTADOR: configurar 4251350 no cadastro Brasil NFe");
  }
  if (digits(prestador.inscricaoEstadual) !== CRYPTOTECH_CADASTRO_EMISSOR_BRASIL_NFE.IE) {
    missing.push("IE do PRESTADOR: configurar 392526832116 no cadastro Brasil NFe");
  }
  if (digits(p.codigoCnae) !== CRYPTOTECH_CADASTRO_EMISSOR_BRASIL_NFE.CNAE) {
    missing.push("CNAE da promocao de vendas: 7319002 (nao 170601)");
  }
  if (text(p.itemListaServico) !== CRYPTOTECH_CADASTRO_EMISSOR_BRASIL_NFE.itemListaServico) {
    missing.push("itemListaServico: 17.06 corresponde ao codigo nacional 170601");
  }
  if (!/^\d{2}\.\d{2}$/.test(text(p.itemListaServico))) missing.push("itemListaServico (XX.XX)");
  if (!text(p.codigoTributacaoMunicipio)) missing.push("codigoTributacaoMunicipio");
  if (!/^1\d{8}$/.test(digits(p.codigoNbs))) {
    missing.push("codigoNbs (9 dígitos, iniciando em 1; ex.: 114061900)");
  }
  if (digits(p.municipioPrestacaoIbge).length !== 7)
    missing.push("municipioPrestacaoIbge (7 dígitos)");
  if (digits(p.municipioIncidenciaIbge).length !== 7)
    missing.push("municipioIncidenciaIbge (7 dígitos)");
  if (p.codigoCnae && digits(p.codigoCnae).length !== 7) missing.push("codigoCnae (7 dígitos)");
  const regime = p.regimeEspecialTributacao ?? 0;
  const nature = p.naturezaOperacao ?? 1;
  const exig = p.exigibilidadeIss ?? 1;
  if (!Number.isInteger(regime) || regime < 0 || regime > 6)
    missing.push("regimeEspecialTributacao (0 a 6)");
  if (!Number.isInteger(nature) || nature < 1 || nature > 7)
    missing.push("naturezaOperacao (1 a 7)");
  if (!Number.isInteger(exig) || exig < 1 || exig > 7) missing.push("exigibilidadeIss (1 a 7)");
  if (
    !Number.isFinite(p.aliquotaPercentual ?? 5) ||
    (p.aliquotaPercentual ?? 5) < 0 ||
    (p.aliquotaPercentual ?? 5) > 100
  )
    missing.push("aliquotaPercentual");
  if (p.issRetidoPadrao === "3")
    missing.push("issRetidoPadrao: modelo aceita somente S/N; informe 1 ou 2");
  if (
    p.valorMinimoNota !== undefined &&
    (!Number.isFinite(p.valorMinimoNota) || p.valorMinimoNota < 0)
  ) {
    missing.push("valorMinimoNota (deve ser maior ou igual a zero)");
  }
  return missing;
};

const NFSE_HEADERS: readonly string[] = [
  "CPF/CNPJ",
  "Nome",
  "IM",
  "CEP",
  "Logradouro",
  "Complemento",
  "Numero",
  "Bairro",
  "Cod. Municipio (IBGE)",
  "Municipio",
  "UF",
  "Pais (Sigla ou Cod. BACEN - vazio=Brasil)",
  "Telefone",
  "Email",
  "Descricao Servico",
  "Item Lista Servico",
  "Cod. Trib. Municipio",
  "Cod. CNAE",
  "Cod. NBS",
  "Cod. Mun. Prestacao",
  "Cod. Mun. Incidencia",
  "Regime Esp. Trib. (0-6)",
  "Natureza Operacao (1-7)",
  "Exigibilidade ISS (1-7)",
  "ISS Retido (S/N)",
  "Incentivador Cultural (S/N)",
  "Data Competencia (dd/MM/aaaa)",
  "Valor Servico",
  "Aliquota (%)",
  "Valor INSS",
  "Valor Deducoes",
  "Desconto Incondicionado",
  "Desconto Condicionado",
  "Outras Retencoes",
  "Total Tributos",
  "IBS/CBS Cod. Class. Trib.",
  "IBS/CBS Cod. Ind. Operacao",
  "IBS/CBS Aliq. IBS UF (%)",
  "IBS/CBS Aliq. IBS Mun (%)",
  "IBS/CBS Aliq. CBS (%)",
  "IBS/CBS Base Calculo",
  "Aliquota Simples Nacional (%)",
  "Informacoes Complementares",
  "Num. Pedido",
  "Obra - Cod. Obra (CNO/CEI)",
  "Obra - CIB",
  "Obra - Inscricao Imobiliaria",
  "Obra - CEP",
  "Obra - Logradouro",
  "Obra - Numero",
  "Obra - Complemento",
  "Obra - Bairro",
];
const NFSE_INSTRUCTIONS: readonly string[] = [
  "Instrucoes - Importacao de NFS-e em Lote",
  "",
  "1. Nao altere a ordem nem o nome das colunas da aba 'Notas'.",
  "2. A linha 1 e o cabecalho. Coloque uma nota por linha a partir da linha 2.",
  "3. Limite maximo: 500 notas por arquivo. Linhas alem disso serao ignoradas.",
  "4. Datas no formato dd/MM/aaaa (ex: 31/12/2026).",
  "5. Valores decimais aceitam virgula ou ponto (ex: 1000,00 ou 1000.00).",
  "",
  "Campos do Servico:",
  "  - Cod. CNAE: Classificacao Nacional de Atividades Economicas (7 digitos). Se vazio, usa o Cod. Trib. Municipio.",
  "  - Cod. NBS: Codigo NBS (obrigatorio para o padrao Nacional v1.01+).",
  "  - Cod. Mun. Prestacao / Incidencia: codigo IBGE de 7 digitos do municipio.",
  "  - Regime Esp. Trib.: 0=Sem Regime, 1=ME municipal, 2=Estimativa, 3=Soc. profissionais, 4=Cooperativa, 5=MEI SN, 6=ME EPP SN.",
  "  - Natureza Operacao: 1=Trib. no municipio, 2=Trib. fora, 3=Isencao, 4=Imune, 5=Susp. judicial, 6=Susp. administrativa, 7=Nao tributada.",
  "  - Exigibilidade ISS: 1=Exigivel, 2=Nao incidencia, 3=Isencao, 4=Exportacao, 5=Imunidade, 6=Susp. judicial, 7=Susp. administrativa.",
  "  - ISS Retido (S/N): se o tomador retem o ISS.",
  "  - Incentivador Cultural (S/N): aplica-se a Lei Rouanet etc.",
  "",
  "Campos do Tomador:",
  "  - CPF/CNPJ: somente numeros.",
  "  - CEP: 8 digitos somente numeros.",
  "  - Cod. Municipio (IBGE): 7 digitos. Ex: 3550308 = Sao Paulo/SP.",
  "  - UF: sigla com 2 letras (ex: SP, RJ).",
  "  - Pais: aceita a SIGLA de 2 letras ISO (ex: US, FR, PT, ES) OU o codigo BACEN numerico (ex: 2496=EUA, 5550=Portugal). Vazio = Brasil (1058). No exterior o CPF/CNPJ pode ficar vazio e o endereco e auto-completado.",
  "  - Sem tomador? deixe CPF/CNPJ e Nome em branco - se o municipio permitir, a nota sai sem tomador.",
  "",
  "Valores:",
  "  - Valor Servico: total bruto do servico.",
  "  - Aliquota (%): aliquota do ISS em percentual (ex: 5,00 = 5%).",
  "  - Valor INSS / Outras Retencoes / Total Tributos: retencoes e tributos, quando aplicavel.",
  "  - Valor Deducoes: deducoes da base de calculo (quando aplicavel).",
  "  - Desconto Incondicionado / Condicionado: descontos (o incondicionado reduz a base de calculo).",
  "",
  "IBS/CBS (Reforma Tributaria) - preencha so se o municipio ja exigir o grupo:",
  "  - Cod. Class. Trib.: cClassTrib (6 digitos). Vazio usa o padrao 000001.",
  "  - Cod. Ind. Operacao: cIndOp (6 digitos).",
  "  - Aliq. IBS UF / IBS Mun / CBS (%): vazio aplica os percentuais padrao de teste da API (nao force 0).",
  "  - Base Calculo: vazio usa Valor Servico - Desconto Incondicionado.",
  "",
  "Obra (construcao civil) - opcional, usada na emissao pelo padrao Nacional:",
  "  - Exigida nos servicos 07.02, 07.04, 07.05, 07.06, 07.07, 07.08, 07.17, 07.19 e 14.14. Sem nenhum dado da obra, o endereco do tomador e usado como local da obra.",
  "  - Informe um identificador: Cod. Obra (CNO/CEI), ou CIB (8 caracteres), ou o endereco da obra (CEP, Logradouro, Numero, Complemento, Bairro).",
  "  - Se mais de um for preenchido, vale nesta ordem: Cod. Obra, CIB, endereco.",
  "  - Inscricao Imobiliaria: opcional, vai junto com qualquer um dos identificadores.",
  "  - CEP da obra: 8 digitos somente numeros (formate a coluna como texto para nao perder o zero inicial).",
];

const escapeXml = (value: unknown): string =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const columnLetter = (index: number): string => {
  let remaining = index;
  let name = "";
  while (remaining > 0) {
    remaining -= 1;
    name = String.fromCharCode(65 + (remaining % 26)) + name;
    remaining = Math.floor(remaining / 26);
  }
  return name;
};

const xmlCell = (
  row: number,
  column: number,
  value: string | number | null,
  prefix = "",
): string => {
  if (value === null || value === "") return "";
  const reference = `${columnLetter(column)}${row}`;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Valor inválido na célula ${reference}`);
    const style = [28, 29, 30, 31, 32, 33, 34, 35, 38, 39, 40, 41, 42].includes(column)
      ? ' s="2"'
      : "";
    return `<${prefix}c r="${reference}"${style}><${prefix}v>${value}</${prefix}v></${prefix}c>`;
  }
  return (
    `<${prefix}c r="${reference}" t="inlineStr"><${prefix}is>` +
    `<${prefix}t xml:space="preserve">${escapeXml(value)}</${prefix}t>` +
    `</${prefix}is></${prefix}c>`
  );
};

const sheetXml = (rows: (string | number | null)[][], isNotes: boolean): string => {
  const allRows: string[] = [];
  if (isNotes) {
    const cells = NFSE_HEADERS.map((h, i) =>
      xmlCell(1, i + 1, h, "").replace("<c ", '<c s="1" '),
    ).join("");
    allRows.push(`<row r="1" ht="28" customHeight="1">${cells}</row>`);
    rows.forEach((values, i) => {
      if (values.length !== NOTAS_COLUMNS) {
        throw new Error(`Registro ${i + 1}: esperadas 52 colunas; recebidas ${values.length}.`);
      }
      if (values[43] !== null && values[43] !== "") {
        throw new Error(
          `Registro ${i + 1}: coluna AR/Num. Pedido não pode ser preenchida (tag xPed).`,
        );
      }
      const n = i + 2;
      const cells = values.map((v, j) => xmlCell(n, j + 1, v, "")).join("");
      allRows.push(`<row r="${n}">${cells}</row>`);
    });
  } else {
    NFSE_INSTRUCTIONS.forEach((message, i) => {
      const n = i + 1;
      const cell = message ? xmlCell(n, 1, message, "") : "";
      allRows.push(`<row r="${n}">${cell}</row>`);
    });
  }
  const lastRow = isNotes ? rows.length + 1 : NFSE_INSTRUCTIONS.length;
  const lastCol = isNotes ? "AZ" : "A";
  const cols = isNotes
    ? '<cols><col min="1" max="2" width="25" customWidth="1"/>' +
      '<col min="3" max="14" width="21" customWidth="1"/>' +
      '<col min="15" max="15" width="54" customWidth="1"/>' +
      '<col min="16" max="42" width="22" customWidth="1"/>' +
      '<col min="43" max="43" width="46" customWidth="1"/>' +
      '<col min="44" max="52" width="25" customWidth="1"/></cols>'
    : '<cols><col min="1" max="1" width="110" customWidth="1"/></cols>';
  const autoFilter = isNotes ? `<autoFilter ref="A1:AZ${lastRow}"/>` : "";
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<dimension ref="A1:${lastCol}${lastRow}"/>` +
    '<sheetViews><sheetView workbookViewId="0"/></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="18"/>' +
    cols +
    `<sheetData>${allRows.join("")}</sheetData>` +
    autoFilter +
    "</worksheet>"
  );
};

const buildSpreadsheet = async (rows: (string | number | null)[][]): Promise<Uint8Array> => {
  if (!rows.length || rows.length > MAX_NOTAS_POR_ARQUIVO) {
    throw new Error("Cada arquivo XLSX deve conter entre 1 e 500 notas.");
  }
  const zip = new JSZip();
  const mainNs = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const relNs = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      "</Types>",
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      "</Relationships>",
  );
  zip.file(
    "xl/workbook.xml",
    '<?xml version="1.0" encoding="UTF-8"?>' +
      `<workbook xmlns="${mainNs}" xmlns:r="${relNs}">` +
      '<sheets><sheet name="Notas" sheetId="1" r:id="rId1"/>' +
      '<sheet name="Instrucoes" sheetId="2" r:id="rId2"/></sheets></workbook>',
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    '<?xml version="1.0" encoding="UTF-8"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      "</Relationships>",
  );
  zip.file(
    "xl/styles.xml",
    '<?xml version="1.0" encoding="UTF-8"?>' +
      `<styleSheet xmlns="${mainNs}">` +
      '<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>' +
      '<fonts count="2"><font><sz val="10"/><name val="Calibri"/></font>' +
      '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FF25436B"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
      '<xf numFmtId="0" fontId="1" fillId="1" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
      '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
      "</styleSheet>",
  );
  zip.file("xl/worksheets/sheet1.xml", sheetXml(rows, true));
  zip.file("xl/worksheets/sheet2.xml", sheetXml([], false));
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
};

export const generateRpsNfseTxt = async (
  p: GenerateRpsNfseTxtParams,
): Promise<GenerateRpsNfseTxtResult | null> => {
  p = {
    itemListaServico: CRYPTOTECH_CODIGOS_SERVICO.itemListaServico,
    codigoTributacaoMunicipio: CRYPTOTECH_CODIGOS_SERVICO.codigoTributacaoMunicipio,
    codigoNbs: CRYPTOTECH_CODIGOS_SERVICO.codigoNbs,
    codigoCnae: CRYPTOTECH_CODIGOS_SERVICO.codigoCnae,
    municipioPrestacaoIbge: CRYPTOTECH_CODIGOS_SERVICO.municipioIbge,
    municipioIncidenciaIbge: CRYPTOTECH_CODIGOS_SERVICO.municipioIbge,
    ...p,
    prestador: {
      ...CRYPTOTECH_PRESTADOR_NFSE,
      ...(p.prestador ?? {}),
    },
  };

  const allSales = (Array.isArray(p.transactions) ? p.transactions : []).filter(
    (t) => text(t.tipo).toLowerCase() === "vendas",
  );
  if (!allSales.length) {
    alert("Nenhuma venda foi encontrada. Compras não são exportadas como notas de venda.");
    return null;
  }

  const orderKey = (t: NfseTransaction) =>
    `${text(t.exchange).split(/\s+/)[0].toUpperCase()}|${text(t.numeroOrdem).toUpperCase()}`;
  const authorizedKeys = new Set(
    (p.ordensAutorizadasEmProducao ?? []).map((id) => text(id).toUpperCase()),
  );
  const availableKeys = new Set(allSales.map(orderKey));
  const unknownKeys = [...authorizedKeys].filter((key) => !availableKeys.has(key));
  if (unknownKeys.length) {
    alert(
      "Exportação cancelada: ordens indicadas como autorizadas não constam do período: " +
        unknownKeys.slice(0, 10).join(", "),
    );
    return null;
  }
  const sales = allSales.filter((t) => !authorizedKeys.has(orderKey(t)));
  if (!sales.length) {
    alert(
      "Nenhuma venda pendente: todas as ordens do período foram marcadas como autorizadas em produção.",
    );
    return null;
  }

  const configErrors = mandatoryConfigErrors(p);
  if (configErrors.length) {
    alert(
      `Configure os campos fiscais obrigatórios antes de gerar as NFS-e:\n${configErrors.join("\n")}`,
    );
    return null;
  }

  const start = dateParts(p.startDate);
  const end = dateParts(p.endDate);
  if (!start || !end || start.iso > end.iso) {
    alert("Intervalo de datas inválido.");
    return null;
  }

  const averages = dailyPurchaseAverages(p.transactions);
  const errors: string[] = [];
  const usedOrderIds = new Set<string>();
  const generatedRows: (string | number | null)[][] = [];
  let totalCents = 0;

  for (const t of sales) {
    const orderId = text(t.numeroOrdem);
    const key = `${text(t.exchange)}:${orderId}`;
    try {
      if (!orderId) throw new Error("número de ordem ausente");
      if (usedOrderIds.has(key)) throw new Error("ordem duplicada no lote");
      usedOrderIds.add(key);
      const date = dateParts(t.dataHora ?? t.data);
      if (!date) throw new Error("data da operação inválida");
      if (date.iso < start.iso || date.iso > end.iso)
        throw new Error("data fora do período selecionado");
      const asset = text(t.ativo).toUpperCase();
      if (!asset) throw new Error("ativo ausente");
      const { total, quantity, price } = normalizeAmounts(t);
      const avg = averages.get(`${date.iso}:${asset}`) ?? Number(p.precoMedioCompraMensal ?? 0);
      const fixed = p.comissaoFixaPercentual ?? 0.0025;
      const margin = p.margemErroPorToken ?? 0.01;
      let commission: number;
      if (isBtcEth(asset))
        commission = 4.9; // mantido do gerador anterior
      else if (
        p.commissionMode === "fixa" ||
        !isStablecoin(asset) ||
        !Number.isFinite(price) ||
        price <= 0 ||
        avg <= 0
      ) {
        commission = fixed;
      } else {
        const adjusted = Number((price - margin).toFixed(8));
        const spread = adjusted > avg ? Number((((adjusted - avg) / avg) * 100).toFixed(2)) : 0;
        commission = Math.max(fixed, spread);
      }
      if (!(commission > 0 && commission <= 100))
        throw new Error("percentual de comissão inválido");
      const pisoConfigurado = roundMoney(p.valorMinimoNota ?? 0);
      const value = Math.max(roundMoney(total * (commission / 100)), pisoConfigurado);
      if (value <= 0)
        throw new Error(
          "comissão arredondou para R$ 0,00: configure valorMinimoNota se existir piso contratual",
        );
      const row = rowForTemplate(t, date.br, total, quantity, price, commission, value, avg, p);
      generatedRows.push(row);
      totalCents += Math.round(value * 100);
    } catch (err: unknown) {
      errors.push(
        `Ordem ${orderId || "SEM ID"}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (errors.length) {
    alert(
      `Exportação cancelada: ${errors.length} venda(s) inválida(s) entre ${sales.length}.\n` +
        errors.slice(0, 25).join("\n") +
        (errors.length > 25 ? "\n..." : ""),
    );
    return null;
  }

  const size = Math.min(
    MAX_NOTAS_POR_ARQUIVO,
    Math.max(1, Math.floor(p.maxNotasPorArquivo ?? MAX_NOTAS_POR_ARQUIVO)),
  );
  const totalFiles = Math.ceil(generatedRows.length / size);
  const baseName = safeFilePart(p.fileName || `nfse-lote-${start.iso}_${end.iso}`) || "nfse-lote";
  const generatedFiles: { name: string; bytes: Uint8Array }[] = [];

  try {
    for (let i = 0; i < totalFiles; i++) {
      const subset = generatedRows.slice(i * size, (i + 1) * size);
      const bytes = await buildSpreadsheet(subset);
      const fileName = `${baseName}-parte-${String(i + 1).padStart(2, "0")}-de-${String(totalFiles).padStart(2, "0")}.xlsx`;
      generatedFiles.push({ name: fileName, bytes });
    }
    if (generatedFiles.length === 1) {
      download(
        generatedFiles[0].bytes as BlobPart,
        generatedFiles[0].name,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } else {
      const zip = new JSZip();
      generatedFiles.forEach(({ name, bytes }) => zip.file(name, bytes));

      const csvField = (value: unknown) => `"${text(value).replace(/"/g, '""')}"`;
      const controlLines = [
        "Lote;Arquivo;LinhaExcel;ChaveOrdem;DataCompetencia;ValorServico;SituacaoProducao",
      ];
      generatedRows.forEach((row, i) => {
        const part = Math.floor(i / size);
        const key = orderKey(sales[i]);
        controlLines.push(
          [
            part + 1,
            generatedFiles[part].name,
            (i % size) + 2,
            key,
            row[26],
            row[27],
            "PENDENTE_DE_CONFERENCIA",
          ]
            .map(csvField)
            .join(";"),
        );
      });
      zip.file("CONTROLE_LOTES_PRODUCAO.csv", "\uFEFF" + controlLines.join("\r\n"));
      // Conferencia separada: o importador nao le IM/IE do prestador do XLSX.
      // Configure estes campos no CADASTRO DA EMPRESA na Brasil NFe.
      zip.file(
        "CONFIGURACAO_PRESTADOR_BRASIL_NFE.json",
        JSON.stringify(
          {
            ...CRYPTOTECH_CADASTRO_EMISSOR_BRASIL_NFE,
            razaoSocial: CRYPTOTECH_PRESTADOR_NFSE.razaoSocial,
            enderecoPrestador: p.prestador,
            aviso:
              "Arquivo auxiliar, NAO importar como nota fiscal. IM/IE/CNAE devem estar no cadastro da empresa no emissor. A coluna C do XLSX refere-se ao tomador.",
            campoXmlDpsParaE0116: "DPS/infDPS/prest/IM",
          },
          null,
          2,
        ),
      );
      zip.file(
        "LEIA_ANTES_DO_ENVIO.txt",
        [
          "E0116: CADASTRE NO EMISSOR a IM do PRESTADOR 4251350; a coluna C 'IM' do XLSX pertence ao TOMADOR.",
          "IE do prestador: 392526832116; CNAE: 7319002; codigo nacional do servico: 170601.",
          "Na DPS gerada pela plataforma, confira a tag: <prest><IM>4251350</IM></prest>.",
          "Os dados fiscais do emitente nao sao consumidos do XLSX; consulte e atualize a empresa na Brasil NFe.",
          "ATENCAO: As planilhas NAO possuem numero nem serie de RPS, DPS ou NFS-e.",
          "O sistema emissor decide a numeracao; nao use a coluna 'Num. Pedido' para isso.",
          "Confira no portal o ambiente, a serie e o proximo RPS/DPS de PRODUCAO.",
          "Homologacao NAO comprova que notas foram autorizadas em PRODUCAO.",
          "Importe UM arquivo por vez, confira o retorno por ordem e so entao avance.",
          "Nao reenvie ordens ja autorizadas em producao.",
          "Se houver rejeicao, conserve a mensagem literal e confira antes de tentar novamente.",
          `Total de vendas pendentes exportadas: ${sales.length}`,
          `Ordens autorizadas em producao expressamente excluidas: ${authorizedKeys.size}`,
        ].join("\r\n"),
      );
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      download(blob, `${baseName}-${totalFiles}-arquivos.zip`, "application/zip");
    }
  } catch (err: unknown) {
    alert(`Falha ao gerar arquivo(s) NFS-e: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }

  const totalValorNotas = totalCents / 100;
  const currentRps = Number(p.rpsNumeroInicial) || getNextRpsNumber();
  return {
    totalValorNotas,
    totalValorNotasFormatado: brl(totalValorNotas),
    quantidadeNotas: generatedRows.length,
    quantidadeArquivos: totalFiles,
    nomesArquivos: generatedFiles.map((f) => f.name),
    quantidadeIgnoradaPorAutorizacaoConfirmada: authorizedKeys.size,
    primeiroRps: currentRps,
    proximoRps: currentRps, // SEM avanço: planilha não contém número de RPS.
  };
};

export const generateNfseLoteXlsx = generateRpsNfseTxt;
