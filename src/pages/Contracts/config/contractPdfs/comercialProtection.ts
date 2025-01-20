import { IProtection } from "../../hooks/useProtection";
import { generateDocAsPdf } from "../generateDocAsPdf";

export const protection = ({ dataHora, quantidade, valor, ativo, exchange }: IProtection) => {
  let docContent = `
    <p>Carta Resposta à (nome da Instituição)</p>
    <p>Pelo presente instrumento particular, e na melhor forma de direito, as partes a seguir qualificadas:</p>
  `;

  const addContent = (text: string, fontSize: number) => {
    docContent += `<p style="font - size:${fontSize} pt;">${text}</p>`;
  };

  const parties = [
    `Em atendimento ao questionamento da transação no valor de ${valor}, venho através desta informar que, como é de conhecimento dessa Instituição, a Cryptotech Desenvolvimento e Trading LTDA compra e vende ativos em diversas plataformas que são habilitadas para tal comercialização.`,
    `Especificadamente essa operação foi realizada na plataforma ${exchange} entre a CryptoTech e o comprador XXXXX conforme evidências abaixo.`,
    `O Sr. / A Sra. XXXXXX comprou ${valor} em ativos ${ativo} que reflete na quantidade de ${quantidade} ${ativo}`,
    `Essa quantidade de ativo ${ativo} foi transferido na data de ${dataHora.split(" ")[0]} com uma ordem criada no dia e hora de ${dataHora.split(" ")[1]} para a carteira XXXXX sob a titularidade do Sr./ da Sra. XXXX.`,
    `Esclareço ainda que a CryptoTech por políticas internas não realiza transação com terceiros e aplica em todas suas operações sua política de KYC e PLD.`,
  ];
  parties.forEach((paragraph) => {
    addContent(paragraph, 12);
  });

  // Gera o conteúdo e inicia a impressão como PDF
  generateDocAsPdf(docContent);
};
