import { generateDocAsPdf } from "src/pages/Contracts/config/generateDocAsPdf";

const esc = (v: any) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const safe = (v: any, fallback = "-") => (v === null || v === undefined || v === "" ? fallback : v);

const clean = (v: any) =>
  String(v ?? "")
    .replace(/"/g, "")
    .trim();

const isFilled = (v: any) => {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") {
    const s = v.trim();
    return s !== "" && s !== "-" && s !== "N/A" && s !== "-0-";
  }
  if (Array.isArray(v)) return v.length > 0;
  return true;
};

const prettyJson = (obj: any) => esc(JSON.stringify(obj ?? {}, null, 2));

const section = (title: string, html: string) => `
  <div style="margin-top:14px; padding:10px; border:1px solid #e5e5e5; border-radius:8px;">
    <h3 style="margin:0 0 8px 0;">${esc(title)}</h3>
    ${html}
  </div>
`;

const kv = (label: string, value: any) => `
  <div style="display:flex; gap:6px; margin:2px 0;">
    <strong>${esc(label)}:</strong>
    <span>${esc(safe(value))}</span>
  </div>
`;

// quando o value é HTML pronto (ex: link)
const kvHtml = (label: string, htmlValue: string) => `
  <div style="display:flex; gap:6px; margin:2px 0;">
    <strong>${esc(label)}:</strong>
    <span>${htmlValue}</span>
  </div>
`;

const kvIf = (label: string, value: any, map?: (v: any) => any) =>
  isFilled(value) ? kv(label, map ? map(value) : value) : "";

const list = (items: string[]) =>
  items.length
    ? `<ul style="margin:6px 0 0 18px;">${items.map((x) => `<li>${x}</li>`).join("")}</ul>`
    : `<p>-</p>`;

const fmtDate = (s?: string) => {
  if (!s) return "-";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? String(s) : d.toLocaleString("pt-BR");
};

const money = (n: any) => (typeof n === "number" ? `R$ ${n.toFixed(2)}` : safe(n));

const joinArr = (arr: any, map: (x: any) => string, sep = ", ") =>
  Array.isArray(arr) && arr.length ? arr.map(map).filter(Boolean).join(sep) : "";

