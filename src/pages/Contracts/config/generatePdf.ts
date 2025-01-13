export const generatePdfReport = () => {
  // PDF content initialization
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
/Count 1
/Kids [3 0 R]
>>
endobj
`;

  let pageContent = ""; // Store content for the current page
  let currentPageIndex = 3; // Start from the first page object
  let totalPages = 1; // Track total number of pages
  const pageHeight = 792; // Standard page height in points
  const leftMargin = 50; // Left margin for content
  const lineHeight = 20; // Space between lines
  const maxLineWidth = 80; // Max characters per line
  const startYPosition = 750; // Starting Y position for content
  let yPosition = startYPosition; // Current Y position for content

  const addText = (text: string, fontSize: number, x: number, y: number) => {
    return `BT
/F1 ${fontSize} Tf
1 0 0 1 ${x} ${y} Tm
(${text}) Tj
ET
`;
  };

  const splitText = (text: string, maxChars: number) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
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
      pdfContent += `${currentPageIndex} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents ${currentPageIndex + 1} 0 R
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
      totalPages++;
      pageContent = "";
      yPosition = startYPosition;
    }
  };

  const addContent = (text: string, fontSize: number) => {
    splitText(text, maxLineWidth).forEach((line) => {
      if (yPosition - lineHeight < 50) {
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
  ];

  clauses.forEach((clause) => {
    addContent(clause.title, 14);
    clause.content.forEach((paragraph) => {
      addContent(paragraph, 12);
    });
  });

  // Add remaining content to the last page
  addPage();

  pdfContent += `trailer
<<
/Root 1 0 R
>>
%%EOF`;

  // Convert string to Blob and create download link
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Contrato_Compra_Venda.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
