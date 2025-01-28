import { IProtection } from "../../hooks/useProtection";
import { generateDocAsPdf } from "../generateDocAsPdf";

export const protection = (
  {
    tipoTransferencia,
    comprador,
    instituicao,
    dataHora,
    quantidade,
    valor,
    ativo,
    exchange,
    uid,
    wallet,
    endereco,
  }: IProtection,
  files: File[],
) => {
  let docContent = `
    <p>Carta Resposta à instituição da(o) ${instituicao}</p>
    <p>Pelo presente instrumento particular, e na melhor forma de direito, as partes a seguir qualificadas:</p>
  `;

  const addContent = (text: string, fontSize: number) => {
    docContent += `<p style="font-size:${fontSize}pt;">${text}</p>`;
  };
  const DH = (a: number, b: number, c: string) => dataHora.split(" ")[a].split(c)[b];
  const parties = [
    `Em atendimento ao questionamento da transação no valor de ${valor}, venho através desta informar que, como é de conhecimento dessa Instituição, a Cryptotech Desenvolvimento e Trading LTDA compra e vende ativos em diversas plataformas que são habilitadas para tal comercialização.`,
    `Especificadamente essa operação foi realizada da Cryptotech Desenvolvimento e Trading LTDA para a ${tipoTransferencia === "exchange" ? `plataforma ${exchange}` : `carteira ${wallet}`} do comprador ${comprador} conforme evidências abaixo.`,
    `O Sr. / A Sra. ${comprador} comprou ${valor} em ativos ${ativo} que reflete na quantidade de ${quantidade} ${ativo}`,
    `Essa quantidade de ativo ${ativo} foi transferido na data de ${DH(0, 2, "-") + "/" + DH(0, 1, "-") + "/" + DH(0, 0, "-")} com uma ordem criada na hora de ${DH(1, 0, ":") + ":" + DH(1, 1, ":")} para a ${tipoTransferencia === "exchange" ? `plataforma da(o) ${exchange} no UID ${uid}` : `carteira(o) ${wallet} no endereço ${endereco}`} sob a titularidade do Sr./ da Sra. ${comprador}.`,
    `Esclareço ainda que a CryptoTech por políticas internas não realiza transação com terceiros e aplica em todas suas operações dentro da política de KYC e PLD.`,
  ];
  parties.forEach((paragraph) => {
    addContent(paragraph, 12);
  });

  // Processar os arquivos enviados
  const processFiles = async () => {
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            docContent += `<img src="${e.target?.result}" alt="Uploaded Image" style="max-width:100%; margin: 10px 0;" />`;
            resolve();
          };
          reader.readAsDataURL(file);
        });
      } else if (file.type === "application/pdf") {
        docContent += `<p>PDF Anexado: ${file.name}</p>`;
      }
    }

    // Gerar o PDF apenas após processar todos os arquivos
    generateDocAsPdf(docContent);
  };

  processFiles();
};
