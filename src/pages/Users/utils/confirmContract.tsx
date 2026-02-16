import { generateDocAsPdf } from "src/pages/Contracts/config/generateDocAsPdf";

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

export const services = ({
  usuario,
  ordem,
  data,
  exchange,
  quantidade,
  valor,
  ativo,
}: IConfirmContract) => {
  let docContent = `
    <h1>CONTRATO DE COMPRA E VENDA</h1>
    <p>Pelo presente instrumento particular, e na melhor forma de direito, as partes a seguir qualificadas:</p>
  `;

  const addContent = (text: string, fontSize: number) => {
    docContent += `<p style="font - size:${fontSize} pt;">${text}</p>`;
  };

  const addLineBreak = (lines: number = 1) => {
    docContent += `<br>`.repeat(lines);
  };

  // Add Parties
  const parties = [
    `${usuario.name}, brasileira, inscrita no CPF/MF sob nº ${usuario.document}, neste ato denominada simplesmente COMPRADORA; e de outro lado,`,
    `CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA, pessoa jurídica de direito privado com sede localizada na Estrada do Limoeiro, 495 - Jardim California, Jacarei - SP, 12.305-810, inscrita no C.N.P.J/MF sob o número 55.636.113/0001-70, neste ato representada por Matheus Henrique de Abreu brasileiro, casado, inscrito no CPF/MF sob nº 338.624.448-30, residente e domiciliada na Rua Estrada do Limoeiro, 495 - Jardim California, Jacarei - SP, 12.305-810, pagamento será feito via transferência bancária (Pix ou TED) através dos dados enviados a compradora, doravante denominada simplesmente VENDEDORA, e,`,
    `tem entre si, justo e contratado, o presente CONTRATO DE COMPRA DE ATIVOS, que serão realizados mediante as seguintes cláusulas e condições:`,
  ];
  parties.forEach((paragraph) => {
    addContent(paragraph, 12);
  });

  addLineBreak(2);

  // Add Clause Titles and Content
  const clauses = [
    {
      title: `1. DO OBJETO DO CONTRATO`,
      content: [
        `1.1 O objeto do presente contrato é a compra e venda de ativos nas condições do presente contrato.`,
        `1.2 O Vendedor compromete-se a vender e o Comprador compromete-se a comprar a quantia de ${quantidade} ${ativo}, por meio da transferência do ativo ${ativo} na ordem ${ordem} em ${data} no P2P da corretora ${exchange}, conforme acordado entre as partes.`,
      ],
    },
    {
      title: `2. DA RESPONSABILIDADE DAS PARTES`,
      content: [
        `2.1 VENDEDOR`,
        `2.1.1 O Vendedor é responsável por garantir que a quantidade de ativos - ${ativo} seja transferida para a carteira do Comprador conforme o acordado.`,
        `2.1.2 O Vendedor garante que o ativo - ${ativo} transferido é legítimo, sem qualquer vínculo com fraudes ou ações ilícitas, e que não está sujeito a qualquer penhora, restrição ou ônus.`,
        `2.1.3 O Vendedor não será responsável por qualquer perda, dano ou prejuízo resultante de falhas na transação, incluindo erros de rede ou problemas com carteiras de criptomoedas ou contas de corretoras.`,
        `2.2 COMPRADOR`,
        `2.2.1 O Comprador compromete-se a informar de forma completa e correta o endereço de sua carteira digital e/ou a realizar a ordem diretamente por sua conta na plataforma/corretora indicada para o recebimento dos ativos adquiridos, garantindo ainda que o pagamento seja efetuado nos prazos, valores e condições estabelecidos neste contrato.`,
        `2.2.2 O Comprador reconhece e assume integral responsabilidade pela gestão e segurança de sua carteira digital e/ou conta em plataforma/corretora, incluindo a guarda de credenciais, chaves privadas, frases-semente, autenticações (2FA) e demais mecanismos de acesso, isentando o Vendedor de qualquer responsabilidade por perdas, extravios, indisponibilidades, acessos não autorizados, fraudes ou danos decorrentes de falha de custódia, negligência, compartilhamento de informações ou uso inadequado de tais credenciais.`,
      ],
    },
    {
      title: `3. DA EXCLUSÃO DE RESPONSABILIDADE`,
      content: [
        `3.1 O Vendedor não será responsável por qualquer falha ou erro decorrente de causas fora de seu controle, incluindo problemas com a rede blockchain, falhas de sistema ou qualquer outro evento imprevisto que possa afetar a execução deste contrato`,
      ],
    },
    {
      title: `4. DO APORTE DE RECURSOS - VALOR E FORMA DE PAGAMENTO`,
      content: [
        `4.1 O valor total da transação é de ${valor}, correspondente à compra de ativos ${quantidade} ${ativo}.`,
        `4.2 O pagamento será efetuado pelo Comprador ao Vendedor da seguinte forma:
transferência bancária, conforme combinado entre as partes.`,
        `4.3 O pagamento deverá ser realizado até dentro dos limites do tempo da ordem no P2P da corretora, sendo considerado automaticamente rescindido o contrato em caso de não cumprimento deste prazo.`,
        `4.4 O Vendedor se reserva o direito de verificar a autenticidade e regularidade da transferência antes de concluir a operação de envio dos ativos.`,
      ],
    },
    {
      title: `5. DA TRANSFERÊNCIA DE ATIVOS`,
      content: [
        `5.1 O Vendedor se compromete a transferir para a carteira digital do Comprador, identificada pelo apelido ${usuario.apelido} na corretora ${exchange} a quantidade de ${quantidade} ${ativo} após a confirmação do pagamento pelo Comprador.`,
        `5.2 A transferência será realizada via P2P`,
        `5.3 O Vendedor declara que o ativo que está vendendo é de sua legítima propriedade, não estando sujeito a qualquer ônus ou restrição.`,
      ],
    },
    {
      title: `6. DOS RISCOS ASSUMIDOS`,
      content: [
        `6.1 As partes reconhecem que o mercado de criptomoedas é altamente volátil e os valores podem variar significativamente em curtos períodos de tempo. O Comprador entende e assume os riscos relacionados à flutuação no valor do ativo.`,
        `6.2 As partes reconhecem que não há devolução e / ou reembolso de ativo após a transferência ser concluída.`,
        `6.3 Após a transferência, o comprador assume todos os riscos e responsabilidades relacionados aos ativos adquiridos.`,
      ],
    },
    {
      title: `7. DA INADIMPLÊNCIA`,
      content: [
        `7.1 Caso o pagamento não seja confirmado dentro do prazo estipulado na Cláusula 4.3, o contrato será automaticamente rescindido, sem necessidade de notificação, e o Vendedor não terá mais obrigação de transferir o ativo objeto da negociação.`,
      ],
    },
    {
      title: `8. DISPOSIÇÕES GERAIS`,
      content: [
        `8.1 Este contrato é celebrado de boa-fé, sendo que ambas as partes declaram ter lido e compreendido seus termos.`,
        `8.2 Este contrato é vinculativo e obriga as partes, seus sucessores e cessionários.`,
        `8.3 Este contrato representa o acordo integral entre as partes, substituindo quaisquer entendimentos ou negociações anteriores, verbais ou escritos.`,
        `8.4 Qualquer alteração ou aditamento a este contrato deverá ser realizada por escrito e assinada por ambas as partes`,
        `8.5 As partes reconhecem que todas as transações de ativos/criptomoedas são registradas em blockchain e/ou na corretora utilizada, e que as informações ali contidas serão consideradas referência para verificação do cumprimento das obrigações estabelecidas neste contrato.`,
        `8.6 Este contrato entra em vigor a partir da realização do pagamento e da confirmação da ordem pelo cliente no botão de confirmação. O aceite e a assinatura ocorrerão de forma eletrônica, vinculados ao nome e CPF/CNPJ cadastrados na corretora, para fins de registro, auditoria e comprovação, conforme o disposto em lei.`,
        `8.6.1 Caso o pagamento seja realizado por CNPJ em substituição ao CPF, o aceite permanecerá válido desde que o CNPJ seja de pessoa jurídica com sócio único e haja vinculação/compatibilidade comprovada entre o pagador (CNPJ) e o comprador cadastrado na corretora (CPF), conforme as políticas internas de KYC/PLD/FT aplicáveis a ambos os perfis (pessoa física e pessoa jurídica). Nessa hipótese, o pagamento via CNPJ e o aceite eletrônico são considerados equivalentes para fins de validação e registro da operação.`,
        `8.7 Ao aceitar este contrato, o cliente declara ciência e concordância com as Políticas de PLD/FT (Prevenção à Lavagem de Dinheiro e ao Financiamento do Terrorismo), KYC (Conheça Seu Cliente) e demais regras de conformidade da CRYPTOTECH, bem como com os Termos de Uso e políticas aplicáveis disponíveis no site oficial da empresa, os quais passam a integrar este instrumento para todos os fins.`,
        `8.8 Este contrato será regido pelas disposições da legislação brasileira, em especial pelas normas do Código Civil, e, no que for pertinente, pela Lei nº 14.063/2020, que trata de assinaturas eletrônicas.`,
        `8.9 Em caso de litígios oriundos deste contrato, as partes elegem o foro da Comarca de Jacareí – São Paulo, renunciando a qualquer outro, por mais privilegiado que seja.`,
      ],
    },
  ];

  clauses.forEach((clause) => {
    addContent(clause.title, 14);
    clause.content.forEach((paragraph) => {
      addContent(paragraph, 12);
    });
    addLineBreak(2); // Pula 2 linhas entre as cláusulas
  });
  // data
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours());
  const formattedDate = currentDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Finalização
  const parseDateParts = (iso: string) => {
    const [yyyy = "", mm = "", dd = ""] = (iso ?? "").split("-");
    const dateObj = yyyy && mm && dd ? new Date(Number(yyyy), Number(mm) - 1, Number(dd)) : null;

    const dia = dd || "-";
    const ano = yyyy || "-";
    const mesExtenso =
      dateObj && !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("pt-BR", { month: "long" })
        : "-";

    return { dia, mesExtenso, ano };
  };

  const { dia, mesExtenso, ano } = parseDateParts(data);

  const final = [
    `E, assim, por estarem justas e contratadas, as partes declaram que este instrumento foi aceito eletronicamente no chat da ordem ${ordem} e arquivado para fins de registro e auditoria nos sistemas da Cryptotech.`,
    `Jacareí, ${dia} de ${mesExtenso} de ${ano}.`,
  ];

  final.forEach((paragraph) => {
    addContent(paragraph, 12);
  });
  addLineBreak(3);

  const representanteCryptotech = {
    nome: "Matheus Henrique de Abreu",
    cpf: "338.624.448-30",
  };

  docContent += `
  <div style="page-break-before: always; margin-top: 200px; margin-bottom: 120px;">
    <p style="font-size:12pt;"><strong>ASSINATURA ELETRÔNICA</strong></p>

    <p style="font-size:12pt; margin-top: 24px;">
      <strong>Vendedor:</strong> CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA
    </p>
    <p style="font-size:12pt;">CNPJ: 55.636.113/0001-70</p>
    <p style="font-size:12pt;">
      Assinatura eletrônica: <strong>${representanteCryptotech.nome}</strong>
    </p>
    <p style="font-size:12pt;">CPF do representante: ${representanteCryptotech.cpf}</p>
    <p style="font-size:10pt; opacity:0.85;">
      Registro: aceite eletrônico vinculado à ordem ${ordem}, com data e hora do evento no chat/plataforma.
    </p>

    <p style="font-size:12pt; margin-top: 28px;">
      <strong>Comprador:</strong> ${usuario?.name ?? "-"}
    </p>
    <p style="font-size:12pt;">CPF/CNPJ: ${usuario?.document ?? "-"}</p>
    <p style="font-size:12pt;">
      Assinatura eletrônica: <strong>${usuario?.name ?? "-"}</strong>
    </p>
    <p style="font-size:10pt; opacity:0.85;">
      Registro: aceite eletrônico do comprador vinculado ao nome e CPF/CNPJ cadastrados na corretora, associado à ordem ${ordem}.
    </p>
  </div>
`;

  // Gera o conteúdo e inicia a impressão como PDF
  generateDocAsPdf(docContent);
};
