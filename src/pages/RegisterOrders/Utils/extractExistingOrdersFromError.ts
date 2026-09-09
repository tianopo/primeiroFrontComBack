export const makeOrderKey = (numeroOrdem: string, exchange: string) =>
  `${String(numeroOrdem ?? "").trim()}|||${String(exchange ?? "").trim()}`;

export function extractExistingOrdersFromError(message: string): Set<string> {
  const set = new Set<string>();

  const text = String(message ?? "");

  const section =
    text.split(/Ordens já existentes:/i)[1]?.split(/Apelidos?\s+não\s+encontrados?:/i)[0] ?? text;

  const regex = /Ordem:\s*([^|\n\r]+?)\s*\|\s*Exchange:\s*([^|\n\r]+)/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(section))) {
    const numeroOrdem = String(match[1] ?? "").trim();
    const exchange = String(match[2] ?? "").trim();

    if (numeroOrdem && exchange) {
      set.add(makeOrderKey(numeroOrdem, exchange));
    }
  }

  return set;
}
