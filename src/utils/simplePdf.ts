type FontKey = "F1" | "F2";

export type StyledLine = {
  text: string;
  font?: FontKey; // F1 = Helvetica, F2 = Helvetica-Oblique
  size?: number; // pontos
};

const A4 = { w: 595.28, h: 841.89 }; // points
const MARGIN = 36;

const sanitizeLatin = (s: string) =>
  (s ?? "")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("’", "'")
    .replaceAll("…", "...")
    .replaceAll("\t", " ")
    .replace(/\s+\n/g, "\n");

const escapePdfString = (s: string) =>
  sanitizeLatin(s).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");

const toLatin1Bytes = (s: string) => {
  const str = sanitizeLatin(s);
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    out[i] = code <= 255 ? code : 63; // '?'
  }
  return out;
};
const concat = (parts: Uint8Array[]) => {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
};
const num10 = (n: number) => String(n).padStart(10, "0");

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function calcMaxChars(fontSize: number) {
  const usable = A4.w - 2 * MARGIN;
  const avgChar = fontSize * 0.52; // aproximação ok p/ Helvetica
  return Math.max(40, Math.floor(usable / avgChar));
}

export function wrapParagraph(text: string, fontSize = 11): string[] {
  const maxChars = calcMaxChars(fontSize);
  const words = sanitizeLatin(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";

  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function createPdfFromLines(lines: StyledLine[]): Uint8Array {
  const pages: StyledLine[][] = [];
  let page: StyledLine[] = [];

  let y = A4.h - MARGIN;
  const minY = MARGIN;

  const pushPage = () => {
    pages.push(page);
    page = [];
    y = A4.h - MARGIN;
  };

  for (const ln of lines) {
    if (ln.text === "__PAGE_BREAK__") {
      pushPage();
      continue;
    }
    const size = ln.size ?? 11;
    const leading = Math.round(size * 1.35);
    if (y - leading < minY) pushPage();
    page.push({ ...ln });
    y -= leading;
  }
  if (page.length) pages.push(page);

  const catalogId = 1;
  const pagesId = 2;
  const font1Id = 3; // Helvetica
  const font2Id = 4; // Helvetica-Oblique
  const baseId = 5;
  const contentIds = pages.map((_, i) => baseId + i * 2);
  const pageIds = pages.map((_, i) => baseId + i * 2 + 1);
  const maxId = pageIds[pageIds.length - 1];
  const offsets: number[] = new Array(maxId + 1).fill(0);
  const chunks: Uint8Array[] = [];
  let length = 0;

  const add = (b: Uint8Array) => {
    chunks.push(b);
    length += b.length;
  };
  const addStr = (s: string) => add(toLatin1Bytes(s));
  const addObj = (id: number, body: string | Uint8Array) => {
    offsets[id] = length;
    addStr(`${id} 0 obj\n`);
    if (typeof body === "string") addStr(body);
    else add(body);
    addStr(`\nendobj\n`);
  };
  add(concat([toLatin1Bytes("%PDF-1.4\n"), new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a])])); // "%âãÏÓ\n"
  addObj(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  addObj(
    pagesId,
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
  );
  addObj(
    font1Id,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
  );
  addObj(
    font2Id,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,
  );

  for (let i = 0; i < pages.length; i++) {
    const pageLines = pages[i];
    const streamParts: string[] = [];
    streamParts.push("BT");
    streamParts.push(`/${"F1"} 11 Tf`);
    streamParts.push(`${MARGIN} ${A4.h - MARGIN} Td`);

    let curFont: FontKey = "F1";
    let curSize = 11;

    for (const ln of pageLines) {
      const font = ln.font ?? "F1";
      const size = ln.size ?? 11;
      const leading = Math.round(size * 1.35);

      if (font !== curFont || size !== curSize) {
        streamParts.push(`/${font} ${size} Tf`);
        curFont = font;
        curSize = size;
      }

      streamParts.push(`(${escapePdfString(ln.text)}) Tj`);
      streamParts.push(`0 -${leading} Td`);
    }
    streamParts.push("ET");
    const streamStr = streamParts.join("\n") + "\n";
    const streamBytes = toLatin1Bytes(streamStr);
    const contentId = contentIds[i];
    const pageId = pageIds[i];
    const contentObj = `<< /Length ${streamBytes.length} >>\nstream\n` + streamStr + `endstream`;
    addObj(contentId, contentObj);
    addObj(
      pageId,
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] ` +
        `/Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> >> ` +
        `/Contents ${contentId} 0 R >>`,
    );
  }
  const xrefStart = length;
  addStr(`xref\n0 ${maxId + 1}\n`);
  addStr(`0000000000 65535 f \n`);
  for (let i = 1; i <= maxId; i++) {
    addStr(`${num10(offsets[i])} 00000 n \n`);
  }
  addStr(`trailer\n<< /Size ${maxId + 1} /Root ${catalogId} 0 R >>\n`);
  addStr(`startxref\n${xrefStart}\n%%EOF\n`);
  return concat(chunks);
}
