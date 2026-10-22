/** Frontend React — parâmetros e retorno originais preservados. */
import { bytesToBase64, createPdfFromLines, wrapParagraph } from "src/utils/simplePdf";

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
  cryptotechIsBuyer?: boolean;
}

/** Modelo V2 para operações P2P em corretoras. Não gera assinatura eletrônica. */
const CONTRACT_VERSION = "V2";

const CONTRACT_TEMPLATE = String.raw`# CONTRATO DE COMPRA E VENDA BILATERAL DE ATIVOS DIGITAIS POR CONTA PRÓPRIA — P2P

**Versão V2 | Operação P2P | Documento gerado automaticamente; confirmação contratual depende de evidência válida.**

## IDENTIFICAÇÃO DAS PARTES

**CRYPTOTECH:** CRYPTOTECH DESENVOLVIMENTO LTDA., inscrita no CNPJ nº 55.636.113/0001-70, com sede na Avenida Paulista, nº 91, Conjunto 905, Edifício Paulista Tower, Bela Vista, São Paulo/SP, CEP 01311-000, neste ato representada na forma dos seus atos societários, doravante denominada **CRYPTOTECH**.

**CONTRAPARTE:** {NOME_CONTRAPARTE}, inscrita no CPF/CNPJ nº {DOCUMENTO_CONTRAPARTE}, identificada na plataforma pelo apelido {APELIDO}, doravante denominada **CONTRAPARTE**. A qualificação pessoal complementar, quando necessária e legitimamente disponível, integra os registros cadastrais e de verificação vinculados à operação.

Na ordem P2P objeto deste instrumento, a **CRYPTOTECH figura como {PAPEL_CRYPTOTECH}** e a **CONTRAPARTE figura como {PAPEL_CONTRAPARTE}**.

## 1. OBJETO E NATUREZA DA OPERAÇÃO

**1.1.** O presente instrumento disciplina exclusivamente a operação bilateral de compra e venda do ativo digital identificado na ordem P2P, realizada entre a CRYPTOTECH e a CONTRAPARTE como compradora e vendedora diretas, conforme os papéis indicados acima.

**1.2.** A CRYPTOTECH declara atuar, nessa operação, em nome próprio e por conta própria, como contraparte comercial, e não por mandato para executar ordens de investimento da CONTRAPARTE. A presente declaração deve corresponder à titularidade, à contabilização e à execução efetivas da operação.

**1.3.** Este instrumento não constitui contrato de administração ou custódia continuada de criptoativos da CONTRAPARTE, gestão de carteira, assessoria de investimentos, promessa de rentabilidade ou autorização para movimentação de patrimônio da CONTRAPARTE em nome dela perante terceiros.

**1.4.** A corretora {EXCHANGE} fornece o ambiente P2P e os mecanismos operacionais próprios da plataforma, podendo disponibilizar custódia temporária/escrow e procedimentos de contestação conforme suas regras. Este instrumento não substitui nem altera unilateralmente as regras da plataforma e não atribui à corretora a condição de parte deste contrato bilateral.

## 2. IDENTIFICAÇÃO DA ORDEM E CONDIÇÕES COMERCIAIS

**2.1.** A operação está vinculada à ordem P2P nº {ORDER_ID}, criada em {DATA_ORDEM}, na corretora {EXCHANGE}.

**2.2.** Ativo digital negociado: **{ATIVO}**. Quantidade negociada: **{QUANTIDADE} {ATIVO}**. Valor total da contraprestação: **{VALOR}**. Moeda de pagamento: **{MOEDA_FIAT}**. Meio de pagamento selecionado na ordem: **{MEIO_PAGAMENTO}**.

**2.3.** O preço, a quantidade, os prazos, os dados bancários e a modalidade da transação deverão corresponder aos termos efetivamente aceitos na ordem e às regras da plataforma. Eventuais divergências devem ser resolvidas antes da transferência ou liberação dos ativos.

**2.4.** Este contrato abrange o ativo e a quantidade registrados na ordem, inclusive quando diferentes de BTC, tais como USDT, USDC, ETH ou outros ativos disponibilizados no P2P. Não presume equivalência de riscos, redes, preços ou liquidez entre ativos distintos.

## 3. PAGAMENTO E TITULARIDADE DOS RECURSOS

**3.1.** O pagamento em moeda fiduciária será realizado exclusivamente pelo comprador ao vendedor, no valor e dentro do prazo da ordem, pelo método permitido e indicado na plataforma.

**3.2.** O pagador deverá utilizar conta de sua própria titularidade e o recebedor deverá utilizar conta de titularidade correspondente à parte vendedora, observada a identificação cadastral verificada. É vedado pagamento por terceiro não validado, conta emprestada, triangulação ou fracionamento destinado a contornar controles de risco.

**3.3.** Comprovante enviado por mensagem não equivale, por si só, à efetiva disponibilidade dos recursos. A confirmação dependerá da verificação do crédito e da titularidade nos sistemas bancários e da observância das regras do P2P.

**3.4.** Nenhuma das partes deverá transferir valores para destinatário diverso do indicado na ordem sem procedimento formal, rastreável e permitido pela plataforma; situações suspeitas serão tratadas pelos mecanismos oficiais de contestação e prevenção a fraude.

## 4. DISPONIBILIZAÇÃO E LIBERAÇÃO DOS ATIVOS

**4.1.** A parte vendedora disponibilizará a quantidade contratada do ativo digital na forma exigida pela corretora e pelo seu mecanismo de retenção temporária/escrow, quando existente.

**4.2.** A liberação ou transferência definitiva do ativo digital ao comprador ocorrerá após a confirmação efetiva do pagamento pelo vendedor e a conclusão das verificações cabíveis, observados os prazos, procedimentos e decisões da plataforma.

**4.3.** Quando a CRYPTOTECH for compradora, caberá à CONTRAPARTE vendedora disponibilizar e liberar os ativos após o recebimento confirmado do pagamento da CRYPTOTECH, conforme o fluxo P2P. Quando a CRYPTOTECH for vendedora, caberá a ela efetuar a liberação após confirmar o pagamento da CONTRAPARTE.

**4.4.** As partes reconhecem a finalidade probatória dos identificadores e eventos da ordem e, quando aplicável, dos registros on-chain. Nenhuma pessoa deverá compartilhar chaves privadas, seed phrases ou códigos de autenticação com a outra parte.

## 5. IDENTIFICAÇÃO, KYC, PLD/FT E PREVENÇÃO À FRAUDE

**5.1.** A CONTRAPARTE deve manter cadastro verdadeiro e atualizado na corretora e cooperar com diligências lícitas, proporcionais e necessárias de identificação, verificação de titularidade bancária, origem de recursos, capacidade financeira e prevenção à fraude, observadas as políticas aplicáveis.

**5.2.** A CRYPTOTECH poderá utilizar dados de identidade e CPF/CNPJ legitimamente disponibilizados e já verificados, quando suficientes, evitando sua coleta repetitiva. A ausência de necessidade de reenvio não significa dispensa de verificação cadastral.

**5.3.** O valor reduzido de uma ordem não impede a solicitação de documentos adicionais quando houver divergência de titularidade, suspeita de fraude, alerta de MED, comportamento atípico, exigência da instituição de pagamento, da corretora ou outra justificativa relevante.

**5.4.** A análise poderá exigir documento de identificação, prova de titularidade de conta, comprovantes de renda ou faturamento, extratos, elementos de origem de recursos e demais informações proporcionais ao risco. A CRYPTOTECH poderá suspender a liberação ou submeter a ordem à disputa oficial da corretora, quando cabível, sem criar retenção indefinida ou direito de apropriação de valores.

**5.5.** A falsidade documental, a utilização de conta de terceiro ou a recusa injustificada de verificação necessária poderão resultar em recusa de operação futura, comunicação à plataforma, cancelamento ou outras medidas legalmente permitidas, preservados direitos de contestação e de restituição quando cabíveis.

## 6. DECLARAÇÕES E DEVERES DAS PARTES

**6.1.** A parte vendedora declara ter legitimidade para alienar o ativo na quantidade negociada e compromete-se a não utilizar recursos ou ativos vinculados a fraude ou outra ilicitude.

**6.2.** A parte compradora declara que a origem do pagamento é lícita, que a conta utilizada lhe pertence e que não utiliza terceiros ocultos para realizar a operação.

**6.3.** Ambas as partes atuarão com boa-fé, conservarão registros pertinentes e colaborarão com esclarecimentos sobre divergências e reclamações, pelos canais oficiais e dentro dos limites legais.

## 7. RISCOS DOS ATIVOS DIGITAIS E RESPONSABILIDADE

**7.1.** A CONTRAPARTE reconhece que os ativos digitais podem apresentar volatilidade, variação de liquidez, riscos de mercado, tecnológicos, operacionais, de custódia na plataforma e, conforme o ativo, possibilidade de bloqueio, desvalorização ou perda de paridade.

**7.2.** A irreversibilidade técnica de determinadas transferências não afasta direitos legais, regras aplicáveis de resolução de conflitos, deveres de restituição nem responsabilidade por descumprimento contratual, defeito do serviço ou conduta culposa ou dolosa comprovada.

**7.3.** Cada parte responde pelos danos que comprovadamente causar por descumprimento contratual ou ato ilícito, considerados o nexo causal e a legislação aplicável. Nenhuma cláusula exclui responsabilidade legal inderrogável da CRYPTOTECH, da plataforma ou de terceiros.

## 8. INADIMPLEMENTO, CONTESTAÇÃO, MED E RESTITUIÇÕES

**8.1.** O descumprimento dos prazos da ordem e a ausência de pagamento ou entrega serão tratados conforme os mecanismos da plataforma e a legislação aplicável; eventual cancelamento não prejudicará obrigações já constituídas nem restituições legalmente devidas.

**8.2.** Diante de indícios de fraude, pagamento não identificado, divergência de titularidade ou contestação, as partes poderão solicitar análise e fornecer evidências à corretora e à instituição de pagamento, abstendo-se de liberar ativos enquanto o procedimento aplicável permitir a suspensão.

**8.3.** O Mecanismo Especial de Devolução (MED) do Pix pode ser aplicado nas hipóteses previstas em sua regulamentação, especialmente fraude e falha operacional, e não substitui a solução ordinária de mero desacordo comercial. Este contrato não limita o direito de acionamento do MED nem garante seu deferimento ou resultado.

**8.4.** Restituições que sejam devidas observarão a apuração do caso concreto e, sempre que aplicável, utilizarão o procedimento de devolução do pagamento original, evitando pagamento a conta de terceiro.

## 9. DADOS PESSOAIS E REGISTROS

**9.1.** As partes reconhecem que a CRYPTOTECH poderá tratar os dados necessários à execução contratual, verificação de identidade, prevenção a fraudes, exercício de direitos e cumprimento de obrigações legais ou regulatórias, conforme as bases legais adequadas e a Lei nº 13.709/2018 (LGPD).

**9.2.** Poderão ser conservados os registros da ordem, comprovantes, comunicações, identificadores da corretora, eventos de aceite, dados bancários estritamente necessários e evidências relacionadas ao cumprimento ou contestação da negociação, pelos prazos justificáveis segundo a legislação aplicável.

**9.3.** A CONTRAPARTE terá acesso às informações de privacidade e aos canais para exercício de direitos de titular disponibilizados pela CRYPTOTECH, sem prejuízo das políticas próprias da corretora.

## 9.4. DA VERIFICAÇÃO DOCUMENTAL E DOS PROCEDIMENTOS DE COMPLIANCE APÓS A TRANSFERÊNCIA

**9.4.1.** A CONTRAPARTE declara estar previamente ciente e concordar que, a partir da realização de pagamento, transferência de recursos financeiros ou transferência de ativos digitais relacionados à operação contratada, a CRYPTOTECH DESENVOLVIMENTO LTDA. poderá realizar procedimentos de identificação, verificação documental, análise cadastral, financeira, patrimonial e de conformidade (compliance), necessários à validação da operação e à prevenção de fraudes, lavagem de dinheiro, financiamento ao terrorismo e demais atividades ilícitas.

**9.4.2.** Para essas finalidades, a CRYPTOTECH poderá acessar, consultar, validar e tratar, quando legitimamente disponibilizados ou obtidos por meios legalmente autorizados, dados como nome completo, CPF/CNPJ, documentos de identificação, informações de titularidade bancária, registros transacionais, informações cadastrais e outras evidências pertinentes, inclusive mediante consultas a bases públicas, privadas ou sistemas de verificação de identidade regularmente acessíveis.

**9.4.3.** A CONTRAPARTE reconhece que a realização do pagamento ou transferência não garante a aprovação automática da operação. A conclusão da negociação e a liberação dos ativos digitais estarão condicionadas à confirmação do recebimento dos valores, à verificação de titularidade e à aprovação dos procedimentos de segurança e compliance aplicáveis, respeitadas as regras da corretora utilizada.

**9.4.4.** A CRYPTOTECH poderá solicitar documentos complementares, inclusive documento oficial com foto, selfie para verificação de identidade, comprovante de endereço, extratos bancários, comprovantes de renda ou faturamento, declaração de imposto de renda e comprovação de origem dos recursos, sempre que a natureza, o valor, a frequência ou o risco da operação justificarem tais exigências.

**9.4.5.** Caso sejam identificadas inconsistências documentais, divergência de titularidade, indícios de fraude, contestação bancária, MED ou outras circunstâncias relevantes, a CRYPTOTECH poderá suspender a conclusão da operação, solicitar esclarecimentos adicionais e utilizar os mecanismos oficiais de contestação, observadas a legislação aplicável, as regras da corretora e os direitos da CONTRAPARTE, inclusive quanto à restituição de valores quando legalmente devida.

**9.4.6.** O tratamento dos dados pessoais observará a Lei nº 13.709/2018 (LGPD), especialmente os princípios de finalidade, adequação, necessidade, transparência e segurança, utilizando as bases legais apropriadas a cada finalidade, inclusive execução contratual, cumprimento de obrigação legal ou regulatória, prevenção de fraudes quando cabível e exercício regular de direitos.

**9.4.7.** A CRYPTOTECH manterá os registros e documentos pelo período necessário às finalidades legítimas informadas, observadas as obrigações legais e as medidas de segurança pertinentes. O tratamento de dados pessoais sensíveis, quando necessário, deverá observar também os requisitos específicos do artigo 11 da LGPD.

**9.4.8.** A realização da transferência representa a continuidade da operação nas condições previamente apresentadas, mas não substitui, isoladamente, a prova de aceite contratual nem autoriza acesso irrestrito a documentos pessoais, sistemas bancários ou informações protegidas por sigilo. O aceite deste instrumento deverá ser demonstrável por registro eletrônico válido, obtido antes da transferência.

## 10. DISPONIBILIZAÇÃO PRÉVIA, ACEITE E ASSINATURA ELETRÔNICA

**10.1.** Antes do pagamento, a CONTRAPARTE deverá ter acesso ao texto e à versão deste contrato, às condições específicas da ordem e, quando aplicável, às políticas vinculadas, por meio permitido pela corretora ou do ambiente autenticado da CRYPTOTECH.

**10.2.** A comprovação de aceite eletrônico dependerá de manifestação de vontade registrável e vinculada à versão do documento e à pessoa identificada, podendo incluir aceite expresso autenticado, assinatura eletrônica, recurso válido da plataforma ou outro meio juridicamente admitido. O simples preenchimento do nome da CONTRAPARTE no PDF não constitui, isoladamente, assinatura eletrônica.

**10.3.** Quando o aceite ainda não tiver ocorrido ou sua prova não estiver disponível, a via gerada será identificada como documento disponibilizado ou pendente de aceite, sem afirmar assinatura inexistente ou retroagir artificialmente a data do consentimento.

**10.4.** Uma vez comprovado o aceite, a via final poderá ser disponibilizada no site autenticado da CRYPTOTECH e, quando permitido, associada à ordem da corretora, contendo versão do contrato, data e hora do evento, método, identificador de evidência e elementos de integridade.

## 11. DISPOSIÇÕES FINAIS

**11.1.** Este instrumento disciplina a operação identificada no item 2, não cria obrigação de realização de operações futuras nem altera regras obrigatórias da corretora ou direitos legais das partes.

**11.2.** As divergências deverão ser buscadas inicialmente pelos canais oficiais da plataforma e da CRYPTOTECH, sem prejuízo do acesso à autoridade competente e ao Poder Judiciário.

**11.3.** Aplicam-se as leis brasileiras e as regras legais de competência, inclusive as normas de proteção ao consumidor quando cabíveis; não haverá renúncia antecipada a foro legalmente assegurado.

## 12. IDENTIFICAÇÃO E REGISTRO DE ACEITE

**Ordem P2P:** {ORDER_ID}

**Versão do documento:** {VERSAO_CONTRATO}

**CRYPTOTECH:** CRYPTOTECH DESENVOLVIMENTO LTDA. — CNPJ 55.636.113/0001-70 — Papel na ordem: {PAPEL_CRYPTOTECH}

**CONTRAPARTE:** {NOME_CONTRAPARTE} — CPF/CNPJ {DOCUMENTO_CONTRAPARTE} — Papel na ordem: {PAPEL_CONTRAPARTE}

**Situação do aceite contratual:** {STATUS_ACEITE}

**Ato esperado do comprador:** {ATO_COMPRADOR}

**Ato esperado do vendedor:** {ATO_VENDEDOR}

**Registro operacional:** {METODO_ACEITE}

**Data e hora da ordem:** {DATA_HORA_ACEITE}

**Identificador da operação:** {ID_EVIDENCIA}

**Hash documental:** {HASH_DOCUMENTO}

**Importante:** este quadro identifica as partes e o estado documental. A ordem P2P identifica a transação; pagamento, confirmação dos atos é o aceite dos termos e condições desta ordem.
`;

