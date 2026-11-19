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

  link.download = `${nome}\_${dataInicial}-${dataFinal}.txt`;

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

/**
 * Gera DeCripto de compra e venda sem mudar os helpers ou os fluxos externos.
 *
 * Protecoes adicionadas SOMENTE neste handler:
 *  - quantidade com ponto e tres decimais e decimal (172.117 => 172,1170000000);
 *  - moeda com separador brasileiro e checada com quantidade * preco, se disponivel;
 *  - datas reais validadas (nao grava "Invalid Date");
 *  - nunca exporta arquivo parcial quando ha operacoes invalidas;
 *  - nao declara a mesma ordem duas vezes no mesmo arquivo.
 *
 * ATENCAO: a existencia da RPS/NFS-e nao e verificada aqui. A geracao de RPS
 * e feita em generateRpsNfseTxt, que permanece propositalmente inalterado.
 */
export const handleCompraVendaDeCripto = (
  formData: DeCriptoTransaction[],
  acesso?: DeCriptoAcesso,
  options: HandleCompraVendaDeCriptoOptions = {},
) => {
  const linhasSemExchange: string[] = [];
  const linhasExchangeEstrangeira: string[] = [];
  const erros: string[] = [];
  const idsGerados = new Set<string>();
  const transactions = Array.isArray(formData) ? formData : [];
  let totalElegiveis = 0;

  /**
   * A regra antiga que removia ponto seguido de tres digitos nao pode ser usada
   * para quantidade: "172.117" significa 172,117 USDT e NAO 172117 USDT.
   * Mantemos os dois candidatos possiveis ate decidir com base na ordem.
   */
  const candidatosDecimais = (value: unknown): number[] => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? [value] : [];
    }

    const raw = String(value ?? "")
      .trim()
      .replace(/\s/g, "");
    if (!raw) return [];

    if (/^-?\d+(?:\.\d+)?e[+-]?\d+$/i.test(raw)) {
      const scientific = Number(raw);
      return Number.isFinite(scientific) ? [scientific] : [];
    }
    // Nao remover o "e" de notacao cientifica malformada: rejeitar com erro.
    if (/[eE]/.test(raw)) return [];

    const clean = raw.replace(/[^\d,.-]/g, "");
    if (!/^-?[\d.,]+$/.test(clean) || !/\d/.test(clean)) return [];

    let canonical = clean;
    if (clean.includes(",") && clean.includes(".")) {
      // Determina qual e o separador decimal pela ultima ocorrencia.
      const lastComma = clean.lastIndexOf(",");
      const lastDot = clean.lastIndexOf(".");
      canonical =
        lastComma > lastDot ? clean.replace(/\./g, "").replace(",", ".") : clean.replace(/,/g, "");
    } else if (clean.includes(",")) {
      const commas = (clean.match(/,/g) ?? []).length;
      canonical =
        commas > 1 && /^-?\d{1,3}(,\d{3})+$/.test(clean)
          ? clean.replace(/,/g, "")
          : clean.replace(",", ".");
    } else if ((clean.match(/\./g) ?? []).length > 1) {
      canonical = /^-?\d{1,3}(\.\d{3})+$/.test(clean) ? clean.replace(/\./g, "") : "";
    }

    if (!/^-?\d+(?:\.\d+)?$/.test(canonical)) return [];
    const decimal = Number(canonical);
    if (!Number.isFinite(decimal)) return [];

    const candidates = [decimal];
    // "1.000" pode ser 1,000 OU 1000, dependendo do contexto.
    // Nunca remover o ponto de toda quantidade indiscriminadamente.
    if (/^-?\d{1,3}\.\d{3}$/.test(clean) && !clean.includes(",")) {
      const thousands = Number(clean.replace(".", ""));
      if (Number.isFinite(thousands) && thousands !== decimal) {
        candidates.push(thousands);
      }
    }
    return candidates;
  };

  const escolherNumero = (
    value: unknown,
    kind: "valor" | "quantidade" | "taxa" | "preco",
    context?: { valor?: number; quantidade?: number; preco?: number },
  ): number | null => {
    const candidates = candidatosDecimais(value);
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0];

    const [decimal, milhar] = candidates;
    // Com preco unitario conhecido, escolhe a interpretacao que reproduz
    // melhor o valor total da operacao (sem deduzir preco de mercado externo).
    const expected =
      kind === "quantidade"
        ? (context?.valor ?? 0) / (context?.preco ?? 0)
        : kind === "valor"
          ? (context?.quantidade ?? 0) * (context?.preco ?? 0)
          : 0;
    if (Number.isFinite(expected) && expected > 0) {
      const distance = (n: number) => Math.abs(n - expected) / Math.max(expected, 1);
      if (Math.abs(distance(decimal) - distance(milhar)) > 0.01) {
        return distance(decimal) < distance(milhar) ? decimal : milhar;
      }
    }

    // Na ausencia de evidencia, "1.000" em valor BRL costuma representar
    // mil reais; na quantidade, ponto e separador decimal do token.
    return kind === "valor" ? milhar : decimal;
  };

  const dataValida = (item: DeCriptoTransaction): string => {
    const sources = [item.dataHora, item.data];
    for (const value of sources) {
      const raw = String(value ?? "").trim();
      let day = 0;
      let month = 0;
      let year = 0;
      const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
      const br = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})(?:$|[\s,])/);
      if (iso) {
        year = Number(iso[1]);
        month = Number(iso[2]);
        day = Number(iso[3]);
      } else if (br) {
        day = Number(br[1]);
        month = Number(br[2]);
        year = Number(br[3]);
      } else {
        continue;
      }

      const dt = new Date(Date.UTC(year, month - 1, day));
      if (
        dt.getUTCFullYear() === year &&
        dt.getUTCMonth() === month - 1 &&
        dt.getUTCDate() === day
      ) {
        return `${String(day).padStart(2, "0")}${String(month).padStart(2, "0")}${year}`;
      }
    }
    return "";
  };

  const moeda = (value: number, decimals: number) => value.toFixed(decimals).replace(".", ",");
  const obsOrdem = (item: DeCriptoTransaction, index: number) =>
    String(item.numeroOrdem ?? `posição ${index + 1}`);

  transactions.forEach((item, index) => {
    const tipo = String(item.tipo ?? "")
      .trim()
      .toLowerCase();
    const ordem = obsOrdem(item, index);
    const recordType = resolveDeCriptoRecordType(item, acesso);

    if (!recordType) {
      erros.push(`Ordem ${ordem}: tipo de operação inválido: ${tipo || "vazio"}.`);
      return;
    }
    if (options.onlyDeclaredSales && recordType !== "0120") return;
    totalElegiveis += 1;

    const data = dataValida(item);
    const ativo = sanitizeField(item.ativo, 10).toUpperCase();
    const precoRaw = (item as DeCriptoTransaction & { valorToken?: string | number }).valorToken;
    const preco = escolherNumero(precoRaw, "preco");
    const valorInicial = escolherNumero(item.valor, "valor");
    const quantidade = escolherNumero(item.quantidade, "quantidade", {
      valor: valorInicial ?? undefined,
      preco: preco ?? undefined,
    });
    const valor = escolherNumero(item.valor, "valor", {
      quantidade: quantidade ?? undefined,
      preco: preco ?? undefined,
    });
    const taxa = escolherNumero(item.taxa ?? item.taxas ?? 0, "taxa");

    const missing: string[] = [];
    if (!data) missing.push("dataHora/data inválida");
    if (!ativo) missing.push("ativo");
    if (valor === null || valor <= 0) missing.push("valor");
    if (quantidade === null || quantidade <= 0) missing.push("quantidade");
    if (taxa === null || taxa < 0) missing.push("taxa");
    if (missing.length) {
      erros.push(`Ordem ${ordem}: campos ausentes/inválidos: ${missing.join(", ")}.`);
      return;
    }
    // Narrowing explicito: a validacao acima ja notificou os campos invalidos.
    if (valor === null || quantidade === null || taxa === null) return;

    // Verificacao contra erros de escala x1000, quando preco unitario existe.
    // Somente bloqueia desvios extremos, nao pequenas diferencas por spread.
    if (preco !== null && preco > 0 && ativo === "USDT") {
      const implied = quantidade * preco;
      const factor = implied / valor;
      if (!Number.isFinite(factor) || factor > 100 || factor < 0.01) {
        erros.push(
          `Ordem ${ordem}: valor/quantidade/preço inconsistentes ` +
            `(R$ ${valor}, ${quantidade} ${ativo}, unitário ${preco}). ` +
            `Verifique separadores decimal/milhar na origem.`,
        );
        return;
      }
    }

    const uniqueId = String(item.numeroOrdem ?? "").trim();
    const uniqueKey = uniqueId ? `${recordType}:${String(item.exchange ?? "")}:${uniqueId}` : "";
    if (uniqueKey) {
      if (idsGerados.has(uniqueKey)) {
        erros.push(`Ordem ${ordem}: número duplicado na mesma corretora e tipo de operação.`);
        return;
      }
      idsGerados.add(uniqueKey);
    }

    const base = [
      recordType,
      data,
      "I",
      moeda(valor, 2),
      moeda(taxa, 2),
      ativo,
      moeda(quantidade, 10),
    ];

    if (isCryptotechExchange(item.exchange)) {
      const party = resolvePartyFields(
        resolveCounterpartyForDirectOperation(item, acesso, options.cryptotechParty),
      );
      if (!party.tipoNI || !party.pais || (!party.cpfCnpj && !party.ni && !party.plataforma)) {
        erros.push(
          `Ordem ${ordem}: contraparte sem CPF/CNPJ/NI/plataforma para layout SEM Exchange.`,
        );
        return;
      }
      linhasSemExchange.push(
        [
          ...base,
          party.tipoNI,
          party.pais,
          party.cpfCnpj,
          party.ni,
          party.nome,
          party.plataforma,
        ].join("|"),
      );
      return;
    }

    const exchange = resolveExchangeFields(item.exchange);
    if (!exchange.nome || !exchange.url || !exchange.pais) {
      erros.push(
        `Ordem ${ordem}: exchange deve ter NOME URL PAIS, ` +
          `ex.: "Bybit https://www.bybit.com/ SG".`,
      );
      return;
    }
    linhasExchangeEstrangeira.push([...base, exchange.nome, exchange.url, exchange.pais].join("|"));
  });

  // Nao emitir TXT incompleto: ao contrario da versao anterior, que gerava
  // arquivo parcial e so depois avisava sobre operacoes omitidas.
  if (erros.length > 0) {
    alert(
      `DeCripto NÃO GERADA: ${erros.length} operação(ões) precisam ser corrigidas.\n\n` +
        `${erros.slice(0, 25).join("\n")}` +
        `${erros.length > 25 ? `\n... e mais ${erros.length - 25} erro(s).` : ""}\n\n` +
        `Nenhum arquivo foi baixado para evitar declarações incompletas.`,
    );
    return { semExchange: 0, exchangeEstrangeira: 0, erros };
  }

  if (totalElegiveis === 0) {
    alert("Nenhuma operação elegível encontrada para gerar a DeCripto.");
    return { semExchange: 0, exchangeEstrangeira: 0, erros };
  }

  const prefix = options.filePrefix ?? "DeCripto_Compra_Venda";
  gerarArquivoTxt(linhasSemExchange, `${prefix}_SEM_Exchange`);
  gerarArquivoTxt(linhasExchangeEstrangeira, `${prefix}_Exchange_Estrangeira`);

  return {
    semExchange: linhasSemExchange.length,
    exchangeEstrangeira: linhasExchangeEstrangeira.length,
    erros,
  };
};
