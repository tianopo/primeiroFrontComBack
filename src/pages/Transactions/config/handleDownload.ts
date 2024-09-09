export const handleDownload = (formData: any[]) => {
  const datesSet = new Set<string>();

  const textContent = formData
    .map((item) => {
      const operationCode = item.tipoTransacao === "compras" ? "0110" : "0120";
      const dataSeparada = item.dataHoraTransacao?.split(" ")[0].split("-");
      const dataHoraTransacao = `${dataSeparada[2]}${dataSeparada[1]}${dataSeparada[0]}`;
      const tipoTransaction = (item: string) => item?.replace("R$", "").replace(/\./g, "");
      const valorOperacao = `${item.tipoTransacao === "compras" ? tipoTransaction(item.valorCompra) : tipoTransaction(item.valorVenda)}`;
      const simboloAtivoDigital = item.ativoDigital || "";
      const quantidadeRaw =
        item.tipoTransacao === "compras" ? item.quantidadeComprada : item.quantidadeVendida;
      const quantidade = parseFloat(quantidadeRaw.replace(",", ""))
        .toFixed(10)
        .toString()
        .replace(".", ",");
      const exchange = item.exchangeUtilizada.split(" ")[0];
      const exchangeURL = item.exchangeUtilizada.split(" ")[1];
      const siglaPaisOrigemExchange = item.exchangeUtilizada?.split(" ")[2];

      datesSet.add(dataHoraTransacao);

      return {
        line: `${operationCode}|${dataHoraTransacao}|I|${valorOperacao.trim()}|0,00|${simboloAtivoDigital}|${quantidade}|${exchange}|${exchangeURL}|${siglaPaisOrigemExchange}`,
        operationCode: parseInt(operationCode, 10),
      };
    })
    .sort((a, b) => a.operationCode - b.operationCode)
    .map((item) => item.line)
    .join("\r\n");

  const datesString = Array.from(datesSet).join("-");

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Relatorio_IN188_${datesString}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
