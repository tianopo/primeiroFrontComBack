import { generatePdf } from "../generatePdf";

export const services = () => {
  let pdfContent = `%PDF-1.4
  1 0 obj
  <<
  /Type /Catalog
  /Pages 2 0 R
  >>
  endobj
  2 0 obj
  <<
  /Type /Pages
  /Count 0
  /Kids []
  >>
  endobj
  3 0 obj
  <<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
  /Encoding /WinAnsiEncoding
  >>
  endobj
  `;

  let pageContent = "";
  let currentPageIndex = 4;
  let totalPages = 0;
  const pageHeight = 792;
  const leftMargin = 50;
  const lineHeight = 20;
  const maxLineWidth = 80;
  const startYPosition = 750;
  let yPosition = startYPosition;
  const minYPosition = 50;
  const pageReferences: any[] = [];

  const addText = (text: string, fontSize: number, x: number, y: number) => {
    // Substituições para caracteres minúsculos
    const lowerCaseText = text
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u")
      .replace(/ç/g, "c")
      .replace(/ã/g, "a")
      .replace(/õ/g, "o")
      .replace(/ê/g, "e")
      .replace(/ô/g, "o")
      .replace(/â/g, "a")
      .replace(/û/g, "u")
      .replace(/à/g, "a")
      .replace(/°/g, "o")
      .replace(/º|ª/g, "o")
      .replace(/™/g, "(TM)")
      .replace(/©/g, "(C)")
      .replace(/®/g, "(R)");

    // Substituições para caracteres maiúsculos
    const encodedText = lowerCaseText
      .replace(/\\/g, "\\\\") // Escapa barra invertida
      .replace(/\(/g, "\\(") // Escapa parêntese aberto
      .replace(/\)/g, "\\)") // Escapa parêntese fechado
      .replace(/–/g, "-") // Substitui hífen longo
      .replace(/—/g, "-") // Substitui traço longo
      .replace(/“|”/g, '"') // Substitui aspas duplas
      .replace(/‘|’/g, "'") // Substitui aspas simples
      .replace(/Á/g, "A")
      .replace(/É/g, "E")
      .replace(/Í/g, "I")
      .replace(/Ó/g, "O")
      .replace(/Ú/g, "U")
      .replace(/Ç/g, "C")
      .replace(/Ã/g, "A")
      .replace(/Õ/g, "O")
      .replace(/Ê/g, "E")
      .replace(/Ô/g, "O")
      .replace(/Â/g, "A")
      .replace(/Û/g, "U")
      .replace(/À/g, "A");

    // Outras substituições gerais
    return `BT\n/F1 ${fontSize} Tf\n1 0 0 1 ${x} ${y} Tm\n(${encodedText}) Tj\nET\n`;
  };

  const splitText = (text: string, maxChars: number) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word: any) => {
      if ((currentLine + word).length <= maxChars) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  const addPage = () => {
    if (pageContent) {
      totalPages++;
      pageReferences.push(`${currentPageIndex} 0 R`);

      pdfContent = pdfContent.replace(/\/Count \d+/, `/Count ${totalPages}`);

      pdfContent = pdfContent.replace(/\/Kids \[.*?\]/, `/Kids [${pageReferences.join(" ")}]`);

      pdfContent += `${currentPageIndex} 0 obj
  <<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents ${currentPageIndex + 1} 0 R
  /Resources << /Font << /F1 3 0 R >> >>
  >>
  endobj
  `;

      pdfContent += `${currentPageIndex + 1} 0 obj
  << /Length ${pageContent.length} >>
  stream
  ${pageContent}endstream
  endobj
  `;

      currentPageIndex += 2;
      pageContent = "";
      yPosition = startYPosition;
    }
  };

  const addContent = (text: string, fontSize: number) => {
    splitText(text, maxLineWidth).forEach((line) => {
      if (yPosition - lineHeight < minYPosition) {
        addPage();
      }
      pageContent += addText(line, fontSize, leftMargin, yPosition);
      yPosition -= lineHeight;
    });
  };

  // Add Title
  addContent("CONTRATO DE COMPRA E VENDA", 18);
  yPosition -= lineHeight;

  // Add Introduction
  addContent(
    "Pelo presente instrumento particular, e na melhor forma de direito, as partes a seguir qualificadas:",
    12,
  );
  yPosition -= lineHeight;

  // Add Parties
  const parties = [
    `XXXXXXXXXXXXXXXXXXX, brasileiro, casada, contadora, portadora da carteira de Identidade – RG nº XXXXXXXXX SSP/SP, inscrita no CPF/MF sob nº XXXXXXXXXXXXX, residente e domiciliada na Rua XXXXXXXXXXX, Cidade de São Paulo, Estado de São Paulo, neste ato denominada simplesmente COMPRADORA; e de outro lado,`,
    `XXXXXXXXXXXXXXXXXXX, brasileira, casada, engenheira, portadora da carteira de Identidade – RG nº XXXXXXXXX SSP/SP, inscrita no CPF/MF sob nº XXXXXXXXXXXXX, residente e domiciliada na Rua XXXXXXXXXXXXXXXXXX, Cidade de São Paulo, Estado de São Paulo, na XXXXXXXXXXXXXXX, com conta corrente para pagamento em razão do presente contrato mantida perante o Banco xxxxx, Agência xxxxx, c/c xxxxxxxxxx, doravante denominada simplesmente VENDEDORA, e,`,
    `tem entre si, justo e contratado, o presente CONTRATO DE COMPRA DE ATIVOS, que serão realizados mediante as seguintes cláusulas e condições:`,
  ];
  parties.forEach((paragraph) => {
    addContent(paragraph, 12);
    yPosition -= lineHeight;
  });

  // Add Clauses
  // Add Clause Titles and Content
  const clauses = [
    {
      title: "1. DO OBJETO DO CONTRATO",
      content: [
        `1.1 O objeto do presente contrato é a compra e venda de ativos nas condições do presente contrato.`,
        "1.2 O Vendedor compromete-se a vender e o Comprador compromete-se a comprar a quantia de XX [quantidade de ativos] (em números: [ex: quantidade de Bitcoin em números]), por meio da transferência de ativos Bitcoin (BTC), conforme acordado entre as partes.",
      ],
    },
    {
      title: "2. DA RESPONSABILIDADE DAS PARTES",
      content: [
        "2.1 VENDEDOR",
        "2.1.1 O Vendedor é responsável por garantir que a quantidade de ativos - BTC (escrever qual ativo é) seja transferida para a carteira do Comprador conforme o acordado.",
        "2.1.2 O Vendedor garante que o ativo - BTC (escrever qual ativo é) transferido é legítimo, sem qualquer vínculo com fraudes ou ações ilícitas, e que não está sujeito a qualquer penhora, restrição ou ônus.",
        "2.1.3 O Vendedor não será responsável por qualquer perda, dano ou prejuízo resultante de falhas na transação, incluindo erros de rede ou problemas com carteiras de criptomoedas.",
        "2.2 COMPRADOR",
        "2.2.1 O Comprador é responsável por fornecer corretamente o endereço de sua carteira digital para o recebimento dos ativos adquiridos, bem como garantir que o pagamento seja realizado conforme os termos acordados neste contrato.",
        "2.2.2 O Comprador assume a responsabilidade total pelo gerenciamento de sua carteira de ativos, incluindo a segurança de suas chaves privadas, isentando o Vendedor de qualquer responsabilidade sobre perdas ou danos decorrentes do mau gerenciamento dessas informações.",
      ],
    },
    {
      title: "3. DA EXCLUSÃO DE RESPONSABILIDADE",
      content: [
        "3.1 O Vendedor não será responsável por qualquer falha ou erro decorrente de causas fora de seu controle, incluindo problemas com a rede blockchain, falhas de sistema ou qualquer outro evento imprevisto que possa afetar a execução deste contrato",
      ],
    },
    {
      title: "4. DO APORTE DE RECURSOS - VALOR E FORMA DE PAGAMENTO",
      content: [
        "4.1 O valor total da transação é de [valor acordado, ex: R$ 10.000,00], correspondente à compra de ativos [quantidade de Bitcoin ou outro ativo especificado].",
        `4.2 O pagamento será efetuado pelo Comprador ao Vendedor da seguinte forma:
[Forma de pagamento acordada: transferência bancária, PIX, dinheiro, etc.], conforme combinado entre as partes.`,
        "4.3 O pagamento deverá ser realizado até [data limite para pagamento], sendo considerado automaticamente rescindido o contrato em caso de não cumprimento deste prazo.",
        "4.4 O Vendedor se reserva o direito de verificar a autenticidade e regularidade da transferência antes de concluir a operação de envio dos ativos.",
      ],
    },
    {
      title: "5. DA TRANSFERÊNCIA DE ATIVOS",
      content: [
        "5.1 O Vendedor se compromete a transferir para a carteira digital do Comprador, identificada pelo endereço [endereço da carteira do comprador], a quantidade de [quantidade de Bitcoin] BTC (caso seja Bitcoin) no prazo máximo de [prazo acordado, ex: 24 horas] após a confirmação do pagamento pelo Comprador.",
        "5.2 A transferência será realizada via [indicar a plataforma de transferência, ex: qual plataforma, carteira pessoal do Vendedor, exchange, etc.].",
        "5.3 O Vendedor declara que o ativo que está vendendo é de sua legítima propriedade, não estando sujeito a qualquer ônus ou restrição.",
      ],
    },
    {
      title: "6. DOS RISCOS ASSUMIDOS",
      content: [
        "6.1 As partes reconhecem que o mercado de criptomoedas é altamente volátil e os valores podem variar significativamente em curtos períodos de tempo. O Comprador entende e assume os riscos relacionados à flutuação no valor do ativo.",
        "6.2 As partes reconhecem que não há devolução e/ou reembolso de ativo após a transferência ser concluída.",
        "6.3 Após a transferência, o comprador assume todos os riscos e responsabilidades relacionados aos ativos adquiridos.",
      ],
    },
    {
      title: "7. DA INADIMPLÊNCIA",
      content: [
        "7.1 Caso o pagamento não seja confirmado dentro do prazo estipulado na Cláusula 4.3, o contrato será automaticamente rescindido, sem necessidade de notificação, e o Vendedor não terá mais obrigação de transferir o ativo objeto da negociação.",
      ],
    },
    {
      title: "8. DISPOSIÇÕES GERAIS",
      content: [
        "8.1 Este contrato é celebrado de boa-fé, sendo que ambas as partes declaram ter lido e compreendido seus termos.",
        "8.2 Este contrato é vinculativo e obriga as partes, seus sucessores e cessionários.",
        "8.3 Este contrato representa o acordo integral entre as partes, substituindo quaisquer entendimentos ou negociações anteriores, verbais ou escritos.",
        "8.4 Qualquer alteração ou aditamento a este contrato deverá ser realizada por escrito e assinada por ambas as partes.",
        "8.5 As partes reconhecem que todas as transações de ativos/criptomoedas são registradas em blockchain, e as informações ali contidas são definitivas para a verificação do cumprimento das obrigações estabelecidas neste contrato.",
        "8.6 Este contrato entra em vigor a partir da assinatura digital de ambas as partes. A assinatura pode ocorrer por meios digitais, conforme o disposto em lei.",
        "8.7 Este contrato será regido pelas disposições da legislação brasileira, em especial pelas normas do Código Civil, e, no que for pertinente, pela Lei nº 14.063/2020, que trata de assinaturas eletrônicas.",
        "8.8 Em caso de litígios oriundos deste contrato, as partes elegem o foro da Comarca de Jacareí – São Paulo, renunciando a qualquer outro, por mais privilegiado que seja.",
      ],
    },
  ];

  clauses.forEach((clause) => {
    yPosition -= lineHeight;
    addContent(clause.title, 14);
    clause.content.forEach((paragraph) => {
      addContent(paragraph, 12);
    });
  });

  addPage();

  pdfContent += `trailer
  <<
  /Root 1 0 R
  >>
  %%EOF`;

  generatePdf(pdfContent, `Contrato_Compra_Venda.pdf`);
};
