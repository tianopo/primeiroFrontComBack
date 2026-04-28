import { toast } from "react-toastify";

export const generateDocAsPdf = (docContent: string) => {
  const printWindow = window.open("", "_blank");

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <meta charset="utf-8">
          <title>CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA</title>
          <style>
            @page {
              size: A4;
              margin: 16mm;
            }

            body {
              font-family: Arial, sans-serif;
              margin: 0;
              color: #111;
              font-size: 12px;
              line-height: 1.5;
              background: #fff;
            }

            .report-container {
              width: 100%;
            }

            .report-page {
              page-break-after: always;
              break-after: page;
              min-height: 100vh;
              padding: 6px 0;
            }

            .report-page:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            h1, h2 {
              text-align: center;
              margin: 0 0 8px 0;
            }

            h3 {
              margin: 0 0 12px 0;
              font-size: 18px;
              border-bottom: 1px solid #d9d9d9;
              padding-bottom: 6px;
            }

            h4 {
              margin: 16px 0 8px 0;
              font-size: 15px;
            }

            p {
              margin: 6px 0;
              line-height: 1.5;
            }

            .muted {
              color: #666;
            }

            .section {
              margin-top: 18px;
              border: 1px solid #e2e2e2;
              border-radius: 8px;
              padding: 14px;
            }

            .subsection {
              margin-top: 12px;
              border: 1px solid #ededed;
              border-radius: 6px;
              padding: 10px;
            }

            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 18px;
            }

            .field {
              word-break: break-word;
            }

            .label {
              font-weight: bold;
            }

            .pill {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 999px;
              border: 1px solid #ccc;
              font-size: 11px;
              margin-right: 6px;
              margin-bottom: 6px;
            }

            .small {
              font-size: 11px;
            }

            ul {
              margin: 8px 0 0 18px;
              padding: 0;
            }

            li {
              margin-bottom: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }

            th, td {
              border: 1px solid #d8d8d8;
              padding: 8px;
              text-align: left;
              vertical-align: top;
              font-size: 11px;
              word-break: break-word;
            }

            th {
              background: #f4f4f4;
            }

            .evidence-image {
              max-width: 220px;
              max-height: 220px;
              object-fit: contain;
              border: 1px solid #ccc;
              border-radius: 6px;
              display: block;
              margin-top: 8px;
            }

            .page-title {
              margin-bottom: 18px;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            ${docContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } else {
    toast.error("Não foi possível abrir a janela de impressão.");
  }
};
