const today = new Date();
const monthName = today.toLocaleDateString("pt-BR", { month: "long" });

export const handleCompraVendaIN1888 = (formData: any[]) => {
  const datesArray: string[] = [];

  const textContent = formData
    .map((item) => {
      const operationCode = item.tipo === "compra" ? "0110" : "0120";
      const dataSeparada = item.dataTransacao?.split(" ")[0].split("-");
      const dataHoraTransacao = `${dataSeparada[2]}${dataSeparada[1]}${dataSeparada[0]}`;
      const tipoTransaction = (item: string) => item?.replace("R$", "").replace(/\./g, "");
      const valorOperacao = `${item.tipo === "compra" ? tipoTransaction(item.valor) : tipoTransaction(item.valor)}`;
      const simboloAtivoDigital = item.ativoDigital || "";
      const quantidadeRaw = item.tipo === "compra" ? item.quantidade : item.quantidade;
      const quantidade = parseFloat(quantidadeRaw.replace(",", "."))
        .toFixed(10)
        .toString()
        .replace(".", ",");
      const exchange = item.exchange.split(" ")[0];
      const exchangeURL = item.exchange.split(" ")[1];
      const siglaPaisOrigemExchange = item.exchange?.split(" ")[2];

      datesArray.push(dataHoraTransacao);

      return {
        line: `${operationCode}|${dataHoraTransacao}|I|${valorOperacao.trim()}|0,00|${simboloAtivoDigital}|${quantidade}|${exchange}|${exchangeURL}|${siglaPaisOrigemExchange}`,
        operationCode: parseInt(operationCode, 10),
      };
    })
    .sort((a, b) => a.operationCode - b.operationCode)
    .map((item) => item.line)
    .join("\r\n");

  const sortedDates = datesArray.sort();
  const dataInicial = sortedDates[0];
  const dataFinal = sortedDates[sortedDates.length - 1];

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Compra_Venda_IN188_${dataInicial}-${dataFinal}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
