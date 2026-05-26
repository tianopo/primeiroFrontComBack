import { IService } from "../../hooks/useServices";
import { generateDocAsPdf } from "../generateDocAsPdf";

const CRYPTOTECH = {
  name: "CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA",
  cnpj: "55.636.113/0001-70",
  address: "Estrada do Limoeiro, 495, Jardim California, Jacareí/SP, CEP 12.305-810",
  representativeName: "Matheus Henrique de Abreu",
  representativeCpf: "338.624.448-30",
  representativeCivilStatus: "casado",
};

const escapeHtml = (value?: string): string =>
  (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const text = (value?: string): string => escapeHtml(value?.trim() || "Não informado");

const formatDocument = (value: string, type: IService["tipoDocumento"]): string => {
  const digits = value.replace(/\D/g, "");

  if (type === "CPF" && digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  if (type === "CNPJ" && digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  return value;
};

const joinAddress = ({ rua, numero, complemento, bairro, cidade, estado, cep }: IService): string =>
  [
    text(rua),
    text(numero),
    complemento?.trim() ? text(complemento) : "",
    text(bairro),
    `${text(cidade)}/${text(estado)}`,
    `CEP ${text(cep)}`,
  ]
    .filter(Boolean)
    .join(", ");

export const services = (service: IService) => {
  const contractingName = text(service.usuario.name);
  const contractingDocument = text(formatDocument(service.usuario.document, service.tipoDocumento));
  const contractingAddress = joinAddress(service);
  const documentLabel = service.tipoDocumento;

  const contractingQualification =
    service.tipoDocumento === "CPF"
      ? `${contractingName}, pessoa física, ${text(
          service.estadoCivil,
        )}, inscrita no CPF/MF sob nº ${contractingDocument}, residente e domiciliada em ${contractingAddress}, doravante denominada simplesmente <strong>CONTRATANTE</strong>.`
      : `${contractingName}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob nº ${contractingDocument}, com sede em ${contractingAddress}, neste ato representada por ${text(
          service.responsavelNome,
        )}, ${text(service.responsavelEstadoCivil)}, ${
          service.responsavelCargo?.trim()
            ? `na qualidade de ${text(service.responsavelCargo)}, `
            : ""
        }inscrito(a) no CPF/MF sob nº ${text(
          formatDocument(service.responsavelCpf ?? "", "CPF"),
        )}, doravante denominada simplesmente <strong>CONTRATANTE</strong>.`;

  const contractingSignature =
    service.tipoDocumento === "CPF"
      ? `
        <p class="signature-line">___________________________________________________________</p>
        <p><strong>CONTRATANTE</strong></p>
        <p>${contractingName}</p>
        <p>CPF: ${contractingDocument}</p>
      `
      : `
        <p class="signature-line">___________________________________________________________</p>
        <p><strong>CONTRATANTE</strong></p>
        <p>${contractingName}</p>
        <p>CNPJ: ${contractingDocument}</p>
        <p>Representada por: ${text(service.responsavelNome)}</p>
        <p>CPF do representante: ${text(formatDocument(service.responsavelCpf ?? "", "CPF"))}</p>
      `;

  const currentDate = new Date();
  const fullDate = currentDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const docContent = `
    <style>
      .contract {
        color: #111;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11.5pt;
        line-height: 1.35;
      }

      .contract h1 {
        font-size: 16pt;
        line-height: 1.25;
        margin: 0 0 6px;
        text-align: center;
      }

      .contract .subtitle {
        font-size: 10.5pt;
        font-style: italic;
        margin: 0 0 20px;
        text-align: center;
      }

      .contract .intro {
        margin: 0 0 14px;
        text-align: justify;
      }

      .contract table {
        border-collapse: collapse;
        margin: 0 0 20px;
        table-layout: fixed;
        width: 100%;
      }

      .contract th,
      .contract td {
        border: 1px solid #222;
        padding: 7px;
        text-align: left;
        vertical-align: top;
        width: 50%;
      }

      .contract th {
        font-size: 10.5pt;
      }

      .contract .binding-box {
        background: #f5f7fb;
        border: 1px solid #222;
        margin: 0 0 20px;
        padding: 10px;
      }

      .contract .binding-box h2 {
        font-size: 12pt;
        margin: 0 0 7px;
      }

      .contract .binding-box p {
        margin: 4px 0;
      }

      .contract .clause {
        page-break-inside: auto;
      }

      .contract .clause h2 {
        font-size: 12pt;
        margin: 17px 0 8px;
      }

      .contract .clause p {
        margin: 0 0 7px;
        text-align: justify;
      }

      .contract .signature-area {
        margin-top: 30px;
        page-break-inside: avoid;
      }

      .contract .signature {
        margin-top: 45px;
      }

      .contract .signature p {
        margin: 3px 0;
      }

      .contract .signature-line {
        margin-bottom: 5px;
      }
    </style>

    <div class="contract">
      <h1>
        CONTRATO DE PRESTAÇÃO DE SERVIÇOS COMERCIAIS, COMPRA, VENDA E
        TRANSFERÊNCIA RECORRENTE DE ATIVOS DIGITAIS
      </h1>
      <p class="subtitle">
        Instrumento particular – relação continuada para ordens presentes e futuras
      </p>

      <p class="intro">
        Pelo presente instrumento particular, na melhor forma de direito, as partes
        abaixo qualificadas ajustam o presente Contrato de Prestação de Serviços
        Comerciais, Compra, Venda e Transferência Recorrente de Ativos Digitais,
        que regerá as operações atuais e futuras de compra, venda, disponibilização
        e transferência de ativos digitais realizadas entre as partes.
      </p>

      <table>
        <thead>
          <tr>
            <th>CONTRATANTE</th>
            <th>CONTRATADA / CRYPTOTECH</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${contractingQualification}</td>
            <td>
              ${CRYPTOTECH.name}, pessoa jurídica de direito privado, com sede em
              ${CRYPTOTECH.address}, inscrita no CNPJ/MF sob nº ${CRYPTOTECH.cnpj},
              neste ato representada por ${CRYPTOTECH.representativeName}, brasileiro,
              ${CRYPTOTECH.representativeCivilStatus}, inscrito no CPF/MF sob nº
              ${CRYPTOTECH.representativeCpf}, doravante denominada
              <strong>CONTRATADA</strong> ou <strong>CRYPTOTECH</strong>.
            </td>
          </tr>
        </tbody>
      </table>

      <div class="binding-box">
        <h2>DADOS VINCULADOS AO DOCUMENTO DA CONTRATANTE PARA RECEBIMENTO DE ATIVOS</h2>
        <p><strong>CONTRATANTE:</strong> ${contractingName}</p>
        <p><strong>${documentLabel}:</strong> ${contractingDocument}</p>
        <p><strong>Carteira/Corretora cadastrada:</strong> ${text(service.wallet)}</p>
        <p><strong>Rede blockchain autorizada:</strong> ${text(service.blockchain)}</p>
        <p><strong>Endereço cadastrado:</strong> ${text(service.enderecoCadastrado)}</p>
        <p>
          Este vínculo aplica-se exclusivamente às operações em que a CONTRATANTE
          comprar ativos da CRYPTOTECH. O envio para endereço ou rede diversa
          dependerá de novo cadastro, nova validação ou aditamento formal.
        </p>
      </div>

      <section class="clause">
        <h2>1. DO OBJETO, NATUREZA E ALCANCE DO CONTRATO</h2>
        <p>
          1.1. O presente contrato tem por objeto a prestação, pela CRYPTOTECH, de
          serviços comerciais relacionados à negociação, compra, venda,
          disponibilização operacional, conferência de titularidade, validação de
          compliance, confirmação de pagamento, recebimento e transferência de
          ativos digitais com a CONTRATANTE, conforme ordens específicas celebradas
          entre as partes.
        </p>
        <p>
          1.2. As partes reconhecem que este instrumento não se limita a uma única
          operação. Uma vez assinado, servirá como base jurídica e operacional para
          múltiplas compras ou vendas futuras de ativos digitais pela CONTRATANTE,
          desde que cada ordem seja aceita pela CRYPTOTECH e respeite os critérios
          comerciais, documentais, operacionais, cadastrais e de compliance vigentes.
        </p>
        <p>
          1.3. Cada operação futura poderá ser formalizada por meios eletrônicos,
          sistemas de negociação, plataformas P2P, aplicativos de mensagens,
          comprovantes, registros internos, confirmações por escrito ou outro meio
          apto a demonstrar a intenção das partes, sendo tais elementos considerados
          anexos operacionais deste contrato.
        </p>
        <p>
          1.4. Este contrato não constitui promessa obrigatória de compra ou venda,
          conta corrente, garantia de cotação, financiamento, consultoria financeira,
          gestão de recursos de terceiros, recomendação de investimento ou captação
          pública de valores.
        </p>
        <p>
          1.5. Nas operações em que a CONTRATANTE comprar ativos digitais, a validade
          operacional do presente contrato fica restrita ao endereço e à rede
          blockchain constantes do quadro de vinculação, associados ao documento da
          CONTRATANTE.
        </p>
      </section>

      <section class="clause">
        <h2>2. DAS ORDENS, PREÇOS E CONDIÇÕES COMERCIAIS FUTURAS</h2>
        <p>
          2.1. Valores, quantidades, ativo digital, sentido da operação — compra ou
          venda pela CONTRATANTE —, taxa de conversão, forma de pagamento, prazo e
          demais dados econômicos serão definidos individualmente em cada ordem ou
          negociação, não integrando este instrumento de forma fixa ou definitiva.
        </p>
        <p>
          2.2. A ausência de valores e quantidades neste contrato é intencional, pois
          este instrumento tem natureza continuada e servirá para respaldar operações
          futuras de compra e venda de ativos digitais entre as partes.
        </p>
        <p>
          2.3. Quando a CONTRATANTE comprar ativos, a CRYPTOTECH somente terá
          obrigação de transferi-los após confirmação efetiva, regular, líquida,
          identificável e aprovada do pagamento, bem como aprovação da operação sob
          seus critérios de compliance e segurança.
        </p>
        <p>
          2.4. Quando a CONTRATANTE vender ativos, a CRYPTOTECH somente terá
          obrigação de efetuar o pagamento correspondente após o recebimento
          confirmado dos ativos no destino indicado para a ordem e após as
          validações operacionais e de compliance aplicáveis.
        </p>
        <p>
          2.5. A CRYPTOTECH poderá recusar, suspender, ajustar limites, condicionar
          ou cancelar uma ordem antes de sua conclusão quando houver divergência
          cadastral, indício de fraude, tentativa de golpe, pagamento por terceiro,
          triangulação, MED, contestação bancária, inconsistências em KYC/KYB ou
          outro fator razoável de risco operacional.
        </p>
      </section>

      <section class="clause">
        <h2>3. DO CADASTRO, DOCUMENTAÇÃO INICIAL E COMPLIANCE PROGRESSIVO</h2>
        <p>
          3.1. A CONTRATANTE deverá fornecer documentação inicial para verificação
          de identidade, titularidade, regularidade e capacidade de operação,
          incluindo, quando aplicável, CPF ou CNPJ, comprovante de endereço,
          contrato social, documento do representante, dados bancários, informações
          societárias, dados de contato e outras evidências razoavelmente solicitadas.
        </p>
        <p>
          3.2. Quando a CONTRATANTE for pessoa física, a assinatura será realizada
          pelo próprio titular do CPF cadastrado. Quando a CONTRATANTE for pessoa
          jurídica, a assinatura será realizada pelo representante indicado neste
          instrumento, identificado por seu CPF, que declara possuir poderes para a
          contratação.
        </p>
        <p>
          3.3. A CONTRATANTE declara que as informações e documentos fornecidos são
          verdadeiros, completos, atualizados e correspondem à sua realidade jurídica,
          financeira, societária e operacional.
        </p>
        <p>
          3.4. Conforme volume, frequência, perfil de risco, alertas internos,
          solicitações bancárias, políticas de PLD/FT, KYC/KYB, auditoria ou revisão
          de compliance, a CRYPTOTECH poderá solicitar documentos e informações
          complementares.
        </p>
        <p>
          3.5. A ausência, atraso, recusa, inconsistência ou insuficiência documental
          poderá acarretar suspensão, redução de limites, análise manual, cancelamento
          de ordens, bloqueio preventivo ou encerramento da relação comercial.
        </p>
      </section>

      <section class="clause">
        <h2>4. DA TITULARIDADE DOS PAGAMENTOS, VEDAÇÃO A TERCEIROS E ORIGEM DOS RECURSOS</h2>
        <p>
          4.1. Quando a CONTRATANTE comprar ativos, os pagamentos devidos à
          CRYPTOTECH deverão partir exclusivamente de conta bancária de titularidade
          da própria CONTRATANTE, vinculada ao ${documentLabel} ${contractingDocument},
          salvo autorização prévia, expressa e documentada da CRYPTOTECH.
        </p>
        <p>
          4.2. Quando a CONTRATANTE vender ativos e houver pagamento pela
          CRYPTOTECH, o recebimento deverá ocorrer em conta de titularidade da própria
          CONTRATANTE, vinculada ao mesmo documento cadastrado, salvo validação
          prévia, expressa e documentada.
        </p>
        <p>
          4.3. Fica vedado o uso de contas de terceiros, intermediários não
          cadastrados, contas emprestadas, contas de clientes ou qualquer forma de
          triangulação financeira nas ordens vinculadas a este contrato.
        </p>
        <p>
          4.4. A CONTRATANTE declara que os recursos e ativos utilizados nas
          operações possuem origem lícita, própria e compatível com sua atividade ou
          capacidade financeira, comprometendo-se a não utilizar a relação comercial
          para fraude, golpe, simulação, lavagem de dinheiro, ocultação patrimonial,
          evasão de controles ou outra finalidade ilícita.
        </p>
      </section>

      <section class="clause">
        <h2>5. DA TRANSFERÊNCIA DOS ATIVOS DIGITAIS E DO ENDEREÇO VINCULADO</h2>
        <p>
          5.1. Nas operações em que a CONTRATANTE comprar ativos da CRYPTOTECH, a
          transferência somente poderá ser realizada para a carteira ou corretora
          <strong>${text(service.wallet)}</strong>, no endereço
          <strong>${text(service.enderecoCadastrado)}</strong>, da rede
          <strong>${text(service.blockchain)}</strong>, vinculados ao
          ${documentLabel} <strong>${contractingDocument}</strong>.
        </p>
        <p>
          5.2. Solicitações de envio para endereço, carteira, corretora ou rede
          diferentes daquelas cadastradas não serão abrangidas por este contrato até
          que haja nova validação cadastral e formalização documental aceita pela
          CRYPTOTECH.
        </p>
        <p>
          5.3. Nas operações em que a CONTRATANTE vender ativos à CRYPTOTECH, a
          CONTRATANTE deverá enviar os ativos antes do recebimento do pagamento para
          o destino expressamente informado pela CRYPTOTECH na respectiva ordem. O
          recebimento poderá ocorrer por endereço de carteira em blockchain,
          transferência interna entre contas de corretora, transferência em ambiente
          P2P ou outro método documentado e aceito pelas partes.
        </p>
        <p>
          5.4. Em vendas realizadas pela CONTRATANTE, a operação somente será
          considerada entregue após a confirmação do efetivo recebimento e da
          disponibilidade dos ativos pela CRYPTOTECH, na rede, plataforma ou método
          indicado na ordem.
        </p>
        <p>
          5.5. A CONTRATANTE é integralmente responsável por informar corretamente e
          manter sob seu controle o endereço cadastrado para recebimento de ativos,
          bem como por conferir os dados de destino informados pela CRYPTOTECH antes
          de efetuar uma venda.
        </p>
        <p>
          5.6. Confirmada a transferência em blockchain ou no sistema de
          custódia/plataforma aplicável, a obrigação de transferência será considerada
          cumprida pela parte remetente, ressalvadas falhas comprovadamente
          imputáveis a ela.
        </p>
      </section>

      <section class="clause">
        <h2>6. DOS RISCOS DOS ATIVOS DIGITAIS E AUSÊNCIA DE GARANTIA DE VALOR</h2>
        <p>
          6.1. A CONTRATANTE reconhece que ativos digitais podem sofrer volatilidade,
          variação de liquidez e cotação, falhas de rede, congestionamento, atrasos
          de confirmação, alterações de protocolo, congelamento por plataformas
          terceiras, forks, indisponibilidades e riscos tecnológicos.
        </p>
        <p>
          6.2. A CRYPTOTECH não garante valorização, rentabilidade, liquidez futura,
          estabilidade de preço, recuperação de ativos, reversão de transações em
          blockchain ou sucesso econômico de operação realizada pela CONTRATANTE.
        </p>
        <p>
          6.3. A CONTRATANTE declara que decide comprar ou vender ativos por sua
          própria iniciativa, sem promessa de retorno, recomendação de investimento
          ou aconselhamento financeiro pela CRYPTOTECH.
        </p>
      </section>

      <section class="clause">
        <h2>7. DA SUSPENSÃO, RECUSA OU INTERRUPÇÃO DAS OPERAÇÕES</h2>
        <p>
          7.1. A CRYPTOTECH poderá deixar de comprar, vender, fornecer, transferir
          ou disponibilizar ativos, ainda que exista tratativa prévia, quando
          identificar ou suspeitar de fraude, golpe, pagamento por terceiro,
          triangulação, uso indevido de conta bancária, divergência documental,
          contestação, MED, chargeback, bloqueio judicial, origem suspeita de
          recursos ou ativos, ordem de autoridade, comunicação bancária, risco
          reputacional ou incompatibilidade com política interna de risco.
        </p>
        <p>
          7.2. A suspensão poderá permanecer até que a CONTRATANTE apresente
          documentos e esclarecimentos suficientes para a mitigação do risco.
        </p>
        <p>
          7.3. A CRYPTOTECH não será obrigada a concluir operação que, por critério
          razoável e documentado, represente risco de fraude, ilicitude,
          descumprimento regulatório, dano reputacional ou prejuízo financeiro.
        </p>
        <p>
          7.4. A CRYPTOTECH poderá encerrar a relação comercial ou recusar novas
          ordens quando sua continuidade representar risco operacional, bancário,
          jurídico, regulatório ou reputacional.
        </p>
      </section>

      <section class="clause">
        <h2>8. DA RESPONSABILIDADE DA CONTRATANTE E DO DEVER DE INDENIZAR</h2>
        <p>
          8.1. A CONTRATANTE responderá por prejuízos, custos, bloqueios, multas,
          reclamações, MEDs, chargebacks, honorários, danos reputacionais ou despesas
          causados por informações falsas, pagamento por terceiro, triangulação,
          fraude, envio de ativos de origem irregular, uso indevido dos ativos,
          descumprimento deste contrato ou violação de normas aplicáveis.
        </p>
        <p>
          8.2. A CONTRATANTE deverá indenizar e manter indene a CRYPTOTECH, seus
          sócios, representantes e colaboradores contra perdas decorrentes de atos,
          omissões, declarações, documentos, pagamentos ou ativos irregulares
          atribuíveis à CONTRATANTE ou a terceiros por ela envolvidos.
        </p>
        <p>
          8.3. A CRYPTOTECH não responderá por atos praticados pela CONTRATANTE após
          o recebimento dos ativos ou valores regularmente transferidos, incluindo
          transferências a terceiros, golpes, promessas fraudulentas, esquemas
          financeiros ou perdas decorrentes de suas próprias decisões.
        </p>
      </section>

      <section class="clause">
        <h2>9. DOS DADOS PESSOAIS, REGISTROS E AUDITORIA</h2>
        <p>
          9.1. A CONTRATANTE declara ciência de que a CRYPTOTECH poderá coletar,
          armazenar, tratar e consultar dados cadastrais, societários, bancários,
          operacionais e documentos necessários à execução deste contrato, prevenção
          a fraudes, cumprimento de obrigações legais, defesa de direitos,
          verificação de identidade e procedimentos de compliance, nos termos da
          legislação aplicável.
        </p>
        <p>
          9.2. A CRYPTOTECH poderá manter registros de negociações, comprovantes,
          conversas, documentos, endereços de carteira, hashes, dados bancários,
          protocolos e evidências de cumprimento contratual pelo prazo necessário à
          defesa de direitos, auditoria, prevenção a fraudes e cumprimento de
          obrigações legais ou regulatórias.
        </p>
        <p>
          9.3. A CONTRATANTE reconhece que registros de blockchain podem ser
          verificáveis por terceiros e poderão ser utilizados como meio de prova do
          cumprimento da transferência de ativos digitais.
        </p>
      </section>

      <section class="clause">
        <h2>10. DA VIGÊNCIA, ORDENS FUTURAS E DO VÍNCULO COM O ENDEREÇO CADASTRADO</h2>
        <p>
          10.1. Este contrato vigorará por prazo indeterminado, a partir de sua
          assinatura, enquanto houver interesse comercial das partes ou enquanto
          existirem ordens, cadastros, análises, pendências documentais ou
          responsabilidades decorrentes das operações realizadas.
        </p>
        <p>
          10.2. A assinatura deste instrumento permite operações futuras de compra
          ou venda pela CONTRATANTE sem assinatura de novo contrato para cada ordem,
          desde que as condições de cada operação sejam registradas por meios
          eletrônicos, comprovantes, plataforma, mensagens ou documentos equivalentes.
        </p>
        <p>
          10.3. A autorização continuada para a CONTRATANTE receber ativos aplica-se
          exclusivamente ao endereço <strong>${text(service.enderecoCadastrado)}</strong>
          na rede <strong>${text(service.blockchain)}</strong>, vinculado ao
          ${documentLabel} <strong>${contractingDocument}</strong>. A substituição
          desse endereço ou rede exige nova validação e formalização aceita pela
          CRYPTOTECH.
        </p>
        <p>
          10.4. A CRYPTOTECH poderá atualizar políticas, procedimentos, exigências
          documentais, limites e condições operacionais para operações futuras,
          especialmente por segurança, compliance, revisão de risco ou exigências
          bancárias, regulatórias ou operacionais.
        </p>
      </section>

      <section class="clause">
        <h2>11. DA ASSINATURA ELETRÔNICA, GOV.BR E PROVA DAS OPERAÇÕES</h2>
        <p>
          11.1. As partes reconhecem a validade da assinatura eletrônica ou digital
          deste contrato, especialmente quando realizada por meio da plataforma
          Gov.br ou outro meio eletrônico idôneo, conforme legislação aplicável,
          incluindo a Lei nº 14.063/2020 e normas correlatas.
        </p>
        <p>
          11.2. O presente contrato será assinado preferencialmente por meio da
          plataforma Gov.br, com autenticação do signatário e registro eletrônico da
          manifestação de vontade, dispensando assinatura física, reconhecimento de
          firma, rubrica em todas as páginas ou presença física das partes, salvo
          exigência legal específica.
        </p>
        <p>
          11.3. Mensagens, comprovantes de pagamento, registros de plataforma,
          identificadores de ordem, hashes de blockchain, extratos bancários, recibos,
          logs internos e demais evidências digitais poderão ser utilizados como prova
          da contratação, execução, aceite das condições comerciais, transferência de
          ativos e cumprimento das obrigações assumidas pelas partes.
        </p>
      </section>

      <section class="clause">
        <h2>12. DAS DISPOSIÇÕES GERAIS</h2>
        <p>
          12.1. Este contrato é celebrado de boa-fé, obrigando as partes, seus
          sucessores e cessionários permitidos.
        </p>
        <p>
          12.2. A eventual tolerância de uma parte quanto ao descumprimento de
          obrigação não implicará renúncia de direito, novação ou alteração contratual.
        </p>
        <p>
          12.3. Caso qualquer cláusula seja considerada inválida ou inexequível, as
          demais permanecerão em pleno vigor.
        </p>
        <p>
          12.4. Este contrato representa o acordo integral entre as partes sobre a
          relação continuada de compra, venda e transferência de ativos digitais,
          substituindo entendimentos anteriores incompatíveis com seus termos.
        </p>
        <p>
          12.5. As partes, de comum acordo, deixam de estabelecer foro de eleição
          neste instrumento. Eventuais controvérsias, se não solucionadas por
          composição amigável, serão submetidas ao juízo competente conforme as
          regras legais de competência aplicáveis, sem renúncia prévia a foro
          legalmente competente.
        </p>
      </section>

      <div class="signature-area">
        <p>Jacareí, ${text(fullDate)}.</p>

        <div class="signature">
          <p class="signature-line">___________________________________________________________</p>
          <p><strong>CONTRATADA / CRYPTOTECH</strong></p>
          <p>${CRYPTOTECH.name}</p>
          <p>CNPJ: ${CRYPTOTECH.cnpj}</p>
        </div>

        <div class="signature">
          ${contractingSignature}
        </div>
      </div>
    </div>
  `;

  generateDocAsPdf(docContent);
};
