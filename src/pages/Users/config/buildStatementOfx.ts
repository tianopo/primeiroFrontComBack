import {
  pad2,
  sortByDateAsc,
  toOfxDate,
  getBankId,
  getAccountId,
  sanitizeOfx,
  getFitId,
  getCounterpartyName,
  getBankName,
} from "../utils/statementExport.helpers";
import { StatementExportItem } from "../utils/statementExport.types";

export const buildStatementOfx = (items: StatementExportItem[]) => {
  const now = new Date();

  const dtServer =
    `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}` +
    `${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;

  const sorted = sortByDateAsc(items).filter((item) => toOfxDate(item.timestamp));

  const firstItem = sorted[0];

  const bankId = getBankId(firstItem);
  const acctId = getAccountId(firstItem);
  const acctType = "CHECKING";

  const dtStart = toOfxDate(sorted[0]?.timestamp) || dtServer;
  const dtEnd = toOfxDate(sorted[sorted.length - 1]?.timestamp) || dtServer;

  const trns = sorted
    .map((item, index) => {
      const amount = Number(item.amount ?? 0);
      const trnType = amount < 0 ? "DEBIT" : "CREDIT";
      const dtPosted = toOfxDate(item.timestamp);
      const fitId = sanitizeOfx(getFitId(item, index));
      const operation = sanitizeOfx(item.operation ?? item.transactionType ?? "TX").slice(0, 32);

      const name = sanitizeOfx(operation || "TX").slice(0, 32);

      const memo = sanitizeOfx(
        [
          getCounterpartyName(item),
          getBankName(item),
          item.endToEndId ? `E2E: ${item.endToEndId}` : "",
          item.orderId ? `OrderId: ${item.orderId}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
      );

      return [
        "<STMTTRN>",
        `<TRNTYPE>${trnType}`,
        `<DTPOSTED>${dtPosted}`,
        `<TRNAMT>${amount.toFixed(2)}`,
        `<FITID>${fitId}`,
        `<NAME>${name || "TX"}`,
        `<MEMO>${memo}`,
        "</STMTTRN>",
      ].join("\n");
    })
    .join("\n");

  return [
    "OFXHEADER:100",
    "DATA:OFXSGML",
    "VERSION:102",
    "SECURITY:NONE",
    "ENCODING:UTF-8",
    "CHARSET:1252",
    "COMPRESSION:NONE",
    "OLDFILEUID:NONE",
    "NEWFILEUID:NONE",
    "",
    "<OFX>",
    "<SIGNONMSGSRSV1>",
    "<SONRS>",
    "<STATUS><CODE>0<SEVERITY>INFO</STATUS>",
    `<DTSERVER>${dtServer}`,
    "<LANGUAGE>POR",
    "</SONRS>",
    "</SIGNONMSGSRSV1>",
    "<BANKMSGSRSV1>",
    "<STMTTRNRS>",
    "<TRNUID>1",
    "<STATUS><CODE>0<SEVERITY>INFO</STATUS>",
    "<STMTRS>",
    "<CURDEF>BRL",
    "<BANKACCTFROM>",
    `<BANKID>${bankId}`,
    `<ACCTID>${acctId}`,
    `<ACCTTYPE>${acctType}`,
    "</BANKACCTFROM>",
    "<BANKTRANLIST>",
    `<DTSTART>${dtStart}`,
    `<DTEND>${dtEnd}`,
    trns,
    "</BANKTRANLIST>",
    "</STMTRS>",
    "</STMTTRNRS>",
    "</BANKMSGSRSV1>",
    "</OFX>",
    "",
  ].join("\n");
};
