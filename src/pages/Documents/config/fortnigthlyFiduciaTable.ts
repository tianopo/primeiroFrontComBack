export const fortnigthlyFiduciaTable = (transactions: any[]) => {
  const csvHeader = [
    "PERÍODO",
    "NOME CLIENTE",
    "WALLET CLIENTE",
    "COMPRA/VENDA",
    "TITULARIDADE DA WALLET",
    "WALLET EXCHANGE / CORRETORA",
    "CRIPTO",
    "QUANTIDADE DE CRIPTO?",
    "VALOR REAL",
  ];

  const today = new Date();
  const monthName = today.toLocaleDateString("pt-BR", { month: "long" });

  const csvRows = transactions.map((transaction) => {
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

    const nomeCliente =
      transaction.tipo === "venda"
        ? deleteComma(transaction.buyer?.name)
        : deleteComma(transaction.seller?.name);
    const walletCliente =
      transaction.tipo === "venda"
        ? transaction.buyer?.counterparty
        : transaction.seller?.counterparty;
    const [ano, mes, dia] = transaction.dataTransacao.split(" ")[0].split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const quantidade = wrapIfNeeded(formatNumber(transaction.quantidade));
    const valorToken = wrapIfNeeded(formatNumber(transaction.valorToken));

    return [
      dataFormatada,
      nomeCliente,
      walletCliente,
      transaction.tipo,
      transaction.exchange.split(" ")[0],
      "Usuário de Exchange",
      transaction.ativoDigital,
      quantidade,
      valorToken,
    ];
  });

  const csvContent = [csvHeader.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

  // Criar o arquivo .csv para download
  const blobCsv = new Blob([csvContent], { type: "text/csv" });
  const linkCsv = document.createElement("a");
  linkCsv.href = URL.createObjectURL(blobCsv);
  linkCsv.download = `quinzenal_${monthName}.csv`;
  document.body.appendChild(linkCsv);
  linkCsv.click();
  document.body.removeChild(linkCsv);
};

export const exportToXLS = (transactions: any[]) => {
  const headers = [
    "PERÍODO",
    "NOME CLIENTE",
    "WALLET CLIENTE",
    "COMPRA/VENDA",
    "TITULARIDADE DA WALLET",
    "WALLET EXCHANGE / CORRETORA",
    "CRIPTO",
    "QUANTIDADE DE CRIPTO?",
    "VALOR REAL",
  ];

  const today = new Date();
  const monthName = today.toLocaleDateString("pt-BR", { month: "long" });

  const deleteComma = (a: string) => a?.replace(/,/g, "");
  const formatNumber = (valor: any) => {
    const num = parseFloat(
      String(valor)
        .replace(/[^\d.,]/g, "")
        .replace(",", "."),
    );
    return isNaN(num) ? "0,0000" : num.toFixed(4).replace(".", ",");
  };

  const rows = transactions.map((transaction) => {
    const nomeCliente =
      transaction.tipo === "venda"
        ? deleteComma(transaction.buyer?.name)
        : deleteComma(transaction.seller?.name);
    const walletCliente =
      transaction.tipo === "venda"
        ? transaction.buyer?.counterparty
        : transaction.seller?.counterparty;
    const [ano, mes, dia] = transaction.dataTransacao.split(" ")[0].split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const quantidade = formatNumber(transaction.quantidade);
    const valorToken = formatNumber(transaction.valorToken);

    return [
      dataFormatada,
      nomeCliente,
      walletCliente,
      transaction.tipo,
      transaction.exchange.split(" ")[0],
      "Usuário de Exchange",
      transaction.ativoDigital,
      quantidade,
      valorToken,
    ];
  });

  // Criação da tabela HTML com filtro e estilo
  const tableHtml = `
    <html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; }
        th {
          background-color: #c6efce;
          color: #006100;
          border: 1px solid #000;
        }
        td {
          border: 1px solid #000;
        }
      </style>
    </head>
    <body>
      <table border="1">
        <thead>
          <tr>
            ${headers.map((header) => `<th>${header}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
      <script>
        // Habilita filtros no Excel
        document.querySelector("table").setAttribute("x:autofilter", "all");
      </script>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `quinzenal_${monthName}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
