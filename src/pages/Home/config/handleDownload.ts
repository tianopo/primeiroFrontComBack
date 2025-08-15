const today = new Date();
const monthName = today.toLocaleDateString("pt-BR", { month: "long" });

export const handleCompraVendaIN1888 = (formData: any[], acesso?: string | null) => {
  const datesArrayDentro: string[] = [];
  const datesArrayFora: string[] = [];

  const linhasDentro: string[] = [];
  const linhasFora: string[] = [];

  formData.forEach((item) => {
    // Código de operação
    const operationCode =
      acesso === "User"
        ? item.tipo === "compras"
          ? "0120"
          : "0110"
        : item.tipo === "compras"
          ? "0110"
          : "0120";

    // Data
    const dataSeparada = item.dataHora?.split(" ")[0].split("-");
    const dataHora = `${dataSeparada[2]}${dataSeparada[1]}${dataSeparada[0]}`;

    // Valores
    const valorOperacao = item.valor?.replace("R$", "")?.replace(/\./g, "")?.replace(",", ".");

    const valorTaxas = item.taxa
      ? item.taxa.replace("R$", "").replace(/\./g, "").replace(",", ".")
      : "0,00";

    // Ativo e quantidade
    const simboloAtivo = item.ativo || "";
    const quantidade = parseFloat(item.quantidade.replace(",", "."))
      .toFixed(10)
      .toString()
      .replace(".", ",");

    // Se for CRYPTOTECH → Fora de exchange
    if (item.exchange?.includes("CRYPTOTECH")) {
      const pais = "BR";
      const CPFCNPJ = item.user?.document || "55.636.113/0001-70";
      const isCPF = /^\d{11}$/.test(CPFCNPJ);
      const isCNPJ = /^\d{14}$/.test(CPFCNPJ);
      const TipoNI = isCPF ? "1" : isCNPJ ? "2" : "";
      const NI = "";
      const Nome = (item.User?.name || "").slice(0, 80);

      linhasFora.push(
        `${operationCode}|${dataHora}|I|${valorOperacao.trim()}|${valorTaxas}|${simboloAtivo}|${quantidade}|${TipoNI}|${pais}|${CPFCNPJ}|${NI}|${Nome}`,
      );
      datesArrayFora.push(dataHora);
    }
    // Caso contrário → Dentro de exchange
    else {
      const exchange = item.exchange.split(" ")[0];
      const exchangeURL = item.exchange.split(" ")[1];
      const siglaPaisOrigemExchange = item.exchange?.split(" ")[2];

      linhasDentro.push(
        `${operationCode}|${dataHora}|I|${valorOperacao.trim()}|0,00|${simboloAtivo}|${quantidade}|${exchange}|${exchangeURL}|${siglaPaisOrigemExchange}`,
      );
      datesArrayDentro.push(dataHora);
    }
  });

  // Função para gerar download
  const gerarArquivo = (linhas: string[], datas: string[], nome: string) => {
    if (linhas.length === 0) return;
    const sortedDates = datas.sort();
    const dataInicial = sortedDates[0];
    const dataFinal = sortedDates[sortedDates.length - 1];

    const blob = new Blob([linhas.join("\r\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nome}_${dataInicial}-${dataFinal}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  linhasDentro.length > 0 &&
    gerarArquivo(linhasDentro, datesArrayDentro, "Compra_Venda_IN1888_Dentro_Exchanges");
  linhasFora.length > 0 &&
    gerarArquivo(linhasFora, datesArrayFora, "Compra_Venda_IN1888_Fora_Exchanges");
};

export const handlePermutaIN1888 = (permutaData: any[]) => {
  const textContent = permutaData
    .map((item) => {
      // Conversão de valores numéricos
      const formatarQuantidade = (qtd: string | number) =>
        parseFloat(qtd.toString().replace(",", ".")).toFixed(10).replace(".", ",");

      const formatarValor = (val: string | number) =>
        parseFloat(val.toString().replace(",", ".")).toFixed(2).replace(".", ",");

      // Campos obrigatórios
      const registro = "0210";
      const dataOperacao = item.data || "";
      const operacaoCodigo = "II";
      const taxas = item.taxas ? formatarValor(item.taxas) : "";

      const simboloRecebido = item.recebidoSimbolo || "";
      const quantidadeRecebida = formatarQuantidade(item.recebidoQuantidade);

      const simboloEntregue = item.entregueSimbolo || "";
      const quantidadeEntregue = formatarQuantidade(item.entregueQuantidade);

      const exchange = item.exchange.split(" ")[0];
      const exchangeURL = item.exchange.split(" ")[1];
      const siglaPaisOrigemExchange = item.exchange?.split(" ")[2];

      return `${registro}|${dataOperacao}|${operacaoCodigo}|${taxas}|${simboloRecebido}|${quantidadeRecebida}|${simboloEntregue}|${quantidadeEntregue}|${exchange}|${exchangeURL}|${siglaPaisOrigemExchange}`;
    })
    .join("\r\n");

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Permuta_IN1888_${monthName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleTransferenciaIN1888 = (transferencias: any[]) => {
  const textContent = transferencias
    .map((item) => {
      // Quantidade formatada com vírgula e 10 casas decimais
      const formatarQuantidade = (qtd: string | number) =>
        parseFloat(qtd.toString().replace(",", ".")).toFixed(10).replace(".", ",");

      // Formatação da taxa
      const taxa = item.taxas
        ? parseFloat(item.taxas.toString().replace(",", ".")).toFixed(2).replace(".", ",")
        : "";

      // Campos do registro 0410
      const registro = "0410";
      const dataOperacao = item.data || "";
      const operacaoCodigo = "IV";
      const simbolo = item.criptoativo || "";
      const quantidade = formatarQuantidade(item.quantidade);
      const origemWallet = item.origemWallet || "";
      const exchange = item.exchange.split(" ")[0];

      return `${registro}|${dataOperacao}|${operacaoCodigo}|${taxa}|${simbolo}|${quantidade}|${origemWallet}|${exchange}`;
    })
    .join("\r\n");

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Transferencia_IN1888_${monthName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleRetiradaIN1888 = (retiradas: any[]) => {
  const textContent = retiradas
    .map((item) => {
      // Quantidade formatada com vírgula e 10 casas decimais
      const formatarQuantidade = (qtd: string | number) =>
        parseFloat(qtd.toString().replace(",", ".")).toFixed(10).replace(".", ",");

      // Taxa formatada em Real
      const taxa = item.taxas
        ? parseFloat(item.taxas.toString().replace(",", ".")).toFixed(2).replace(".", ",")
        : "";

      // Campos conforme layout do Registro 0510
      const registro = "0510";
      const dataOperacao = item.data || "";
      const operacaoCodigo = "V";
      const simbolo = item.criptoativo || "";
      const quantidade = formatarQuantidade(item.quantidade);
      const exchange = item.exchange.split(" ")[0];
      const exchangeURL = item.exchange.split(" ")[1];
      const siglaPaisOrigemExchange = item.exchange?.split(" ")[2];

      return `${registro}|${dataOperacao}|${operacaoCodigo}|${taxa}|${simbolo}|${quantidade}|${exchange}|${exchangeURL}|${siglaPaisOrigemExchange}`;
    })
    .join("\r\n");

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Retirada_IN1888_${monthName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