type TextLine = { text: string; font?: "F1" | "F2"; size?: number };

type V2ContractData = {
  orderId: string;
  data: string;
  exchange: string;
  quantidade: string;
  valor: string;
  ativo: string;
  buyerName: string; // Nome da CONTRAPARTE; legado, mesmo quando for a vendedora.
  buyerDocument: string;
  nickName: string;
  cryptotechIsBuyer: boolean;
};

const field = (key: string, value: unknown) => {
  const s = String(value ?? "").trim();
  if (!s || s === "-") throw new Error(`Contrato V2: campo obrigatório ausente: ${key}`);
  return s;
};

function dateTimeBrasilia(raw: string): string {
  const value = field("data", raw).trim();
  let m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const dd = m[1].padStart(2, "0"),
      mm = m[2].padStart(2, "0"),
      yyyy = m[3];
    if (+dd < 1 || +dd > 31 || +mm < 1 || +mm > 12) throw new Error("Data de ordem inválida");
    return `${dd}/${mm}/${yyyy}${m[4] !== undefined ? ` às ${m[4].padStart(2, "0")}:${m[5]}:${m[6] ?? "00"}` : " (horário não informado)"}`;
  }
  // Quando vier fuso explícito da API (UTC/offset), converte para São Paulo.
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)) {
    const timestamp = new Date(value);
    if (Number.isNaN(timestamp.getTime())) throw new Error("Data de ordem inválida");
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(timestamp);
    return formatted.replace(",", " às") + " (horário de Brasília)";
  }
  m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const dd = m[3].padStart(2, "0"),
      mm = m[2].padStart(2, "0");
    if (+dd < 1 || +dd > 31 || +mm < 1 || +mm > 12) throw new Error("Data de ordem inválida");
    return `${dd}/${mm}/${m[1]}${m[4] !== undefined ? ` às ${m[4].padStart(2, "0")}:${m[5]}:${m[6] ?? "00"}` : " (horário não informado)"}`;
  }
  throw new Error("Formato de data inválido. Utilize dd/MM/aaaa HH:mm:ss ou ISO 8601.");
}

