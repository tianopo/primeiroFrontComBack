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
        CONTRATO DE RELAÇÃO COMERCIAL, PROMOÇÃO DE VENDAS E<br />
        NEGOCIAÇÃO BILATERAL DE ATIVOS DIGITAIS POR CONTA PRÓPRIA
      </h1>

      <p class="subtitle">
        Instrumento particular de relação comercial continuada para condições presentes e futuras
      </p>

      <p class="intro">
        Pelo presente instrumento particular, na melhor forma de direito, as partes abaixo
        qualificadas ajustam o presente Contrato de Relação Comercial, Promoção de Vendas e
        Negociação Bilateral de Ativos Digitais por Conta Própria, que regerá as relações
        comerciais mantidas diretamente entre as partes, incluindo divulgação e apresentação de
        ofertas próprias da CRYPTOTECH e, quando aplicável, operações bilaterais realizadas pela
        CRYPTOTECH exclusivamente em nome próprio e por conta própria.
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
        <h2>DADOS CADASTRAIS E OPERACIONAIS DA CONTRATANTE</h2>
        <p><strong>CONTRATANTE:</strong> ${contractingName}</p>
        <p><strong>${documentLabel}:</strong> ${contractingDocument}</p>
        <p><strong>Carteira/Plataforma cadastrada:</strong> ${text(service.wallet)}</p>
        <p><strong>Rede blockchain autorizada:</strong> ${text(service.blockchain)}</p>
        <p><strong>Endereço cadastrado:</strong> ${text(service.enderecoCadastrado)}</p>
        <p>
          Os dados acima poderão ser utilizados para identificação da CONTRATANTE,
          validação cadastral, segurança operacional e cumprimento das condições
          comerciais diretamente acordadas entre as partes. A utilização de endereço,
          plataforma ou rede diversa dependerá de novo cadastro, nova validação ou
          formalização documental aceita pela CRYPTOTECH.
        </p>
      </div>

      <section class="clause">
        <h2>1. DO OBJETO, NATUREZA E ALCANCE DO CONTRATO</h2>

        <p>
          1.1. O presente contrato tem por objeto disciplinar a relação comercial entre as
          partes, incluindo ações de promoção de vendas, divulgação e apresentação de ofertas
          próprias da CRYPTOTECH, bem como, quando aplicável, negociações bilaterais realizadas
          diretamente entre a CONTRATANTE e a CRYPTOTECH.
        </p>

        <p>
          1.2. Nas negociações bilaterais abrangidas por este instrumento, a CRYPTOTECH atua
          exclusivamente em nome próprio e por conta própria, utilizando recursos e ativos de
          sua própria titularidade e assumindo diretamente a posição contratual correspondente.
        </p>

        <p>
          1.3. A CRYPTOTECH não recebe recursos ou ativos da CONTRATANTE com a finalidade de
          administrá-los, investi-los, custodiá-los ou executar operações em nome ou por conta
          da CONTRATANTE perante terceiros. A CRYPTOTECH também não atua como mandatária,
          representante, corretora ou agente da CONTRATANTE perante terceiros no âmbito deste
          contrato.
        </p>

        <p>
          1.4. As partes reconhecem que este instrumento possui natureza continuada. Uma vez
          assinado, poderá servir como base jurídica e operacional para relações comerciais
          futuras, desde que cada condição comercial seja aceita pelas partes e respeite os
          critérios cadastrais, documentais, operacionais, de segurança e de compliance vigentes.
        </p>

        <p>
          1.5. Cada relação comercial poderá ser registrada por meios eletrônicos, sistema
          próprio, plataforma utilizada pelas partes, aplicativo de mensagens, comprovante,
          registro interno, confirmação por escrito ou outro meio idôneo capaz de demonstrar
          as condições acordadas e a manifestação de vontade das partes.
        </p>

        <p>
          1.6. Este contrato não constitui administração de carteira, gestão de recursos de
          terceiros, custódia de ativos por conta da CONTRATANTE, mandato, representação,
          consultoria financeira, recomendação de investimento ou promessa de rentabilidade.
        </p>
      </section>

      <section class="clause">
        <h2>2. DAS OFERTAS E CONDIÇÕES COMERCIAIS</h2>

        <p>
          2.1. A CRYPTOTECH poderá divulgar, apresentar ou disponibilizar suas próprias ofertas
          comerciais, inclusive por meio de canais digitais, sistemas próprios ou plataformas
          utilizadas pelas partes. A apresentação de uma oferta não obriga sua aceitação nem
          garante disponibilidade permanente de preço, quantidade ou ativo.
        </p>

        <p>
          2.2. Valores, quantidades, ativo digital, sentido econômico da relação comercial,
          preço, taxa de conversão, forma de pagamento, prazo, rede e demais condições serão
          definidos individualmente em cada negociação bilateral e não integram este instrumento
          de forma fixa ou definitiva.
        </p>

        <p>
          2.3. Quando a relação comercial envolver entrega de ativos pela CRYPTOTECH à
          CONTRATANTE, a entrega somente será devida após a confirmação efetiva do pagamento,
          da titularidade da origem dos recursos e das validações cadastrais, operacionais e de
          compliance aplicáveis.
        </p>

        <p>
          2.4. Quando a relação comercial envolver entrega de ativos pela CONTRATANTE à
          CRYPTOTECH, o pagamento correspondente somente será devido após a confirmação do
          efetivo recebimento e disponibilidade dos ativos no destino informado pela CRYPTOTECH,
          além das validações operacionais e de compliance aplicáveis.
        </p>

        <p>
          2.5. As partes reconhecem que cada negociação é bilateral e direta. Nenhuma das partes
          fica obrigada a aceitar futuras propostas, manter determinada cotação, garantir
          liquidez, disponibilidade de ativo ou volume mínimo de negociação.
        </p>

        <p>
          2.6. A CRYPTOTECH poderá recusar, suspender, limitar ou cancelar uma tratativa antes
          de sua conclusão quando houver divergência cadastral, indício de fraude, pagamento por
          terceiro, triangulação financeira, MED, contestação bancária, inconsistência em
          KYC/KYB ou outro fator razoável de risco operacional, jurídico ou de compliance.
        </p>
      </section>

      <section class="clause">
        <h2>3. DO CADASTRO, DOCUMENTAÇÃO E COMPLIANCE</h2>

        <p>
          3.1. A CONTRATANTE deverá fornecer documentação suficiente para verificação de
          identidade, titularidade, regularidade e capacidade operacional, incluindo, quando
          aplicável, CPF ou CNPJ, comprovante de endereço, contrato social, documento do
          representante, dados bancários, informações societárias, dados de contato e outras
          evidências razoavelmente solicitadas.
        </p>

        <p>
          3.2. Quando a CONTRATANTE for pessoa física, a assinatura será realizada pelo próprio
          titular do CPF cadastrado. Quando a CONTRATANTE for pessoa jurídica, a assinatura será
          realizada pelo representante indicado neste instrumento, identificado por seu CPF, que
          declara possuir poderes suficientes para a contratação.
        </p>

        <p>
          3.3. A CONTRATANTE declara que todas as informações e documentos fornecidos são
          verdadeiros, completos, atualizados e correspondem à sua realidade jurídica,
          financeira, societária e operacional.
        </p>

        <p>
          3.4. Conforme volume, frequência, perfil de risco, alertas internos, solicitações
          bancárias, políticas de PLD/FT, KYC/KYB, auditoria ou revisão de compliance, a
          CRYPTOTECH poderá solicitar documentos e informações complementares antes ou durante
          a relação comercial.
        </p>

        <p>
          3.5. A ausência, atraso, recusa, inconsistência ou insuficiência documental poderá
          acarretar suspensão, redução de limites, análise manual, recusa de nova relação
          comercial, bloqueio preventivo ou encerramento da relação comercial, observada a
          legislação aplicável.
        </p>
      </section>

      <section class="clause">
        <h2>4. DA TITULARIDADE DOS PAGAMENTOS, VEDAÇÃO A TERCEIROS E ORIGEM DOS RECURSOS</h2>

        <p>
          4.1. Nas relações comerciais em que houver pagamento da CONTRATANTE à CRYPTOTECH,
          os recursos deverão partir exclusivamente de conta bancária de titularidade da própria
          CONTRATANTE, vinculada ao ${documentLabel} <strong>${contractingDocument}</strong>,
          salvo hipótese previamente validada, expressamente documentada e legalmente admitida.
        </p>

        <p>
          4.2. Nas relações comerciais em que houver pagamento da CRYPTOTECH à CONTRATANTE,
          o recebimento deverá ocorrer em conta bancária de titularidade da própria CONTRATANTE,
          vinculada ao mesmo documento cadastrado, salvo hipótese previamente validada,
          expressamente documentada e legalmente admitida.
        </p>

        <p>
          4.3. Fica vedado o uso de contas emprestadas, contas de terceiros não validados,
          contas de clientes de terceiros ou qualquer forma de triangulação financeira que
          impossibilite a identificação da origem, destino ou titularidade dos recursos.
        </p>

        <p>
          4.4. A CONTRATANTE declara que os recursos e ativos utilizados nas relações
          comerciais possuem origem lícita, própria e compatível com sua atividade ou capacidade
          financeira, comprometendo-se a não utilizar a relação comercial para fraude, golpe,
          simulação, lavagem de dinheiro, ocultação patrimonial, evasão de controles ou outra
          finalidade ilícita.
        </p>
      </section>

      <section class="clause">
        <h2>5. DAS CONDIÇÕES OPERACIONAIS PARA ENTREGA E RECEBIMENTO DE ATIVOS</h2>

        <p>
          5.1. Quando a relação comercial envolver entrega de ativos pela CRYPTOTECH à
          CONTRATANTE, a transferência somente poderá ser realizada para a carteira ou plataforma
          <strong>${text(service.wallet)}</strong>, no endereço
          <strong>${text(service.enderecoCadastrado)}</strong>, da rede
          <strong>${text(service.blockchain)}</strong>, vinculados ao
          ${documentLabel} <strong>${contractingDocument}</strong>.
        </p>

        <p>
          5.2. Solicitações de envio para endereço, carteira, plataforma ou rede diferentes dos
          dados cadastrados não serão abrangidas por este contrato até que haja nova validação
          cadastral e confirmação documental aceita pela CRYPTOTECH.
        </p>

        <p>
          5.3. Quando a relação comercial envolver entrega de ativos pela CONTRATANTE à
          CRYPTOTECH, a CONTRATANTE deverá transferi-los para o destino expressamente informado
          pela CRYPTOTECH. O recebimento poderá ocorrer por endereço de carteira em blockchain,
          transferência interna entre contas de plataforma ou outro método tecnicamente adequado,
          documentado e previamente aceito pelas partes.
        </p>

        <p>
          5.4. A entrega de ativos à CRYPTOTECH somente será considerada concluída após a
          confirmação do efetivo recebimento e da disponibilidade dos ativos na rede, plataforma
          ou método indicado para aquela relação comercial.
        </p>

        <p>
          5.5. A CONTRATANTE é responsável por informar corretamente e manter sob seu controle
          os dados de carteira utilizados para recebimento de ativos, bem como por conferir os
          dados de destino informados pela CRYPTOTECH antes de qualquer transferência.
        </p>

        <p>
          5.6. Confirmada a transferência em blockchain ou no sistema da plataforma aplicável,
          a obrigação de entrega será considerada cumprida pela parte remetente, ressalvadas
          falhas comprovadamente imputáveis a ela.
        </p>

        <p>
          5.7. A CRYPTOTECH não mantém, por força deste contrato, saldo de ativos da CONTRATANTE
          sob administração ou custódia continuada. Os ativos eventualmente recebidos pela
          CRYPTOTECH decorrem da própria relação bilateral em que ela figura como parte e passam
          a integrar seu patrimônio após a conclusão da operação, observadas as condições
          aplicáveis.
        </p>
      </section>

      <section class="clause">
        <h2>6. DOS RISCOS DOS ATIVOS DIGITAIS E AUSÊNCIA DE GARANTIA DE VALOR</h2>

        <p>
          6.1. A CONTRATANTE reconhece que ativos digitais podem sofrer volatilidade, variação
          de liquidez e cotação, falhas de rede, congestionamento, atrasos de confirmação,
          alterações de protocolo, congelamento por plataformas terceiras, forks,
          indisponibilidades e outros riscos tecnológicos ou de mercado.
        </p>

        <p>
          6.2. A CRYPTOTECH não garante valorização, rentabilidade, liquidez futura,
          estabilidade de preço, recuperação de ativos, reversão de transações em blockchain ou
          sucesso econômico decorrente das decisões comerciais da CONTRATANTE.
        </p>

        <p>
          6.3. A CONTRATANTE declara que decide participar de cada relação comercial por sua
          própria iniciativa, após avaliar as condições apresentadas, sem promessa de retorno,
          recomendação de investimento ou aconselhamento financeiro pela CRYPTOTECH.
        </p>
      </section>

      <section class="clause">
        <h2>7. DA SUSPENSÃO, RECUSA OU INTERRUPÇÃO DAS RELAÇÕES COMERCIAIS</h2>

        <p>
          7.1. A CRYPTOTECH poderá recusar, suspender ou interromper qualquer relação comercial,
          ainda que exista tratativa prévia, quando identificar ou suspeitar de fraude, golpe,
          pagamento por terceiro, triangulação, uso indevido de conta bancária, divergência
          documental, contestação, MED, chargeback, bloqueio judicial, origem suspeita de
          recursos ou ativos, determinação de autoridade competente, comunicação bancária,
          risco reputacional ou incompatibilidade com política interna de risco.
        </p>

        <p>
          7.2. A suspensão poderá permanecer até que a CONTRATANTE apresente documentos e
          esclarecimentos suficientes para a mitigação do risco ou até que a situação seja
          solucionada pelos meios adequados.
        </p>

        <p>
          7.3. A CRYPTOTECH não será obrigada a concluir relação comercial que, por critério
          razoável e documentado, represente risco de fraude, ilicitude, descumprimento
          regulatório, dano reputacional ou prejuízo financeiro.
        </p>

        <p>
          7.4. A CRYPTOTECH poderá encerrar a relação comercial ou recusar novas tratativas
          quando sua continuidade representar risco operacional, bancário, jurídico,
          regulatório, de compliance ou reputacional.
        </p>
      </section>

      <section class="clause">
        <h2>8. DA RESPONSABILIDADE DA CONTRATANTE E DO DEVER DE INDENIZAR</h2>

        <p>
          8.1. A CONTRATANTE responderá por prejuízos, custos, bloqueios, multas, reclamações,
          MEDs, chargebacks, honorários, danos reputacionais ou despesas causados por informações
          falsas, pagamento por terceiro, triangulação, fraude, envio de ativos de origem
          irregular, uso indevido dos ativos, descumprimento deste contrato ou violação de normas
          aplicáveis.
        </p>

        <p>
          8.2. A CONTRATANTE deverá indenizar e manter indene a CRYPTOTECH, seus sócios,
          representantes e colaboradores contra perdas decorrentes de atos, omissões,
          declarações, documentos, pagamentos ou ativos irregulares atribuíveis à CONTRATANTE ou
          a terceiros por ela envolvidos, observados os limites previstos na legislação aplicável.
        </p>

        <p>
          8.3. A CRYPTOTECH não responderá por atos praticados pela CONTRATANTE após o regular
          recebimento dos ativos ou valores que lhe forem entregues, incluindo transferências a
          terceiros, golpes, promessas fraudulentas, esquemas financeiros ou perdas decorrentes
          de decisões tomadas pela própria CONTRATANTE.
        </p>
      </section>

      <section class="clause">
        <h2>9. DOS DADOS PESSOAIS, REGISTROS E AUDITORIA</h2>

        <p>
          9.1. A CONTRATANTE declara ciência de que a CRYPTOTECH poderá coletar, armazenar,
          tratar e consultar dados cadastrais, societários, bancários, operacionais e documentos
          necessários à execução deste contrato, prevenção a fraudes, cumprimento de obrigações
          legais, defesa de direitos, verificação de identidade e procedimentos de compliance,
          nos termos da legislação aplicável.
        </p>

        <p>
          9.2. A CRYPTOTECH poderá manter registros das relações comerciais, comprovantes,
          conversas, documentos, endereços de carteira, hashes, dados bancários, protocolos e
          evidências de cumprimento contratual pelo prazo necessário à defesa de direitos,
          auditoria, prevenção a fraudes e cumprimento de obrigações legais ou regulatórias.
        </p>

        <p>
          9.3. A CONTRATANTE reconhece que registros realizados em redes blockchain podem ser
          verificáveis por terceiros e poderão ser utilizados como evidência da efetiva entrega
          ou recebimento de ativos.
        </p>
      </section>

      <section class="clause">
        <h2>10. DA VIGÊNCIA E DAS RELAÇÕES COMERCIAIS FUTURAS</h2>

        <p>
          10.1. Este contrato vigorará por prazo indeterminado a partir de sua assinatura,
          enquanto houver interesse comercial das partes ou enquanto existirem cadastros,
          análises, pendências documentais ou responsabilidades decorrentes das relações
          comerciais realizadas.
        </p>

        <p>
          10.2. A assinatura deste instrumento permite a realização de relações comerciais
          futuras entre as partes sem a necessidade de assinatura de novo contrato-base para cada
          negociação, desde que as condições específicas de cada relação comercial sejam
          registradas por meios eletrônicos, comprovantes, sistema, mensagens ou documentos
          equivalentes.
        </p>

        <p>
          10.3. Quando houver entrega de ativos pela CRYPTOTECH à CONTRATANTE, a autorização
          continuada para utilização dos dados cadastrados aplica-se exclusivamente ao endereço
          <strong>${text(service.enderecoCadastrado)}</strong>, na rede
          <strong>${text(service.blockchain)}</strong>, vinculado ao
          ${documentLabel} <strong>${contractingDocument}</strong>. A substituição desse endereço
          ou rede exige nova validação e formalização aceita pela CRYPTOTECH.
        </p>

        <p>
          10.4. A CRYPTOTECH poderá atualizar políticas, procedimentos, exigências documentais,
          limites e condições operacionais para relações comerciais futuras, especialmente por
          motivos de segurança, compliance, revisão de risco ou exigências bancárias, legais,
          regulatórias ou operacionais.
        </p>
      </section>

      <section class="clause">
        <h2>11. DA ASSINATURA ELETRÔNICA, GOV.BR E PROVA DAS RELAÇÕES COMERCIAIS</h2>

        <p>
          11.1. As partes reconhecem a validade da assinatura eletrônica ou digital deste
          contrato, especialmente quando realizada por meio da plataforma Gov.br ou outro meio
          eletrônico idôneo, conforme legislação aplicável, incluindo a Lei nº 14.063/2020 e
          normas correlatas.
        </p>

        <p>
          11.2. O presente contrato será assinado preferencialmente por meio da plataforma
          Gov.br, com autenticação do signatário e registro eletrônico da manifestação de vontade,
          dispensando assinatura física, reconhecimento de firma, rubrica em todas as páginas ou
          presença física das partes, salvo exigência legal específica.
        </p>

        <p>
          11.3. Mensagens, comprovantes de pagamento, registros de sistema ou plataforma,
          identificadores de operação ou registro comercial, hashes de blockchain, extratos
          bancários, recibos, logs internos e demais evidências digitais poderão ser utilizados
          como prova da contratação, das condições comerciais aceitas, da entrega ou recebimento
          de ativos e do cumprimento das obrigações assumidas pelas partes.
        </p>
      </section>

      <section class="clause">
        <h2>12. DAS DISPOSIÇÕES GERAIS</h2>

        <p>
          12.1. Este contrato é celebrado de boa-fé, obrigando as partes e seus sucessores, na
          forma da legislação aplicável.
        </p>

        <p>
          12.2. A eventual tolerância de uma parte quanto ao descumprimento de obrigação não
          implicará renúncia de direito, novação ou alteração contratual.
        </p>

        <p>
          12.3. Caso qualquer cláusula seja considerada inválida ou inexequível, as demais
          permanecerão em pleno vigor na extensão permitida pela legislação aplicável.
        </p>

        <p>
          12.4. Este contrato representa o acordo-base entre as partes sobre sua relação
          comercial continuada, incluindo ações de promoção de vendas e apresentação de ofertas
          próprias da CRYPTOTECH, bem como negociações bilaterais em que a CRYPTOTECH figure
          diretamente como parte, exclusivamente em nome próprio e por conta própria.
        </p>

        <p>
          12.5. Nenhuma disposição deste instrumento deverá ser interpretada como autorização
          para a CRYPTOTECH administrar, custodiar ou movimentar patrimônio da CONTRATANTE em
          nome dela perante terceiros. Eventual serviço distinto deste objeto dependerá de
          instrumento próprio e da observância dos requisitos legais e regulatórios aplicáveis.
        </p>

        <p>
          12.6. As partes, de comum acordo, deixam de estabelecer foro de eleição neste
          instrumento. Eventuais controvérsias, se não solucionadas por composição amigável,
          serão submetidas ao juízo competente conforme as regras legais de competência
          aplicáveis, sem renúncia prévia a foro legalmente competente.
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
