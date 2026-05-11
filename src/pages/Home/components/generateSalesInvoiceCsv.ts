import { parseBRL, parseNum, toBRDate } from "../config/helpers";

type CommissionMode = "fixa" | "dinamica";

type GenerateSalesInvoiceCsvParams = {
  transactions: any[];
  precoMedioVenda: number;
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

const formatNumberBr = (value: number, decimals = 2) => {
  return Number(value || 0)
    .toFixed(decimals)
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
      observacaoComissao: "Valor abaixo do valor referência, implementando taxa fixa.",
    };
  }

  if (!isStable(ativo)) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência, implementando taxa fixa.",
    };
  }

  if (!Number.isFinite(valorTokenVendido) || valorTokenVendido <= 0) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência, implementando taxa fixa.",
    };
  }

  if (!Number.isFinite(precoMedioVenda) || precoMedioVenda <= 0) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado: valorTokenVendido,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência, implementando taxa fixa.",
    };
  }

  const precoAjustado = Number((valorTokenVendido - margemErroPorToken).toFixed(8));

  if (precoAjustado <= precoMedioVenda) {
    return {
      comissao: comissaoFixaPercentual,
      precoAjustado,
      diferencaPorToken: 0,
      tipoComissao: "fixa" as const,
      observacaoComissao: "Valor abaixo do valor referência, implementando taxa fixa.",
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
      ? "Valor acima do valor referência, implementando taxa dinâmica."
      : "Valor abaixo do valor referência, implementando taxa fixa.",
  };
};

const buildDescricaoNf = ({
  transaction,
  comissao,
  margemErroPorToken,
  precoMedioVenda,
  observacaoComissao,
}: {
  transaction: any;
  comissao: number;
  margemErroPorToken: number;
  precoMedioVenda: number;
  observacaoComissao: string;
}) => {
  return `- Serviço: Venda de Ativos Digitais
- Comissão: ${comissao.toFixed(2)}%
- Valor Referência da Comissão: ${formatMoneyForCsv(precoMedioVenda)} BRL
- Identificador da Ordem: ${transaction.numeroOrdem}
- Data: ${toBRDate(transaction.dataHora)}
- Valor do Token: ${transaction.valorToken}
- Ativo Digital: ${transaction.ativo}
- Quantidade: ${transaction.quantidade}
- Valor: ${transaction.valor}
- Exchange/Corretora: ${String(transaction.exchange || "").split(" ")[0]}
- Margem de Erro Por Token: ${formatMoneyForCsv(margemErroPorToken)} BRL

Observação
- ${observacaoComissao}

Suporte de Dúvidas
- Para informações do P2P, consulte a documentação ou o suporte da corretora, ou entre em contato no whatsapp: (12) 992546355`;
};

export const generateSalesInvoiceCsv = ({
  transactions,
  precoMedioVenda,
  fileName = `notas-fiscais-vendas-${Date.now()}.csv`,
  modeloNf = "nfse",
  produtoCod = "S100",
  produtoDescricao = "Venda de Ativos Digitais",
  commissionMode = "dinamica",
  comissaoFixaPercentual = 0.01,
  margemErroPorToken = 0.03,
}: GenerateSalesInvoiceCsvParams) => {
  if (!transactions || transactions.length === 0) {
    alert("Nenhuma transação encontrada para gerar o CSV de notas fiscais.");
    return;
  }

  const salesTransactions = transactions.filter((transaction) => {
    return String(transaction?.tipo ?? "").toLowerCase() === "vendas";
  });

  if (salesTransactions.length === 0) {
    alert("Nenhuma venda encontrada para gerar o CSV de notas fiscais.");
    return;
  }

  const invoiceRows = salesTransactions.map((transaction, index) => {
    const user = transaction?.User;

    const vendaCodigo =
      String(transaction?.numeroOrdem ?? "").trim() || `VEN${String(index + 1).padStart(6, "0")}`;

    const dataBr = toBRDate(transaction?.dataHora);
    const vendaData = dataBr === "Invalid Date" ? toBRDate(new Date()) : dataBr;

    const valorBRL = parseBRL(transaction?.valor);

    const { comissao, observacaoComissao } = calculateSaleCommission({
      transaction,
      precoMedioVenda,
      commissionMode,
      comissaoFixaPercentual,
      margemErroPorToken,
    });

    const valorNota = Number((valorBRL * (comissao / 100)).toFixed(2));

    const clienteDocumento = onlyDigits(user?.document);
    const clienteNome = String(user?.name ?? "Consumidor Final").trim();

    const descricaoNf = buildDescricaoNf({
      transaction,
      comissao,
      margemErroPorToken,
      precoMedioVenda,
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
};
