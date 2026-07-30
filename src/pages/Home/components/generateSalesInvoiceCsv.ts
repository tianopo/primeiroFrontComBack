import { normalizeVendaCodigo, parseBRL, parseNum, toBRDate } from "../config/helpers";

type CommissionMode = "fixa" | "dinamica";

type GenerateSalesInvoiceCsvResult = {
  totalValorNotas: number;
  totalValorNotasFormatado: string;
  quantidadeNotas: number;
};

type GenerateSalesInvoiceCsvParams = {
  transactions: any[];
  /**
   * Média ponderada de compra do período/mês filtrado.
   * Será usada apenas quando não existir compra no mesmo dia da venda.
   */
  precoMedioCompraMensal?: number;

  /**
   * Compatibilidade com chamadas antigas. Evite usar em novas chamadas.
   */
  precoMedioVenda?: number;

  endDate: string;
  fileName?: string;
  modeloNf?: "nfse" | "nfe";
  produtoCod?: string;
  produtoDescricao?: string;
  commissionMode?: CommissionMode;
  comissaoFixaPercentual?: number;
  margemErroPorToken?: number;
};

const INVOICE_HEADERS = [
  "Venda_codigo",
  "Venda_status",
  "Venda_data",
  "Venda_dataaprovacao",
  "modelo_nf",
  "Venda_produtocod",
  "Venda_produtodescricao",
  "descricao_nf",
  "Venda_valortotal",
  "Cliente_cpfcnpj",
  "Cliente_nome",
  "Cliente_razaosocial",
  "Cliente_email",
  "Cliente_telefone",
  "Cliente_celular",
  "Cliente_inscricaomunicipal",
  "Cliente_inscricaoestadual",
  "Venda_formapagamento",
  "Venda_enviaremail",
  "Venda_perfil",
  "Venda_transmitirnota",
  "Venda_datagarantia",
  "Cliente_endereco_logradouro",
  "Cliente_endereco_numero",
  "Cliente_endereco_bairro",
  "Cliente_endereco_complemento",
  "Cliente_endereco_cep",
  "Cliente_endereco_pais",
  "Cliente_endereco_cidade",
  "Cliente_endereco_estado",
];

const onlyDigits = (value: unknown) => {
  return String(value ?? "").replace(/\D/g, "");
};

const escapeCsv = (value: unknown) => {
  const text = String(value ?? "");

  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

const formatMoneyForCsv = (value: number) => {
  return Number(value || 0)
    .toFixed(2)
    .replace(".", ",");
};

const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
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

const isStable = (symbol: string) => {
  return ["USDT", "USDC"].includes(String(symbol || "").toUpperCase());
};

const isBtcOrEth = (symbol: string) => {
  return ["BTC", "ETH"].includes(String(symbol || "").toUpperCase());
};

const SERVICO_CNAE_PROMOCAO_INTERMEDIACAO = "Promoção de Vendas e Intermediação Comercial";

const DESCRICAO_CNAE_PROMOCAO_INTERMEDIACAO =
  "Prestação de serviços de promoção de vendas e intermediação comercial.";

const OBSERVACAO_CNAE_PROMOCAO_INTERMEDIACAO =
  "O CNAE é definido pela finalidade econômica da atividade exercida. " +
  "A promoção de vendas pode envolver aproximação comercial e apoio à concretização de negócios. " +
  "A nota fiscal refere-se à remuneração/spread pela prestação do serviço, " +
  "e não ao valor total movimentado na operação.";

const MAX_DESCRICAO_NF_LENGTH = 2000;

const limitDescricaoNf = (value: string, maxLength = MAX_DESCRICAO_NF_LENGTH) => {
  const text = String(value ?? "").trim();

  if (text.length <= maxLength) {
    return text;
  }

  const suffix = "\n- Texto limitado ao máximo aceito pela NFS-e.";
  const available = Math.max(0, maxLength - suffix.length);

  return `${text.slice(0, available).trimEnd()}${suffix}`;
};

const resolveDateKey = (value: string | Date | null | undefined) => {
  if (!value) return "";

  const raw = String(value).trim();

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  const brMatch = raw.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    return `${yyyy}-${mm}-${dd}`;
  }

  const brDate = toBRDate(value);
  if (!brDate || brDate === "Invalid Date") return "";

  const [dd, mm, yyyy] = String(brDate).split("/");
  if (!dd || !mm || !yyyy) return "";

  return `${yyyy}-${mm}-${dd}`;
};

