export const handleDownload = (formData: any[]) => {
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
  link.download = `Relatorio_IN188_${dataInicial}-${dataFinal}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
