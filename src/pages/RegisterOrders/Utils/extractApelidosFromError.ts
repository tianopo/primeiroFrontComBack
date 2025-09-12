export function extractApelidosFromError(message: string): Set<string> {
  const set = new Set<string>();
  const regex = /Apelido:\s*([^|]+)/g; // captura até o próximo " | " ou fim
  let m: RegExpExecArray | null;
  while ((m = regex.exec(message))) {
    const nick = m[1].trim();
    if (nick) set.add(nick);
  }
  return set;
}
