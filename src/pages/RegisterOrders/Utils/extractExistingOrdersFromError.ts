export function extractExistingOrdersFromError(message: string): Set<string> {
  const set = new Set<string>();

  // pega só a seção das ordens já existentes (pra não confundir com "Ordem:" do outro erro)
  const section = message.split("Ordens já existentes:")[1] ?? "";
  if (!section) return set;

  // Ordem: XXX | Exchange: YYY | ...
  const regex = /Ordem:\s*([^|]+?)\s*\|\s*Exchange:\s*([^|]+?)(?:\||\n|$)/g;

  let m: RegExpExecArray | null;
  while ((m = regex.exec(section))) {
    const numeroOrdem = String(m[1] ?? "").trim();
    const exchange = String(m[2] ?? "").trim();
    if (numeroOrdem && exchange) set.add(`${numeroOrdem}|||${exchange}`);
  }
  return set;
}

export const makeOrderKey = (numeroOrdem: string, exchange: string) =>
  `${String(numeroOrdem ?? "").trim()}|||${String(exchange ?? "").trim()}`;
