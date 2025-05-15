export const mensalFiduciaTable = (transactions: any[]) => {
  const csvHeader = [
    "TIPO DE OPERAÇÃO",
    "SEQUENCIAL",
    "DATA DA OPERAÇÃO",
    "SIMBOLO CRIPTOATIVO",
    "QUANTIDADE DE CRIPTOATIVO",
    "CPF/CNPJ DO VENDEDOR",
    "NOME DO VENDEDOR",
    "VALOR OPERAÇÃO (R$)",
    "CPF/CNPJ COMPRADOR",
    "NOME COMPRADOR",
    "EXCHANGE",
  ];

  const deleteComma = (a: string) => a?.replace(/,/g, "");
  const formatNumber = (valor: any) => {
    const num = parseFloat(
      String(valor)
        .replace(/[^\d.,]/g, "")
        .replace(",", "."),
    );
    return isNaN(num) ? "0,0000" : num.toFixed(4).replace(".", ",");
  };
  const wrapIfNeeded = (value: string) => {
    return value.includes(",") ? `"${value}"` : value;
  };

  const csvRows = transactions.map((transaction, index) => {
    const [ano, mes, dia] = transaction.dataTransacao.split(" ")[0].split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const quantidade = wrapIfNeeded(formatNumber(transaction.quantidade));
    const valorOperacao = wrapIfNeeded(formatNumber(transaction.valor));

    const sellerName = deleteComma(transaction.seller?.name?.trim()) || "CRYPTO TECH";
    const sellerDocument =
      transaction.tipo === "compra"
        ? transaction.seller?.document?.trim()
        : sellerName === "CRYPTO TECH"
          ? "55.636.113/0001-70"
          : "";
    const buyerName = deleteComma(transaction.buyer?.name?.trim()) || "CRYPTO TECH";
    const buyerDocument = transaction.buyer?.document?.trim() || "55.636.113/0001-70";

    return [
      transaction.tipo,
      index + 1,
      dataFormatada,
      transaction.ativoDigital,
      quantidade,
      sellerDocument,
      sellerName,
      valorOperacao,
      buyerDocument,
      buyerName,
      transaction.exchange.split(" ")[0],
    ];
  });

  const csvContent = [csvHeader.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

  const blobCsv = new Blob([csvContent], { type: "text/csv" });
  const linkCsv = document.createElement("a");
  linkCsv.href = URL.createObjectURL(blobCsv);
  linkCsv.download = `relatorio_operacoes_mensais.csv`;
  document.body.appendChild(linkCsv);
  linkCsv.click();
  document.body.removeChild(linkCsv);
};
