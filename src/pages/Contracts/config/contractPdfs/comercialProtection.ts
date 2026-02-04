import { IProtection } from "../../hooks/useProtection";
import { generateDocAsPdf } from "../generateDocAsPdf";

const parseDataHoraSafe = (raw?: string) => {
  const s = (raw ?? "").trim();
  const [datePart = "", timePart = ""] = s.split(/\s+/);

  const [yyyy = "", mm = "", dd = ""] = datePart.split("-");
  const [HH = "", MM = ""] = timePart.split(":");

  const dateBR = yyyy && mm && dd ? `${dd}/${mm}/${yyyy}` : datePart || "-";
  const timeHM = HH && MM ? `${HH}:${MM}` : timePart || "-";

  return { dateBR, timeHM };
};

export const protection = (
  {
    tipoTransferencia,
    comprador,
    dataHora,
    quantidade,
    valor,
    ativo,
    exchange,
    uid,
    wallet,
    endereco,
    usuario,
  }: IProtection,
  files: File[],
) => {
  let docContent = `
    <p>Carta Resposta ao(os) MED(s)</p>
    <p>Pelo presente instrumento particular, e na melhor forma de direito, as partes a seguir qualificadas:</p>
  `;

  const addContent = (text: string, fontSize: number) => {
    docContent += `<p style="font-size:${fontSize}pt;">${text}</p>`;
  };

  const { dateBR, timeHM } = parseDataHoraSafe(dataHora);
  const parties = [
    `Em atendimento ao questionamento da transação no valor de ${valor}, venho através desta informar que, como é de conhecimento dessa Instituição, a Cryptotech Desenvolvimento e Trading LTDA compra e vende ativos em diversas plataformas que são habilitadas para tal comercialização.`,
    `Especificadamente essa operação foi realizada da Cryptotech Desenvolvimento e Trading LTDA para a ${["exchange", "usuario"].includes(tipoTransferencia) ? `plataforma ${exchange}` : `carteira ${wallet}`} do comprador ${comprador} conforme evidências abaixo.`,
    `O Sr. / A Sra. ${comprador} comprou ${valor} em ativos ${ativo} que reflete na quantidade de ${quantidade} ${ativo}`,
    `Essa quantidade de ativo ${ativo} foi transferido na data de ${dateBR} com uma ordem criada na hora de ${timeHM} para a(o) ${
      tipoTransferencia === "exchange"
        ? `plataforma da(o) ${exchange} no UID ${uid}`
        : tipoTransferencia === "wallet"
          ? `carteira(o) ${wallet} no endereço ${endereco}`
          : `usuário ${usuario}`
    } sob a titularidade do Sr./ da Sra. ${comprador}.`,
    `Esclareço ainda que a CryptoTech por políticas internas não realiza transação com terceiros e aplica em todas suas operações dentro da política de KYC e PLD própria.`,
  ];
  parties.forEach((paragraph) => {
    addContent(paragraph, 12);
  });

  // Processar os arquivos enviados
  const processFiles = async () => {
    for (const file of files) {
      const name = (file.name || "").toLowerCase();
      const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");

      // ✅ imagens: embute no HTML
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = (e) => {
            docContent += `<img src="${e.target?.result}" alt="${file.name}" style="max-width:100%; margin: 10px 0;" />`;
            resolve();
          };
          reader.onerror = () => reject(new Error(`Falha ao ler imagem: ${file.name}`));
          reader.readAsDataURL(file);
        });
        continue;
      }

      // ✅ PDFs: já entram listados no “Anexos”, então não precisa embutir aqui
      if (isPdf) continue;
    }

    generateDocAsPdf(docContent);
  };

  processFiles();
};
