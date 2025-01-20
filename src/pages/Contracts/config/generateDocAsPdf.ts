import { toast } from "react-toastify";

export const generateDocAsPdf = (docContent: string) => {
  // Cria uma nova janela ou aba
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    // Adiciona o conteúdo ao documento da nova janela
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <meta charset="utf-8">
          <title>CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              text-align: center;
            }
            p {
              margin: 10px 0;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          ${docContent}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Aguarda o carregamento do conteúdo antes de imprimir
    printWindow.onload = () => {
      printWindow.print(); // Inicia a impressão
      printWindow.close(); // Fecha a janela após imprimir
    };
  } else {
    toast.error("Não foi possível abrir a janela de impressão.");
  }
};
