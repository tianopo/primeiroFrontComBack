import { bytesToBase64, createPdfFromLines, StyledLine, wrapParagraph } from "src/utils/simplePdf";
import { parseDateParts } from "./helpers";

export interface IUsuario {
  apelido: string;
  name: string;
  document: string;
}
export interface IConfirmContract {
  usuario: IUsuario;
  ordem: string;
  data: string;
  exchange: string;
  quantidade: string;
  valor: string;
  ativo: string;
}

const clean = (v: string) => String(v ?? "-").trim();

const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function safeParseDateParts(input: string): { dia: string; mesExtenso: string; ano: string } {
  const raw = String(input ?? "").trim();

  // tenta helper atual primeiro
  try {
    const p = parseDateParts(raw);
    if (p?.dia && p?.mesExtenso && p?.ano && ![p.dia, p.mesExtenso, p.ano].includes("-")) return p;
  } catch {}

  // dd/mm/yyyy [HH:mm[:ss]]
  let m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);
  if (m) {
    const dia = String(Number(m[1]));
    const mesExtenso = monthNames[Number(m[2]) - 1] ?? "-";
    const ano = m[3];
    return { dia, mesExtenso, ano };
  }

  // yyyy-mm-dd[ HH:mm[:ss]] ou yyyy-mm-ddTHH:mm...
  m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?/);
  if (m) {
    const dia = String(Number(m[3]));
    const mesExtenso = monthNames[Number(m[2]) - 1] ?? "-";
    const ano = m[1];
    return { dia, mesExtenso, ano };
  }

  // última tentativa: Date.parse (se vier ISO com timezone etc.)
  const dt = new Date(raw);
  if (!Number.isNaN(dt.getTime())) {
    return {
      dia: String(dt.getDate()),
      mesExtenso: monthNames[dt.getMonth()] ?? "-",
      ano: String(dt.getFullYear()),
    };
  }

  return { dia: "-", mesExtenso: "-", ano: "-" };
}

