import { generateDocAsPdf } from "src/pages/Contracts/config/generateDocAsPdf";
import { formatBRL } from "src/utils/formats";
import {
  sortByDateDesc,
  escapeHtml,
  getCounterpartyName,
  getCounterpartyDocument,
  getBankName,
} from "../utils/statementExport.helpers";
import { StatementExportItem, StatementExportResume } from "../utils/statementExport.types";

const CRYPTOTECH = {
  name: "CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA",
  cnpj: "55.636.113/0001-70",
};

const formatPdfDateTime = (value?: string) => {
  if (!value) {
    return {
      date: "",
      time: "",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: value,
      time: "",
    };
  }

  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
};

export const generateStatementPdf = ({
  items,
  resume,
}: {
  items: StatementExportItem[];
  resume: StatementExportResume;
}) => {
  const sorted = sortByDateDesc(items);

  const rows = sorted
    .map((item) => {
      const amount = Number(item.amount ?? 0);
      const amountClass = amount < 0 ? "negative" : "positive";
      const dateTime = formatPdfDateTime(item.timestamp);

      return `
        <tr>
          <td class="date-cell">
            <div class="date-main">${escapeHtml(dateTime.date)}</div>
            <div class="date-time">${escapeHtml(dateTime.time)}</div>
          </td>
          <td class="amount-cell ${amountClass}">
            ${escapeHtml(formatBRL(amount))}
          </td>
          <td>${escapeHtml(getCounterpartyName(item))}</td>
          <td>${escapeHtml(getCounterpartyDocument(item))}</td>
          <td>${escapeHtml(getBankName(item))}</td>
          <td>${escapeHtml(item.endToEndId ?? "")}</td>
        </tr>
      `;
    })
    .join("");

  const docContent = `
    <style>
      .statement-report {
        font-family: Arial, Helvetica, sans-serif;
        color: #111;
      }

      .statement-report h1 {
        font-size: 18px;
        margin: 0 0 8px;
        text-align: center;
      }

      .statement-report .subtitle {
        text-align: center;
        font-size: 12px;
        color: #555;
        margin-bottom: 18px;
      }

      .statement-report .summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 18px;
        margin-bottom: 16px;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 12px;
      }

      .statement-report .field {
        font-size: 12px;
      }

      .statement-report .label {
        font-weight: bold;
      }

      .statement-report table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-top: 10px;
      }

      .statement-report th,
      .statement-report td {
        border: 1px solid #d8d8d8;
        padding: 5px;
        text-align: left;
        vertical-align: top;
        font-size: 9.5px;
        word-break: break-word;
      }

      .statement-report th {
        background: #f4f4f4;
      }

      .statement-report .date-col {
        width: 74px;
      }

      .statement-report .amount-col {
        width: 82px;
      }

      .statement-report .doc-col {
        width: 86px;
      }

      .statement-report .bank-col {
        width: 92px;
      }

      .statement-report .date-cell {
        white-space: nowrap;
      }

      .statement-report .date-main {
        font-weight: bold;
        line-height: 1.2;
      }

      .statement-report .date-time {
        color: #555;
        font-size: 9px;
        line-height: 1.2;
        margin-top: 2px;
      }

      .statement-report .amount-cell {
        white-space: nowrap;
        font-size: 9.5px;
        font-weight: bold;
      }

      .statement-report .positive {
        color: #047857;
      }

      .statement-report .negative {
        color: #b91c1c;
      }
    </style>

    <div class="statement-report">
      <h1>EXTRATO GOWD</h1>
      <p class="subtitle">${CRYPTOTECH.name} • CNPJ ${CRYPTOTECH.cnpj}</p>

      <div class="summary">
        <div class="field"><span class="label">Data inicial:</span> ${escapeHtml(resume.startDate)}</div>
        <div class="field"><span class="label">Data final:</span> ${escapeHtml(resume.endDate)}</div>
        <div class="field"><span class="label">Total de transações:</span> ${items.length}</div>
        <div class="field"><span class="label">Saldo:</span> ${escapeHtml(formatBRL(Number(resume.balance ?? 0)))}</div>
        <div class="field"><span class="label">Entradas:</span> ${escapeHtml(formatBRL(Number(resume.entradas ?? 0)))}</div>
        <div class="field"><span class="label">Saídas:</span> ${escapeHtml(formatBRL(Number(resume.saidas ?? 0)))}</div>
        <div class="field"><span class="label">Taxas:</span> ${escapeHtml(formatBRL(Number(resume.taxas ?? 0)))}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="date-col">Data</th>
            <th class="amount-col">Valor</th>
            <th>Nome</th>
            <th class="doc-col">Documento</th>
            <th class="bank-col">Banco</th>
            <th>EndToEndId</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="6">Nenhuma transação encontrada.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  generateDocAsPdf(docContent);
};