export const generateComplianceDoc = (responseData: any) => {
  const nome = safe(responseData?.pdt?.cpf?.nome, "");
  const nis = responseData?.pdt?.cpf?.nis;

  const desk = responseData?.deskdata;

  const rel = desk?.companyRelationships?.data?.relationships;
  const relItems: any[] = rel?.items ?? [];

  const lawsuits = desk?.personLawsuits?.data?.lawsuits;
  const lawsuitItems: any[] = lawsuits?.items ?? [];

  // Slave
  const slaveTxt =
    typeof responseData?.slave === "boolean"
      ? responseData.slave
        ? "Encontrado (match)"
        : "Não encontrado"
      : "-";

  // ✅ OFAC detalhado (somente campos não vazios)
  const ofacArr: any[] = Array.isArray(responseData?.ofac) ? responseData.ofac : [];
  const ofacDetailsHtml =
    ofacArr.length === 0
      ? "<p>-</p>"
      : ofacArr
          .map((e, idx) => {
            const fullName = clean(e?.fullName ?? e?.name ?? e?.full_name);
            const similarity = e?.similarity;
            const person = clean(e?.person);
            const countries = clean(e?.countries);
            const profession =
              clean(e?.profession) && clean(e?.profession) !== "-0-" ? clean(e?.profession) : "";
            const information = clean(e?.information);

            // só mostra “cards” quando tiver ao menos algo útil
            const hasAny =
              isFilled(fullName) ||
              isFilled(similarity) ||
              isFilled(person) ||
              isFilled(countries) ||
              isFilled(profession) ||
              isFilled(information);

            if (!hasAny) return "";

            return `
              <div style="margin-top:8px; padding:10px; border:1px solid #eee; border-radius:8px; page-break-inside: avoid;">
                <div style="font-weight:bold; margin-bottom:6px;">Match #${idx + 1}</div>
                ${kvIf("Nome Completo", fullName)}
                ${kvIf("Similaridade", similarity, (v) => `${v}%`)}
                ${kvIf("Tipo de Pessoa", person)}
                ${kvIf("País", countries)}
                ${kvIf("Profissão", profession)}
                ${kvIf("Informações Adicionais", information)}
              </div>
            `;
          })
          .join("") || "<p>-</p>";

  // ✅ PDT (render “humano”)
  const pdt = responseData?.pdt ?? {};

  const pdtViagensSection =
    pdt?.viagens && typeof pdt.viagens !== "string"
      ? section(
          "Portal da Transparência — VIAGENS",
          `
            ${kvIf("Motivo", pdt.viagens?.viagem?.motivo)}
            ${kvIf("PCDP", pdt.viagens?.viagem?.pcdp)}
            ${kvIf("Ano", pdt.viagens?.viagem?.ano)}
            ${kvIf("Número PCDP", pdt.viagens?.viagem?.numPcdp)}
            ${kvIf("Justificativa Urgente", pdt.viagens?.viagem?.justificativaUrgente)}
            ${kvIf("Urgência da Viagem", pdt.viagens?.viagem?.urgenciaViagem)}
            ${kvIf("Situação", pdt.viagens?.situacao)}
            ${kvIf("Nome do Beneficiário", pdt.viagens?.beneficiario?.nome)}
            ${kvIf("CPF do Beneficiário", pdt.viagens?.beneficiario?.cpfFormatado)}
            ${kvIf("NIS do Beneficiário", pdt.viagens?.beneficiario?.nis)}
            ${
              isFilled(pdt.viagens?.cargo?.descricao) || isFilled(pdt.viagens?.cargo?.codigoSIAPE)
                ? kv(
                    "Cargo",
                    `${safe(pdt.viagens?.cargo?.descricao)} (Código: ${safe(pdt.viagens?.cargo?.codigoSIAPE)})`,
                  )
                : ""
            }
            ${
              isFilled(pdt.viagens?.funcao?.descricao) || isFilled(pdt.viagens?.funcao?.codigoSIAPE)
                ? kv(
                    "Função",
                    `${safe(pdt.viagens?.funcao?.descricao)} (Código: ${safe(pdt.viagens?.funcao?.codigoSIAPE)})`,
                  )
                : ""
            }
            ${kvIf("Tipo de Viagem", pdt.viagens?.tipoViagem)}
            ${
              isFilled(pdt.viagens?.orgao?.nome) || isFilled(pdt.viagens?.orgao?.sigla)
                ? kv(
                    "Órgão",
                    `${safe(pdt.viagens?.orgao?.nome)} (${safe(pdt.viagens?.orgao?.sigla)})`,
                  )
                : ""
            }
            ${kvIf("CNPJ do Órgão", pdt.viagens?.orgao?.cnpj)}
            ${kvIf("Código SIAFI do Órgão", pdt.viagens?.orgao?.codigoSIAFI)}
            ${
              isFilled(pdt.viagens?.orgao?.orgaoMaximo?.nome) ||
              isFilled(pdt.viagens?.orgao?.orgaoMaximo?.sigla)
                ? kv(
                    "Órgão Máximo",
                    `${safe(pdt.viagens?.orgao?.orgaoMaximo?.nome)} (${safe(pdt.viagens?.orgao?.orgaoMaximo?.sigla)})`,
                  )
                : ""
            }
            ${kvIf("Data de Início do Afastamento", pdt.viagens?.dataInicioAfastamento)}
            ${kvIf("Data de Fim do Afastamento", pdt.viagens?.dataFimAfastamento)}
            ${kvIf("Valor Total da Viagem", pdt.viagens?.valorTotalViagem, money)}
            ${kvIf("Valor Total de Passagens", pdt.viagens?.valorTotalPassagem, money)}
            ${kvIf("Valor Total de Diárias", pdt.viagens?.valorTotalDiarias, money)}
            ${kvIf("Valor Total da Multa", pdt.viagens?.valorMulta, money)}
            ${kvIf("Valor Total da Restituição", pdt.viagens?.valorTotalRestituicao, money)}
            ${kvIf("Valor Total da Devolução", pdt.viagens?.valorTotalDevolucao, money)}
          `,
        )
      : "";

  const pdtPepSection =
    pdt?.pep && typeof pdt.pep !== "string"
      ? section(
          "Portal da Transparência — PEP",
          `
            ${kvIf("Nome", pdt.pep?.nome)}
            ${kvIf("CPF", pdt.pep?.cpf)}
            ${kvIf("Sigla da Função", pdt.pep?.sigla_funcao, (v) => String(v).trim())}
            ${kvIf("Descrição da Função", pdt.pep?.descricao_funcao, (v) => String(v).trim())}
            ${kvIf("Nível da Função", pdt.pep?.nivel_funcao)}
            ${kvIf("Código do Órgão", pdt.pep?.cod_orgao)}
            ${kvIf("Nome do Órgão", pdt.pep?.nome_orgao, (v) => String(v).trim())}
            ${kvIf("Data de Início do Exercício", pdt.pep?.dt_inicio_exercicio)}
            ${kv("Data de Fim do Exercício", safe(pdt.pep?.dt_fim_exercicio) || "Em exercício")}
            ${kv("Data de Fim da Carência", safe(pdt.pep?.dt_fim_carencia) || "Não aplicável")}
          `,
        )
      : "";

  const pdtCnpjSection =
    pdt?.cnpj && typeof pdt.cnpj !== "string"
      ? section(
          "Portal da Transparência — CNPJ",
          `
            ${kvIf("CNPJ", pdt.cnpj?.cnpj)}
            ${kvIf("Nome", pdt.cnpj?.nome)}
            ${kvIf("Nome Fantasia", pdt.cnpj?.fantasia)}
            ${kvIf("Data de Abertura", pdt.cnpj?.abertura)}
            ${kvIf("Situação", pdt.cnpj?.situacao)}
            ${kvIf("Tipo", pdt.cnpj?.tipo)}
            ${kvIf("Porte", pdt.cnpj?.porte)}
            ${kvIf("Natureza Jurídica", pdt.cnpj?.natureza_juridica)}
            ${kvIf(
              "Atividade Principal",
              joinArr(
                pdt.cnpj?.atividade_principal,
                (it) => `${it?.code ?? ""} - ${it?.text ?? ""}`,
              ),
            )}
            ${kvIf(
              "Atividades Secundárias",
              joinArr(
                pdt.cnpj?.atividades_secundarias,
                (it) => `${it?.code ?? ""} - ${it?.text ?? ""}`,
                " | ",
              ),
            )}
            ${kvIf(
              "Participantes (QSA)",
              joinArr(pdt.cnpj?.qsa, (it) => `${it?.nome ?? ""} - ${it?.qual ?? ""}`, " / "),
            )}
            ${
              isFilled(pdt.cnpj?.logradouro) ||
              isFilled(pdt.cnpj?.numero) ||
              isFilled(pdt.cnpj?.bairro) ||
              isFilled(pdt.cnpj?.municipio) ||
              isFilled(pdt.cnpj?.uf) ||
              isFilled(pdt.cnpj?.cep)
                ? kv(
                    "Endereço",
                    `${safe(pdt.cnpj?.logradouro)}, ${safe(pdt.cnpj?.numero)} - ${safe(pdt.cnpj?.bairro)}, ${safe(
                      pdt.cnpj?.municipio,
                    )} - ${safe(pdt.cnpj?.uf)}, CEP: ${safe(pdt.cnpj?.cep)}`,
                  )
                : ""
            }
            ${kvIf("Email", pdt.cnpj?.email)}
            ${kvIf("Telefone", pdt.cnpj?.telefone)}
            ${kvIf("Capital Social", pdt.cnpj?.capital_social)}
            ${kvIf("Status", pdt.cnpj?.status)}
          `,
        )
      : "";

  const pdtCnepSection =
    pdt?.cnep && typeof pdt.cnep !== "string"
      ? section(
          "Portal da Transparência — CNEP",
          `
            ${kvIf("Data de Referência", pdt.cnep?.dataReferencia)}
            ${kvIf("Início da Sanção", pdt.cnep?.dataInicioSancao)}
            ${kvIf("Fim da Sanção", pdt.cnep?.dataFimSancao)}
            ${kvIf("Publicação da Sanção", pdt.cnep?.dataPublicacaoSancao)}
            ${kvIf("Transitado em Julgado", pdt.cnep?.dataTransitadoJulgado)}
            ${kvIf("Tipo de Sanção", pdt.cnep?.tipoSancao?.descricaoResumida)}
            ${kvIf("Fonte", pdt.cnep?.fonteSancao?.nomeExibicao)}
            ${kvIf("Contato", pdt.cnep?.fonteSancao?.telefoneContato)}
            ${kvIf("Endereço de Contato", pdt.cnep?.fonteSancao?.enderecoContato)}
            ${
              Array.isArray(pdt.cnep?.fundamentacao) && pdt.cnep.fundamentacao.length
                ? kv(
                    "Fundamentação",
                    pdt.cnep.fundamentacao
                      .map((f: any) => f?.descricao)
                      .filter(Boolean)
                      .join(" | "),
                  )
                : ""
            }
            ${
              isFilled(pdt.cnep?.orgaoSancionador?.nome) ||
              isFilled(pdt.cnep?.orgaoSancionador?.siglaUf)
                ? kv(
                    "Órgão Sancionador",
                    `${safe(pdt.cnep?.orgaoSancionador?.nome)} (${safe(pdt.cnep?.orgaoSancionador?.siglaUf)})`,
                  )
                : ""
            }
            ${kvIf("Valor da Multa", pdt.cnep?.valorMulta, money)}
            ${kvIf("Nome", pdt.cnep?.pessoa?.nome)}
            ${kvIf("CPF", pdt.cnep?.pessoa?.cpfFormatado)}
            ${kvIf("Publicação", pdt.cnep?.textoPublicacao)}
            ${kvIf("Número do Processo", pdt.cnep?.numeroProcesso)}
            ${kvIf("Decisão Judicial", pdt.cnep?.abrangenciaDefinidaDecisaoJudicial)}
          `,
        )
      : "";

  const pdtCepimSection =
    pdt?.cepim && typeof pdt.cepim !== "string"
      ? section(
          "Portal da Transparência — CEPIM",
          `
            ${kvIf("Data de Referência", pdt.cepim?.dataReferencia)}
            ${kvIf("Motivo", pdt.cepim?.motivo)}
            ${
              isFilled(pdt.cepim?.orgaoSuperior?.nome) || isFilled(pdt.cepim?.orgaoSuperior?.sigla)
                ? kv(
                    "Órgão Superior",
                    `${safe(pdt.cepim?.orgaoSuperior?.nome)} - ${safe(pdt.cepim?.orgaoSuperior?.sigla)}`,
                  )
                : ""
            }
            ${kvIf("CNPJ do Órgão Superior", pdt.cepim?.orgaoSuperior?.cnpj)}
            ${kvIf("Poder", pdt.cepim?.orgaoSuperior?.descricaoPoder)}
            ${
              isFilled(pdt.cepim?.orgaoSuperior?.orgaoMaximo?.nome) ||
              isFilled(pdt.cepim?.orgaoSuperior?.orgaoMaximo?.sigla)
                ? kv(
                    "Órgão Máximo",
                    `${safe(pdt.cepim?.orgaoSuperior?.orgaoMaximo?.nome)} - ${safe(pdt.cepim?.orgaoSuperior?.orgaoMaximo?.sigla)}`,
                  )
                : ""
            }
            ${kvIf("Entidade", pdt.cepim?.pessoaJuridica?.nome)}
            ${kvIf("CNPJ da Entidade", pdt.cepim?.pessoaJuridica?.cnpjFormatado)}
            ${kvIf("Razão Social", pdt.cepim?.pessoaJuridica?.razaoSocialReceita)}
            ${kvIf("Nome Fantasia", pdt.cepim?.pessoaJuridica?.nomeFantasiaReceita)}
            ${kvIf("Tipo", pdt.cepim?.pessoaJuridica?.tipo)}
            ${kvIf("Código do Convênio", pdt.cepim?.convenio?.codigo)}
            ${kvIf("Objeto do Convênio", pdt.cepim?.convenio?.objeto)}
            ${kvIf("Número do Convênio", pdt.cepim?.convenio?.numero)}
          `,
        )
      : "";

  const pdtCeafSection =
    pdt?.ceaf && typeof pdt.ceaf !== "string"
      ? section(
          "Portal da Transparência — CEAF",
          `
            ${kvIf("Nome", pdt.ceaf?.pessoa?.nome ?? pdt.ceaf?.punicao?.nomePunido)}
            ${kvIf("CPF", pdt.ceaf?.pessoa?.cpfFormatado ?? pdt.ceaf?.punicao?.cpfPunidoFormatado)}
            ${kvIf("Tipo", pdt.ceaf?.pessoa?.tipo)}
            ${kvIf("Data de Publicação", pdt.ceaf?.dataPublicacao)}
            ${kvIf("Data de Referência", pdt.ceaf?.dataReferencia)}
            ${kvIf("Tipo de Punição", pdt.ceaf?.tipoPunicao?.descricao)}
            ${kvIf("Portaria", pdt.ceaf?.punicao?.portaria)}
            ${kvIf("Processo", pdt.ceaf?.punicao?.processo)}
            ${kvIf("Seção do DOU", pdt.ceaf?.punicao?.secaoDOU)}
            ${kvIf("Página do DOU", pdt.ceaf?.punicao?.paginaDOU)}
            ${kvIf("Cargo Efetivo", pdt.ceaf?.cargoEfetivo)}
            ${kvIf("Cargo em Comissão", pdt.ceaf?.cargoComissao)}
            ${
              Array.isArray(pdt.ceaf?.fundamentacao) && pdt.ceaf.fundamentacao.length
                ? kv(
                    "Fundamentação",
                    pdt.ceaf.fundamentacao
                      .map((f: any) => f?.descricao)
                      .filter(Boolean)
                      .join(" | "),
                  )
                : ""
            }
            ${kvIf("Órgão de Lotação", pdt.ceaf?.orgaoLotacao?.nome)}
            ${
              isFilled(pdt.ceaf?.ufLotacaoPessoa?.uf?.nome) ||
              isFilled(pdt.ceaf?.ufLotacaoPessoa?.uf?.sigla)
                ? kv(
                    "UF de Lotação",
                    `${safe(pdt.ceaf?.ufLotacaoPessoa?.uf?.nome)} (${safe(pdt.ceaf?.ufLotacaoPessoa?.uf?.sigla)})`,
                  )
                : ""
            }
          `,
        )
      : "";

  const pdtCeisSection =
    pdt?.ceis && typeof pdt.ceis !== "string"
      ? section(
          "Portal da Transparência — CEIS",
          `
            ${kvIf("Nome", pdt.ceis?.sancionado?.nome ?? pdt.ceis?.pessoa?.nome)}
            ${kvIf("CNPJ", pdt.ceis?.sancionado?.codigoFormatado ?? pdt.ceis?.pessoa?.cnpjFormatado)}
            ${kvIf("Razão Social", pdt.ceis?.pessoa?.razaoSocialReceita)}
            ${kvIf("Nome Fantasia", pdt.ceis?.pessoa?.nomeFantasiaReceita)}
            ${kvIf("Tipo", pdt.ceis?.pessoa?.tipo)}
            ${kvIf("Data de Referência", pdt.ceis?.dataReferencia)}
            ${kvIf("Início da Sanção", pdt.ceis?.dataInicioSancao)}
            ${kvIf("Fim da Sanção", pdt.ceis?.dataFimSancao)}
            ${kvIf("Publicação da Sanção", pdt.ceis?.dataPublicacaoSancao)}
            ${kvIf("Transitado em Julgado", pdt.ceis?.dataTransitadoJulgado)}
            ${kvIf("Tipo de Sanção", pdt.ceis?.tipoSancao?.descricaoResumida)}
            ${
              isFilled(pdt.ceis?.orgaoSancionador?.nome) ||
              isFilled(pdt.ceis?.orgaoSancionador?.siglaUf)
                ? kv(
                    "Órgão Sancionador",
                    `${safe(pdt.ceis?.orgaoSancionador?.nome)} - ${safe(pdt.ceis?.orgaoSancionador?.siglaUf)}`,
                  )
                : ""
            }
            ${kvIf("Poder", pdt.ceis?.orgaoSancionador?.poder)}
            ${kvIf("Esfera", pdt.ceis?.orgaoSancionador?.esfera)}
            ${
              Array.isArray(pdt.ceis?.fundamentacao) && pdt.ceis.fundamentacao.length
                ? kv(
                    "Fundamentação",
                    pdt.ceis.fundamentacao
                      .map((f: any) => f?.descricao)
                      .filter(Boolean)
                      .join(" | "),
                  )
                : ""
            }
            ${kvIf("Fonte da Sanção", pdt.ceis?.fonteSancao?.nomeExibicao)}
            ${kvIf("Contato da Fonte", pdt.ceis?.fonteSancao?.telefoneContato)}
            ${kvIf("Endereço da Fonte", pdt.ceis?.fonteSancao?.enderecoContato)}
            ${kvIf("Texto da Publicação", pdt.ceis?.textoPublicacao)}
            ${kvIf("Número do Processo", pdt.ceis?.numeroProcesso)}
            ${
              isFilled(pdt.ceis?.linkPublicacao)
                ? kvHtml(
                    "Link da Publicação",
                    `<a href="${esc(pdt.ceis.linkPublicacao)}" target="_blank" rel="noopener noreferrer">Acessar</a>`,
                  )
                : ""
            }
            ${kvIf("Abrangência da Decisão Judicial", pdt.ceis?.abrangenciaDefinidaDecisaoJudicial)}
          `,
        )
      : "";

  const pdtTypedSections = [
    pdtViagensSection,
    pdtPepSection,
    pdtCnpjSection,
    pdtCnepSection,
    pdtCepimSection,
    pdtCeisSection,
    pdtCeafSection,
  ]
    .filter(Boolean)
    .join("");

  // ✅ Deskdata Relationships (já estava ok)
  const deskRelationshipsSection = rel
    ? section(
        "Deskdata — Relationships (CNPJ)",
        `
          ${kv("Total", rel?.total)}
          ${kv("Total sócios", rel?.total_owners)}
          ${kv("Total funcionários", rel?.total_employees)}
          <div style="margin-top:8px;">
            <h4 style="margin:0 0 6px 0;">Pessoas relacionadas</h4>
            ${
              relItems.length
                ? `
                  <table style="width:100%; border-collapse:collapse; font-size:12px;">
                    <thead>
                      <tr>
                        ${["Nome", "Class", "Tipo", "Nível", "Fonte", "Doc"]
                          .map(
                            (h) =>
                              `<th style="border:1px solid #ddd; padding:6px; background:#f5f5f5; text-align:left;">${h}</th>`,
                          )
                          .join("")}
                      </tr>
                    </thead>
                    <tbody>
                      ${relItems
                        .map(
                          (it) => `
                        <tr>
                          <td style="border:1px solid #ddd; padding:6px;">${esc(safe(it?.name))}</td>
                          <td style="border:1px solid #ddd; padding:6px;">${esc(safe(it?.class))}</td>
                          <td style="border:1px solid #ddd; padding:6px;">${esc(safe(it?.type))}</td>
                          <td style="border:1px solid #ddd; padding:6px;">${esc(safe(it?.level))}</td>
                          <td style="border:1px solid #ddd; padding:6px;">${esc(safe(it?.source))}</td>
                          <td style="border:1px solid #ddd; padding:6px;">${esc(safe(it?.tax_id?.type))} ${esc(
                            safe(it?.tax_id?.number),
                          )}</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                `
                : "<p>-</p>"
            }
          </div>
        `,
      )
    : "";

  // ✅ Deskdata Lawsuits (detalhado) — seu bloco atual
  const renderSimpleList = (arr: any[], render: (x: any, i: number) => string) => {
    if (!Array.isArray(arr) || arr.length === 0) return "<p>-</p>";
    return `<ul style="margin:6px 0 0 18px;">${arr.map(render).join("")}</ul>`;
  };

  const renderLawsuit = (p: any) => {
    const number = safe(p?.number);
    return `
    <div style="margin-top:10px; padding:10px; border:1px solid #e5e5e5; border-radius:8px; page-break-inside: avoid;">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start;">
        <div style="font-weight:bold; font-family:monospace; font-size:14px;">
          ${esc(number)}
        </div>
        <div style="font-size:12px; color:#666;">
          Última atualização: <strong>${esc(fmtDate(p?.last_update_date))}</strong>
        </div>
      </div>

      <div style="margin-top:8px; display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; font-size:12px;">
        <div><strong>Status:</strong> ${esc(safe(p?.status))}</div>
        <div><strong>Tribunal:</strong> ${esc(safe(p?.court_name))}</div>
        <div><strong>UF:</strong> ${esc(safe(p?.court_state))}</div>

        <div><strong>Distrito:</strong> ${esc(safe(p?.court_district))}</div>
        <div><strong>Vara:</strong> ${esc(safe(p?.court_branch))}</div>
        <div><strong>Sistema:</strong> ${esc(safe(p?.filing_system))}</div>

        <div><strong>Publicação:</strong> ${esc(fmtDate(p?.publication_date))}</div>
        <div><strong>Último evento:</strong> ${esc(fmtDate(p?.last_event_date))}</div>
        <div><strong>Fechamento:</strong> ${esc(fmtDate(p?.closing_date))}</div>

        <div><strong>Total partes:</strong> ${esc(safe(p?.total_parties))}</div>
        <div><strong>Total eventos:</strong> ${esc(safe(p?.total_events))}</div>
        <div><strong>Classe CNJ:</strong> ${esc(safe(p?.cnj_class_name))}</div>
      </div>

      <div style="margin-top:10px;">
        <h4 style="margin:0 0 6px 0;">Partes</h4>
        ${renderSimpleList(p?.parties, (pt: any) => {
          const oab =
            pt?.details?.oab_number && pt?.details?.oab_state
              ? ` (OAB ${pt.details.oab_state} ${pt.details.oab_number})`
              : "";
          return `<li style="font-size:12px;">
            <strong>${esc(safe(pt?.type))}:</strong>
            ${esc(safe(pt?.name))} (${esc(safe(pt?.doc))}) — ${esc(safe(pt?.role))}${esc(oab)}
          </li>`;
        })}
      </div>

      <div style="margin-top:10px;">
        <h4 style="margin:0 0 6px 0;">Eventos</h4>
        ${renderSimpleList(
          p?.events,
          (ev: any) =>
            `<li style="font-size:12px;"><strong>${esc(fmtDate(ev?.date))}:</strong> ${esc(safe(ev?.content))}</li>`,
        )}
      </div>

      <div style="margin-top:10px;">
        <h4 style="margin:0 0 6px 0;">Petições</h4>
        ${renderSimpleList(
          p?.petitions,
          (ptt: any) =>
            `<li style="font-size:12px;"><strong>${esc(fmtDate(ptt?.date))}:</strong> ${esc(
              safe(ptt?.type),
            )} — ${esc(safe(ptt?.author))}</li>`,
        )}
      </div>

      <div style="margin-top:10px;">
        <h4 style="margin:0 0 6px 0;">Decisões</h4>
        ${renderSimpleList(
          p?.decisions,
          (dc: any) =>
            `<li style="font-size:12px;"><strong>${esc(fmtDate(dc?.date))}:</strong> ${esc(safe(dc?.content))}</li>`,
        )}
      </div>
    </div>
  `;
  };

  const uniqueByNumber = (arr: any[]) => {
    const map = new Map<string, any>();
    (arr || []).forEach((p) => {
      const n = String(p?.number ?? "");
      if (!map.has(n)) map.set(n, p);
    });
    return Array.from(map.values());
  };

  const deskLawsuitsSection = lawsuits
    ? section(
        "Deskdata — Lawsuits (CPF)",
        `
        ${kv("Total", lawsuits?.total)}
        ${kv("Como autor", lawsuits?.total_as_author)}
        ${kv("Como réu", lawsuits?.total_as_defendant)}
        ${kv("Outros", lawsuits?.total_as_other)}

        <div style="margin-top:10px;">
          <h4 style="margin:0 0 6px 0;">Processos (detalhados)</h4>
          ${
            uniqueByNumber(lawsuitItems).length
              ? uniqueByNumber(lawsuitItems).map(renderLawsuit).join("")
              : "<p>-</p>"
          }
        </div>
      `,
      )
    : "";

  // ✅ (Opcional) se você quiser reter JSON do PDT como auditoria, deixe; senão remova:
  const pdtKeysAll = ["cpf", "sdc", "safra", "peti", "bpc", "ae", "cf"]; // mantém só os que você quiser em JSON
  const pdtJsonAuditSections = pdtKeysAll
    .filter((k) => pdt?.[k])
    .map((k) =>
      section(
        `Portal da Transparência (JSON) — ${k.toUpperCase()}`,
        `<pre style="white-space:pre-wrap; font-size:12px; background:#fafafa; padding:8px; border-radius:6px; border:1px solid #eee;">${prettyJson(
          pdt[k],
        )}</pre>`,
      ),
    )
    .join("");

  const content = `
    <h2>RELATÓRIO DE COMPLIANCE</h2>

    ${nome ? `<p><strong>${esc(nome)}</strong></p>` : ""}
    ${nis ? `<p><strong>NIS:</strong> ${esc(nis)}</p>` : ""}

    ${kv("Nossa base", responseData?.ourData)}
    ${kv("Observação", "Algumas ordens são registradas apenas no mês seguinte")}
    ${kv("Análise", responseData?.userAnalysis)}

    ${section(
      "Listas / Checagens",
      `
        ${kv("OFAC", ofacArr.length ? `Possíveis matches: ${ofacArr.length}` : "Possíveis matches: 0")}
        ${kv("Trabalho escravo", slaveTxt)}

        <div style="margin-top:10px;">
          <h4 style="margin:0 0 6px 0;">Detalhes OFAC</h4>
          ${ofacDetailsHtml}
        </div>
      `,
    )}

    ${deskRelationshipsSection}
    ${pdtTypedSections || section("Portal da Transparência", "<p>-</p>")}
    ${pdtJsonAuditSections}
    ${deskLawsuitsSection}
  `;

  generateDocAsPdf(content);
};