export const confirmContract = async ({
  usuario,
  ordem,
  data,
  exchange,
  quantidade,
  valor,
  ativo,
}: IConfirmContract) => {
  const uName = clean(usuario?.name);
  const uDoc = clean(usuario?.document);
  const uNick = clean(usuario?.apelido);

  const o = clean(ordem);
  const d = clean(data);
  const ex = clean(exchange);
  const q = clean(quantidade);
  const v = clean(valor);
  const a = clean(ativo);

  const { dia, mesExtenso, ano } = safeParseDateParts(data);
  const dataExtenso = `${dia} de ${mesExtenso} de ${ano}`;

  const representanteCryptotech = {
    nome: "Matheus Henrique de Abreu",
    cpf: "338.624.448-30",
  };

  const lines: StyledLine[] = [];

  const spacer = (n = 1) => {
    for (let i = 0; i < n; i++) lines.push({ text: "" });
  };

  // Título
  lines.push({ text: "CONTRATO DE COMPRA E VENDA", size: 16, font: "F1" });
  spacer(1);

  // Intro
  for (const ln of wrapParagraph(
    "Pelo presente instrumento particular, e na melhor forma de direito, as partes a seguir qualificadas:",
    11,
  ))
    lines.push({ text: ln });
  spacer(1);

  const parties = [
    `${uName}, brasileira, inscrita no CPF/MF sob nº ${uDoc}, neste ato denominada simplesmente COMPRADORA; e de outro lado,`,
    `CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA, pessoa jurídica de direito privado com sede na Estrada do Limoeiro, 495 - Jardim California, Jacarei - SP, 12305-810, inscrita no CNPJ/MF sob nº 55.636.113/0001-70, neste ato representada por ${representanteCryptotech.nome}, CPF/MF sob nº ${representanteCryptotech.cpf}, doravante denominada simplesmente VENDEDORA; e,`,
    `tem entre si, justo e contratado, o presente CONTRATO DE COMPRA DE ATIVOS, que será realizado mediante as seguintes cláusulas e condições:`,
  ];

  for (const p of parties) {
    for (const ln of wrapParagraph(p, 11)) lines.push({ text: ln });
    spacer(1);
  }

  // Cláusulas
  const addH = (t: string) => {
    lines.push({ text: t, size: 13, font: "F1" });
    spacer(1);
  };
  const addP = (t: string) => {
    for (const ln of wrapParagraph(t, 11)) lines.push({ text: ln });
    spacer(1);
  };

  addH("1. DO OBJETO DO CONTRATO");
  addP(
    "1.1 O objeto do presente contrato é a compra e venda de ativos nas condições do presente contrato.",
  );
  addP(
    `1.2 O VENDEDOR compromete-se a vender e a COMPRADORA compromete-se a comprar a quantia de ${q} ${a}, por meio da transferência do ativo ${a} na ordem de número ${o}, em ${d}, no P2P da corretora ${ex}, conforme acordado entre as partes.`,
  );

  addH("2. DA RESPONSABILIDADE DAS PARTES");
  addP("2.1 VENDEDOR");
  addP(
    `2.1.1 O Vendedor é responsável por garantir que a quantidade de ativos (${a}) seja transferida para a carteira do Comprador conforme o acordado.`,
  );
  addP(
    `2.1.2 O Vendedor garante que o ativo (${a}) transferido é legítimo, sem qualquer vínculo com fraudes ou ações ilícitas, e que não está sujeito a qualquer penhora, restrição ou ônus.`,
  );
  addP("2.2 COMPRADOR");
  addP(
    "2.2.1 O Comprador compromete-se a realizar o pagamento nos prazos, valores e condições estabelecidos neste contrato.",
  );
  addP(
    "2.2.2 O Comprador assume responsabilidade pela segurança de sua conta/carteira e credenciais (2FA, chaves, etc.), isentando o Vendedor de perdas decorrentes de falhas de custódia ou uso indevido.",
  );

  addH("3. DA EXCLUSÃO DE RESPONSABILIDADE");
  addP(
    "3.1 O Vendedor não será responsável por falhas fora de seu controle, incluindo problemas de rede, falhas de sistema ou eventos imprevistos que afetem a execução deste contrato.",
  );

  addH("4. DO VALOR E FORMA DE PAGAMENTO");
  addP(`4.1 O valor total da transação é de ${v}, correspondente à compra de ${q} ${a}.`);
  addP(
    "4.2 O pagamento será efetuado via transferência bancária (Pix ou TED), conforme combinado entre as partes.",
  );
  addP(
    "4.3 O pagamento deverá ser realizado dentro do prazo da ordem no P2P da corretora, sendo rescindido automaticamente em caso de descumprimento.",
  );

  addH("5. DA TRANSFERÊNCIA DE ATIVOS");
  addP(
    `5.1 O Vendedor se compromete a transferir à carteira/conta do Comprador (apelido ${uNick} na corretora ${ex}) a quantidade de ${q} ${a} após a confirmação do pagamento.`,
  );
  addP("5.2 A transferência será realizada via P2P.");
  addP("5.3 O Vendedor declara legítima propriedade do ativo vendido, livre de ônus e restrições.");

  addH("6. DOS RISCOS ASSUMIDOS");
  addP(
    "6.1 O mercado de criptoativos é volátil; o Comprador reconhece e assume riscos de variação.",
  );
  addP("6.2 Não há devolução/reembolso de ativo após a transferência ser concluída.");
  addP(
    "6.3 Após a transferência, o Comprador assume os riscos e responsabilidades sobre os ativos adquiridos.",
  );

  addH("7. DA INADIMPLÊNCIA");
  addP(
    "7.1 Se o pagamento não for confirmado no prazo, o contrato será automaticamente rescindido, sem necessidade de notificação.",
  );

  addH("8. DISPOSIÇÕES GERAIS");
  addP(
    "8.1 Este contrato é celebrado de boa-fé; ambas as partes declaram ter lido e compreendido seus termos.",
  );
  addP("8.2 Este contrato obriga as partes e seus sucessores.");
  addP("8.3 Este contrato representa o acordo integral, substituindo entendimentos anteriores.");
  addP("8.4 Alterações/aditamentos somente por escrito.");
  addP(
    "8.5 Transações podem ser registradas em blockchain e/ou na corretora e podem servir de referência para auditoria.",
  );
  addP(
    "8.6 O aceite e a assinatura ocorrerão de forma eletrônica, vinculados aos dados cadastrados na corretora, para fins de registro e auditoria.",
  );
  addP("8.7 O comprador declara ciência das políticas internas de KYC/PLD/FT aplicáveis.");
  addP(
    "8.8 Regido pela legislação brasileira, especialmente Código Civil e Lei nº 14.063/2020 (assinaturas eletrônicas).",
  );
  addP("8.9 Foro: Comarca de Jacareí - São Paulo, com renúncia a qualquer outro.");

  // Final
  addP(
    `E, assim, por estarem justas e contratadas, as partes declaram que este instrumento foi aceito eletronicamente no chat da ordem de número ${o} e arquivado para fins de registro e auditoria nos sistemas da Cryptotech.`,
  );

  // ✅ aqui corrige o “Jacareí, - de - de -.”
  addP(`Jacareí, ${dataExtenso}.`);

  // Página nova para a “assinatura”
  lines.push({ text: "__PAGE_BREAK__" });

  lines.push({ text: "ASSINATURA ELETRÔNICA", size: 14, font: "F1" });
  spacer(1);

  // ===== VENDEDOR =====
  lines.push({ text: "VENDEDOR: CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA", size: 11, font: "F1" });
  lines.push({ text: "CNPJ: 55.636.113/0001-70" });
  spacer(1);

  lines.push({ text: "Assinatura eletrônica:", size: 11, font: "F1" });
  // ✅ MAIS ESPAÇO antes do nome
  spacer(1);
  lines.push({ text: representanteCryptotech.nome, size: 16, font: "F2" });
  lines.push({
    text: "_______________________________________________________________",
    size: 11,
    font: "F1",
  });
  spacer(1);

  lines.push({
    text: `CPF do representante: ${representanteCryptotech.cpf}`,
    size: 11,
    font: "F1",
  });
  lines.push({
    text: "Registro: aceite eletrônico vinculado à ordem e ao evento no chat/plataforma.",
    size: 10,
    font: "F1",
  });

  spacer(2);

  // ===== COMPRADOR =====
  lines.push({ text: `COMPRADOR: ${uName}`, size: 11, font: "F1" });
  lines.push({ text: `CPF/CNPJ: ${uDoc}` });
  spacer(1);

  lines.push({ text: "Assinatura eletrônica:", size: 11, font: "F1" });
  // ✅ MAIS ESPAÇO antes do nome
  spacer(1);
  lines.push({ text: uName, size: 16, font: "F2" });
  lines.push({
    text: "_______________________________________________________________",
    size: 11,
    font: "F1",
  });
  spacer(1);

  lines.push({
    text: `Registro: aceite eletrônico do comprador vinculado ao cadastro na corretora e à ordem ${o}.`,
    size: 10,
    font: "F1",
  });

  // Gera PDF
  const pdfBytes = createPdfFromLines(lines);
  const pdfBase64 = bytesToBase64(pdfBytes);
  const dataUrl = `data:application/pdf;base64,${pdfBase64}`;

  return {
    dataUrl,
    pdfBase64,
    fileName: `contrato-${o}.pdf`,
  };
};