const buildDailyPurchaseAverageByDate = (transactions: any[]) => {
  const grouped = new Map<string, { weightedSum: number; quantitySum: number }>();

  for (const transaction of transactions) {
    if (String(transaction?.tipo ?? "").toLowerCase() !== "compras") continue;

    const ativo = String(transaction?.ativo || "").toUpperCase();
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

    const current = grouped.get(dateKey) ?? { weightedSum: 0, quantitySum: 0 };

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
    return {
      precoMedioCompraReferencia: Number(dailyAverage),
      origemReferenciaComissao: "média ponderada de compra do dia",
    };
  }

  return {
    precoMedioCompraReferencia: Number.isFinite(precoMedioCompraMensal)
      ? precoMedioCompraMensal
      : 0,
    origemReferenciaComissao:
      "média ponderada de compra do período/mês por ausência de compra no dia",
  };
};

const calculateSaleCommission = ({
  transaction,
  precoMedioVenda,
  commissionMode,
  comissaoFixaPercentual,
  margemErroPorToken,
}: {
  transaction: any;
  precoMedioVenda: number;
  commissionMode: CommissionMode;
  comissaoFixaPercentual: number;
  margemErroPorToken: number;
}) => {
  const ativo = String(transaction?.ativo || "").toUpperCase();
  const valorTokenVendido = parseNum(transaction?.valorToken);

  if (isBtcOrEth(ativo)) {
    return {
      comissao: 9.5,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Ativo BTC/ETH, implementando taxa fixa de 9,50%.",
    };
  }

  if (commissionMode === "fixa") {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência de compra, implementando taxa fixa.",
    };
  }

  if (!isStable(ativo)) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência de compra, implementando taxa fixa.",
    };
  }

  if (!Number.isFinite(valorTokenVendido) || valorTokenVendido <= 0) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência de compra, implementando taxa fixa.",
    };
  }

  if (!Number.isFinite(precoMedioVenda) || precoMedioVenda <= 0) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência de compra, implementando taxa fixa.",
    };
  }

  const precoAjustado = Number((valorTokenVendido - margemErroPorToken).toFixed(8));

  if (precoAjustado <= precoMedioVenda) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência de compra, implementando taxa fixa.",
    };
  }

  const diferencaPorToken = Number((precoAjustado - precoMedioVenda).toFixed(8));

  const comissaoCalculada = Number(((diferencaPorToken / precoMedioVenda) * 100).toFixed(2));

  const comissaoFinal =
    comissaoCalculada > comissaoFixaPercentual ? comissaoCalculada : comissaoFixaPercentual;

  const isDinamica = comissaoFinal > comissaoFixaPercentual;

  return {
    comissao: Number(comissaoFinal.toFixed(2)),
    precoAjustado,
    diferencaPorToken,
    tipoComissao: isDinamica ? ("dinamica" as const) : ("fixa" as const),
    observacaoComissao: isDinamica
      ? "Valor acima do valor referência de compra, implementando taxa dinâmica."
      : "Comissão calculada abaixo da taxa mínima de 0,01%, implementando taxa fixa.",
  };
};

const buildDescricaoNf = ({
  transaction,
  comissao,
  valorNota,
  margemErroPorToken,
  precoMedioVenda,
  origemReferenciaComissao,
  observacaoComissao,
}: {
  transaction: any;
  comissao: number;
  valorNota: number;
  margemErroPorToken: number;
  precoMedioVenda: number;
  origemReferenciaComissao: string;
  observacaoComissao: string;
}) => {
  const descricao = `- Serviço: ${SERVICO_CNAE_PROMOCAO_INTERMEDIACAO}
- Descrição do Serviço: ${DESCRICAO_CNAE_PROMOCAO_INTERMEDIACAO}
- Valor da Nota Fiscal: ${formatMoneyForCsv(valorNota)} BRL
- Critério de Cálculo do Spread: ${comissao.toFixed(2)}% aplicado sobre o valor da operação.
- Valor Total da Operação de Referência: ${transaction.valor}
- Identificador da Ordem: ${transaction.numeroOrdem}
- Data: ${toBRDate(transaction.dataHora)}
- Valor do Token Vendido: ${transaction.valorToken}
- Ativo Digital: ${transaction.ativo}
- Quantidade: ${transaction.quantidade}
- Exchange/Corretora: ${String(transaction.exchange || "").split(" ")[0]}
- Margem de Erro Por Token: ${formatMoneyForCsv(margemErroPorToken)} BRL

Observação Fiscal
- ${OBSERVACAO_CNAE_PROMOCAO_INTERMEDIACAO}
- A empresa não atua como instituição financeira, não concede crédito, não capta recursos do público e não mantém contas de pagamento.
- ${observacaoComissao}

Suporte de Dúvidas
- Para informações sobre a operação, registros ou documentação de suporte, entre em contato no whatsapp: (12) 992546355`;

  return limitDescricaoNf(descricao);
};