function buildLines(
  p: V2ContractData,
  wrap: (text: string, fontSize?: number) => string[],
): TextLine[] {
  const exchange = field("exchange", p.exchange);
  if (exchange.toUpperCase() === "CRYPTOTECH") {
    throw new Error(
      "O contrato V2-P2P é exclusivo para corretoras. Para operações fora da corretora, utilize o contrato bilateral direto.",
    );
  }
  const orderId = field("orderId", p.orderId);
  const name = field("buyerName", p.buyerName);
  const document = field("buyerDocument", p.buyerDocument);
  const roleCrypto = p.cryptotechIsBuyer ? "COMPRADORA" : "VENDEDORA";
  const roleUser = p.cryptotechIsBuyer ? "VENDEDORA" : "COMPRADORA";
  const date = dateTimeBrasilia(p.data);
  const values: Record<string, string> = {
    NOME_CONTRAPARTE: name,
    DOCUMENTO_CONTRAPARTE: document,
    APELIDO: field("nickName", p.nickName),
    PAPEL_CRYPTOTECH: roleCrypto,
    PAPEL_CONTRAPARTE: roleUser,
    EXCHANGE: exchange,
    ORDER_ID: orderId,
    DATA_ORDEM: date,
    ATIVO: field("ativo", p.ativo).toUpperCase(),
    QUANTIDADE: field("quantidade", p.quantidade),
    VALOR: field("valor", p.valor),
    // Parâmetros originais não trazem moeda fiduciária e modalidade bancária.
    MOEDA_FIAT: "Conforme moeda registrada na ordem P2P",
    MEIO_PAGAMENTO: "Conforme método efetivamente selecionado na ordem P2P",
    VERSAO_CONTRATO: CONTRACT_VERSION,
    STATUS_ACEITE: "COMPROVAÇÃO DE ACEITE ESPECÍFICO DESTE CONTRATO DO ATO",
    ATO_COMPRADOR: "Efetuar o pagamento e confirmar o pagamento na ordem da corretora.",
    ATO_VENDEDOR:
      "Conferir o recebimento efetivo do dinheiro antes de liberar o ativo na corretora.",
    METODO_ACEITE:
      "Acompanhamento e confirmação pelos eventos da ordem P2P; não equivalem isoladamente à assinatura.",
    DATA_HORA_ACEITE: date,
    ID_EVIDENCIA: `Ordem ${orderId} da corretora ${exchange}`,
    HASH_DOCUMENTO: `Não existe hash documental neste gerador. A ordem ${orderId} identifica a transação interna na corretora, mas não comprova integridade ou assinatura deste PDF.`,
  };
  const rendered = CONTRACT_TEMPLATE.replace(
    /\{([A-Z_]+)\}/g,
    (match, key: string) => values[key] ?? match,
  );
  const result: TextLine[] = [];
  let lastBlank = false;
  for (const raw of rendered.split(/\r?\n/)) {
    let txt = raw.trim();
    if (!txt) {
      if (!lastBlank) result.push({ text: "", size: 5 });
      lastBlank = true;
      continue;
    }
    lastBlank = false;
    if (txt.startsWith("## 12. ")) result.push({ text: "__PAGE_BREAK__" });
    let size = 10,
      font: "F1" | "F2" = "F1";
    if (txt.startsWith("# ")) {
      txt = txt.slice(2);
      size = 14;
      font = "F2";
    } else if (txt.startsWith("## ")) {
      txt = txt.slice(3);
      size = 12;
      font = "F2";
    }
    txt = txt.replace(/\*\*/g, "").replace(/\s+/g, " ");
    for (const piece of wrap(txt, size)) result.push({ text: piece, size, font });
  }
  return result;
}

/** Gera visualização do contrato V2; não constitui assinatura eletrônica. */
export const confirmContract = async ({
  usuario,
  ordem,
  data,
  exchange,
  quantidade,
  valor,
  ativo,
  cryptotechIsBuyer = false,
}: IConfirmContract) => {
  const p: V2ContractData = {
    orderId: ordem,
    data,
    exchange,
    quantidade,
    valor,
    ativo,
    buyerName: usuario.name,
    buyerDocument: usuario.document,
    nickName: usuario.apelido,
    cryptotechIsBuyer,
  };
  const lines = buildLines(p, wrapParagraph);
  // O simplePdf do frontend já exporta estas três funções, conforme código fornecido.
  const pdfBase64 = bytesToBase64(createPdfFromLines(lines));
  const fileOrderId = String(ordem).replace(/[^A-Za-z0-9_-]/g, "_");
  return {
    dataUrl: `data:application/pdf;base64,${pdfBase64}`,
    pdfBase64,
    fileName: `contrato-p2p-v2-${fileOrderId}.pdf`,
  };
};
