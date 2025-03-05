import { IService } from "../../hooks/useServices";
import { generateDocAsPdf } from "../generateDocAsPdf";

export const services = ({
  usuario,
  quantidade,
  valor,
  ativo,
  pagamento,
  tempoLimite,
  blockchain,
  enderecoComprador,
  wallet,
  estadoCivil,
  cep,
  rua,
  cidade,
  numero,
  bairro,
  complemento,
  estado,
}: IService) => {
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
    `${usuario.name}, brasileiro, ${estadoCivil}, inscrita no CPF/MF sob nº ${usuario.document}, residente e domiciliada na ${rua}, ${numero}, ${complemento && `de complemento ${complemento},`} - ${bairro}, ${cidade} - ${estado}, ${cep}, neste ato denominada simplesmente COMPRADORA; e de outro lado,`,
    `CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA, pessoa jurídica de direito privado com sede localizada na Estrada do Limoeiro, 495 - Jardim California, Jacarei - SP, 12.305-810, inscrita no C.N.P.J/MF sob o número 55.636.113/0001-70, neste ato representada por Matheus Henrique de Abreu brasileiro, casado, inscrito no CPF/MF sob nº 338.624.448-30, residente e domiciliada na Rua Estrada do Limoeiro, 495 - Jardim California, Jacarei - SP, 12.305-810, pagamento será feito via ${pagamento} através dos dados enviados a compradora, doravante denominada simplesmente VENDEDORA, e,`,
    `tem entre si, justo e contratado, o presente CONTRATO DE COMPRA DE ATIVOS, que serão realizados mediante as seguintes cláusulas e condições:`,
  ];
  parties.forEach((paragraph) => {
    addContent(paragraph, 12);
  });

  addLineBreak(2);

  const currentDate = new Date();
  const hoursToAdd = parseInt(tempoLimite);
  currentDate.setHours(currentDate.getHours() + hoursToAdd);
  const formattedDate = currentDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Add Clause Titles and Content
  const clauses = [
    {
      title: `1. DO OBJETO DO CONTRATO`,
      content: [
        `1.1 O objeto do presente contrato é a compra e venda de ativos nas condições do presente contrato.`,
        `1.2 O Vendedor compromete-se a vender e o Comprador compromete-se a comprar a quantia de ${quantidade} ${ativo}, por meio da transferência do ativo ${ativo}, conforme acordado entre as partes.`,
      ],
    },
    {
      title: `2. DA RESPONSABILIDADE DAS PARTES`,
      content: [
        `2.1 VENDEDOR`,
        `2.1.1 O Vendedor é responsável por garantir que a quantidade de ativos - ${ativo} seja transferida para a carteira do Comprador conforme o acordado.`,
        `2.1.2 O Vendedor garante que o ativo - ${ativo} transferido é legítimo, sem qualquer vínculo com fraudes ou ações ilícitas, e que não está sujeito a qualquer penhora, restrição ou ônus.`,
        `2.1.3 O Vendedor não será responsável por qualquer perda, dano ou prejuízo resultante de falhas na transação, incluindo erros de rede ou problemas com carteiras de criptomoedas.`,
        `2.2 COMPRADOR`,
        `2.2.1 O Comprador é responsável por fornecer corretamente o endereço de sua carteira digital para o recebimento dos ativos adquiridos, bem como garantir que o pagamento seja realizado conforme os termos acordados neste contrato.`,
        `2.2.2 O Comprador assume a responsabilidade total pelo gerenciamento de sua carteira de ativos, incluindo a segurança de suas chaves privadas, isentando o Vendedor de qualquer responsabilidade sobre perdas ou danos decorrentes do mau gerenciamento dessas informações.`,
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
${pagamento}, conforme combinado entre as partes.`,
        `4.3 O pagamento deverá ser realizado até ${formattedDate}, sendo considerado automaticamente rescindido o contrato em caso de não cumprimento deste prazo.`,
        `4.4 O Vendedor se reserva o direito de verificar a autenticidade e regularidade da transferência antes de concluir a operação de envio dos ativos.`,
      ],
    },
    {
      title: `5. DA TRANSFERÊNCIA DE ATIVOS`,
      content: [
        `5.1 O Vendedor se compromete a transferir para a carteira digital do Comprador, identificada pelo endereço ${enderecoComprador} da blockchain ${blockchain}, a quantidade de ${quantidade} ${ativo} no prazo máximo de ${tempoLimite} ${hoursToAdd > 1 ? "horas" : "hora"} após a confirmação do pagamento pelo Comprador.`,
        `5.2 A transferência será realizada via ${wallet}`,
        `5.3 O Vendedor declara que o ativo que está vendendo é de sua legítima propriedade, não estando sujeito a qualquer ônus ou restrição.`,
      ],
    },
    {
      title: `6. DOS RISCOS ASSUMIDOS`,
      content: [
        `6.1 As partes reconhecem que o mercado de criptomoedas é altamente volátil e os valores podem variar significativamente em curtos períodos de tempo. O Comprador entende e assume os riscos relacionados à flutuação no valor do ativo.`,
        `6.2 As partes reconhecem que não há devolução e/ou reembolso de ativo após a transferência ser concluída.`,
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
        `8.4 Qualquer alteração ou aditamento a este contrato deverá ser realizada por escrito e assinada por ambas as partes.`,
        `8.5 As partes reconhecem que todas as transações de ativos/criptomoedas são registradas em blockchain, e as informações ali contidas são definitivas para a verificação do cumprimento das obrigações estabelecidas neste contrato.`,
        `8.6 Este contrato entra em vigor a partir da assinatura digital de ambas as partes. A assinatura pode ocorrer por meios digitais, conforme o disposto em lei.`,
        `8.7 Este contrato será regido pelas disposições da legislação brasileira, em especial pelas normas do Código Civil, e, no que for pertinente, pela Lei nº 14.063/2020, que trata de assinaturas eletrônicas.`,
        `8.8 Em caso de litígios oriundos deste contrato, as partes elegem o foro da Comarca de Jacareí – São Paulo, renunciando a qualquer outro, por mais privilegiado que seja.`,
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

  // Finalização
  const final = [
    `E, assim, por estarem justas e contratadas, assinam o presente instrumento em duas vias de igual teor, na presença das duas testemunhas abaixo.`,
    `Jacareí, ${formattedDate.split("/")[0]} de ${currentDate.toLocaleDateString("pt-BR", { month: "long" })} de ${formattedDate.split("/")[2].split(",")[0]}.`,
  ];

  final.forEach((paragraph) => {
    addContent(paragraph, 12);
  });
  addLineBreak(3); // Pula 3 linhas

  const vendedor = [
    `___________________________________________________________`,
    `Vendedor - XXXXXXXXXXXXXXXXXX`,
    `CPF/CNPJ: XXXXXXXXXX/XXXXXX`,
  ];

  vendedor.forEach((paragraph) => {
    addContent(paragraph, 12);
  });
  addLineBreak(3);

  const comprador = [
    `___________________________________________________________`,
    `Comprador - XXXXXXXXXXXXX`,
    `CPF/CNPJ: XXXXXXXXXXXXXXXX`,
  ];

  comprador.forEach((paragraph) => {
    addContent(paragraph, 12);
  });

  // Gera o conteúdo e inicia a impressão como PDF
  generateDocAsPdf(docContent);
};