const resolveInvoiceDate = (
  transactionDate: string | Date | null | undefined,
  fallbackEndDate: string,
) => {
  const transactionDateBr = transactionDate ? toBRDate(transactionDate) : "Invalid Date";

  if (transactionDateBr && transactionDateBr !== "Invalid Date") {
    return transactionDateBr;
  }

  const endDateBr = fallbackEndDate ? toBRDate(fallbackEndDate) : "Invalid Date";

  if (endDateBr && endDateBr !== "Invalid Date") {
    return endDateBr;
  }

  return fallbackEndDate;
};

export const generateSalesInvoiceCsv = ({
  transactions,
  precoMedioCompraMensal,
  precoMedioVenda,
  endDate,
  fileName = `notas-fiscais-vendas-${Date.now()}.csv`,
  modeloNf = "nfse",
  produtoCod = "S100",
  produtoDescricao = SERVICO_CNAE_PROMOCAO_INTERMEDIACAO,
  commissionMode = "dinamica",
  comissaoFixaPercentual = 0.01,
  margemErroPorToken = 0.05,
}: GenerateSalesInvoiceCsvParams): GenerateSalesInvoiceCsvResult | null => {
  if (!transactions || transactions.length === 0) {
    alert("Nenhuma transação encontrada para gerar o CSV de notas fiscais.");
    return null;
  }

  const salesTransactions = transactions.filter((transaction) => {
    return String(transaction?.tipo ?? "").toLowerCase() === "vendas";
  });

  if (salesTransactions.length === 0) {
    alert("Nenhuma venda encontrada para gerar o CSV de notas fiscais.");
    return null;
  }

  const precoMedioCompraMensalFinal = Number.isFinite(precoMedioCompraMensal)
    ? Number(precoMedioCompraMensal)
    : Number(precoMedioVenda || 0);

  const dailyPurchaseAverageByDate = buildDailyPurchaseAverageByDate(transactions);

  let totalValorNotas = 0;

  const vendaCodigoForCsv = (raw: unknown, fallback: string) => {
    const normalized = normalizeVendaCodigo(raw); // <- seu helper
    if (!normalized) return fallback;

    // ✅ Excel transforma números longos em notação científica.
    // Prefixo "'" força Excel a tratar como TEXTO (não vira 2,28E+19).
    return normalized.length >= 16 ? `'${normalized}` : normalized;
  };

  const invoiceRows = salesTransactions.map((transaction, index) => {
    const user = transaction?.User;

    const fallback = `VEN${String(index + 1).padStart(6, "0")}`;
    const vendaCodigo = vendaCodigoForCsv(transaction?.numeroOrdem, fallback);

    const vendaData = resolveInvoiceDate(
      transaction?.dataHora as string | Date | null | undefined,
      endDate,
    );

    const valorBRL = parseBRL(transaction?.valor);

    const { precoMedioCompraReferencia, origemReferenciaComissao } =
      resolvePrecoMedioCompraReferencia({
        transaction,
        dailyPurchaseAverageByDate,
        precoMedioCompraMensal: precoMedioCompraMensalFinal,
      });

    const { comissao, observacaoComissao } = calculateSaleCommission({
      transaction,
      precoMedioVenda: precoMedioCompraReferencia,
      commissionMode,
      comissaoFixaPercentual,
      margemErroPorToken,
    });

    const valorNota = Number((valorBRL * (comissao / 100)).toFixed(2));

    totalValorNotas += Number.isFinite(valorNota) ? valorNota : 0;

    const clienteDocumento = onlyDigits(user?.document);
    const clienteNome = String(user?.name ?? "Consumidor Final").trim();

    const descricaoNf = buildDescricaoNf({
      transaction,
      comissao,
      valorNota,
      margemErroPorToken,
      precoMedioVenda: precoMedioCompraReferencia,
      origemReferenciaComissao,
      observacaoComissao,
    });

    return [
      vendaCodigo,
      "Aprovado",
      vendaData,
      vendaData,
      modeloNf,
      produtoCod,
      produtoDescricao,
      descricaoNf,
      formatMoneyForCsv(valorNota),
      clienteDocumento,
      clienteNome,
      clienteNome,
      "",
      "",
      "",
      "",
      "",
      "PIX",
      "Não",
      "",
      "Não",
      "",
      "",
      "",
      "",
      "",
      "",
      "Brasil",
      "",
      "",
    ];
  });

  const csvContent = [INVOICE_HEADERS, ...invoiceRows]
    .map((line) => line.map(escapeCsv).join(";"))
    .join("\n");

  downloadCsv(csvContent, fileName);

  return {
    totalValorNotas: Number(totalValorNotas.toFixed(2)),
    totalValorNotasFormatado: formatMoneyForCsv(totalValorNotas),
    quantidadeNotas: invoiceRows.length,
  };
};
