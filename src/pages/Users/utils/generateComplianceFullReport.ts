import { generateDocAsPdf } from "src/pages/Contracts/config/generateDocAsPdf";
import { cnpjFieldsConfig } from "src/pages/Users/config/cnpj.config";
import { portalSectionsConfig } from "src/pages/Users/config/portal-transparencia.config";
import {
  PortalDaTransparenciaResponse,
  PortalItem,
} from "src/pages/Users/utils/portal-transparencia.types";

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const humanizeKey = (key: string) =>
  key
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const formatDate = (value?: string | Date | null) => {
  if (!value) return "Não informado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Não informado";
  return date.toLocaleString("pt-BR");
};

const formatMoney = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "Não informado";
  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const renderPrimitive = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return String(value);
};

const renderField = (label: string, value: unknown) => `
  <div class="field">
    <span class="label">${escapeHtml(label)}:</span> ${escapeHtml(renderPrimitive(value))}
  </div>
`;

const renderGrid = (fields: Array<{ label: string; value: unknown }>) => {
  const filtered = fields.filter(
    (field) => field.value !== null && field.value !== undefined && field.value !== "",
  );

  if (!filtered.length) return "";

  return `<div class="grid">${filtered
    .map((field) => renderField(field.label, field.value))
    .join("")}</div>`;
};

const renderList = (title: string, items: unknown[]) => {
  if (!items.length) return "";

  return `
    <div class="section">
      <h4>${escapeHtml(title)}</h4>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(renderPrimitive(item))}</li>`).join("")}
      </ul>
    </div>
  `;
};

const renderTable = (title: string, rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );

  if (!headers.length) return "";

  return `
    <div class="section">
      <h4>${escapeHtml(title)}</h4>
      <table>
        <thead>
          <tr>
            ${headers.map((header) => `<th>${escapeHtml(humanizeKey(header))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${headers
                    .map((header) => `<td>${escapeHtml(renderPrimitive(row[header]))}</td>`)
                    .join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

const getBaseOrigin = () => {
  const host = process.env.REACT_APP_BACK_HOST || "http://localhost";
  const port = process.env.REACT_APP_BACK_PORT || ":3500";
  const nodeEnv = process.env.REACT_APP_NODE_ENV || "dev";
  return nodeEnv === "dev" ? `${host}${port}` : host;
};

const publicFileUrl = (storageKey?: string | null) => {
  if (!storageKey) return "";
  if (/^https?:\/\//i.test(storageKey)) return storageKey;
  const baseOrigin = getBaseOrigin();
  return `${baseOrigin}${storageKey.startsWith("/") ? storageKey : `/${storageKey}`}`;
};

const isImageFile = (mimeType?: string | null, storageKey?: string | null) => {
  if (mimeType?.startsWith("image/")) return true;
  return /\.(png|jpg|jpeg|webp|gif|bmp|svg)$/i.test(String(storageKey ?? ""));
};

const isPdfFile = (mimeType?: string | null, storageKey?: string | null) => {
  return mimeType === "application/pdf" || /\.pdf$/i.test(String(storageKey ?? ""));
};

const getValueByPath = (obj: unknown, path?: string): unknown => {
  if (!obj || !path) return null;

  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return null;
  }, obj);
};

const renderUnknown = (title: string, value: unknown, level = 0): string => {
  if (value === null || value === undefined || value === "") return "";

  const wrapperClass = level === 0 ? "section" : "subsection";

  if (!Array.isArray(value) && !isRecord(value)) {
    return `
      <div class="${wrapperClass}">
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(renderPrimitive(value))}</p>
      </div>
    `;
  }

  if (Array.isArray(value)) {
    if (!value.length) return "";

    const allPrimitive = value.every(
      (item) => item === null || item === undefined || typeof item !== "object",
    );

    if (allPrimitive) {
      return `
        <div class="${wrapperClass}">
          <h4>${escapeHtml(title)}</h4>
          <ul>
            ${value.map((item) => `<li>${escapeHtml(renderPrimitive(item))}</li>`).join("")}
          </ul>
        </div>
      `;
    }

    return `
      <div class="${wrapperClass}">
        <h4>${escapeHtml(title)}</h4>
        ${value
          .map((item, index) => renderUnknown(`${title} #${index + 1}`, item, level + 1))
          .join("")}
      </div>
    `;
  }

  const entries = Object.entries(value);
  const simpleEntries = entries.filter(([, currentValue]) => {
    if (currentValue === null || currentValue === undefined || currentValue === "") return false;
    return typeof currentValue !== "object";
  });

  const complexEntries = entries.filter(([, currentValue]) => {
    if (currentValue === null || currentValue === undefined || currentValue === "") return false;
    return typeof currentValue === "object";
  });

  return `
    <div class="${wrapperClass}">
      <h4>${escapeHtml(title)}</h4>
      ${renderGrid(
        simpleEntries.map(([key, currentValue]) => ({
          label: humanizeKey(key),
          value: currentValue,
        })),
      )}
      ${complexEntries
        .map(([key, currentValue]) => renderUnknown(humanizeKey(key), currentValue, level + 1))
        .join("")}
    </div>
  `;
};

const renderPortalSections = (portalData?: PortalDaTransparenciaResponse | null) => {
  if (!portalData) return "";

  const visibleSections = portalSectionsConfig.filter((section) => {
    const value = portalData[section.key];
    return Array.isArray(value) && value.length > 0;
  });

  if (!visibleSections.length && !portalData.cnpj) return "";

  return `
    <div class="report-page">
      <h2 class="page-title">Portal da Transparência</h2>

      ${visibleSections
        .map((section) => {
          const items = portalData[section.key] as PortalItem[];

          return `
            <div class="section">
              <h3>${escapeHtml(section.title)}</h3>
              ${items
                .map(
                  (item, index) => `
                    <div class="subsection">
                      <h4>${escapeHtml(section.title)} #${index + 1}</h4>
                      <div class="grid">
                        ${section.fields
                          .map((field) => {
                            const rawValue = field.render
                              ? field.render(item)
                              : getValueByPath(item, field.path);

                            return renderField(field.label, rawValue);
                          })
                          .join("")}
                      </div>
                      ${Object.entries(item)
                        .filter(
                          ([key]) =>
                            !section.fields.some(
                              (field) => field.path === key || field.label === key,
                            ),
                        )
                        .map(([key, value]) => renderUnknown(humanizeKey(key), value, 1))
                        .join("")}
                    </div>
                  `,
                )
                .join("")}
            </div>
          `;
        })
        .join("")}

      ${portalData.cnpj ? renderUnknown("Dados CNPJ vindos do Portal/Receita", portalData.cnpj) : ""}
    </div>
  `;
};

const renderCnpjSection = (cnpjData?: Record<string, unknown> | null) => {
  if (!cnpjData) return "";

  return `
    <div class="report-page">
      <h2 class="page-title">Consulta CNPJ</h2>

      <div class="section">
        <h3>Dados principais do CNPJ</h3>
        <div class="grid">
          ${cnpjFieldsConfig
            .map((field) => {
              const rawValue = field.render
                ? field.render(cnpjData)
                : getValueByPath(cnpjData, field.path);

              return renderField(field.label, rawValue);
            })
            .join("")}
        </div>
      </div>

      ${Object.entries(cnpjData)
        .map(([key, value]) => renderUnknown(humanizeKey(key), value))
        .join("")}
    </div>
  `;
};

const renderSanctionsSection = (sources: Record<string, unknown>) => {
  const sanctions = isRecord(sources?.sanctions) ? sources.sanctions : {};
  const screeningName = sources?.screeningName;
  const maxSimilarity = sanctions?.maxSimilarity;
  const ofac = Array.isArray(sanctions?.ofac) ? sanctions.ofac : [];
  const europa = Array.isArray(sanctions?.europa) ? sanctions.europa : [];
  const csnu = Array.isArray(sanctions?.csnu) ? sanctions.csnu : [];
  const palestinaCouncil = Array.isArray(sanctions?.palestinaCouncil)
    ? sanctions.palestinaCouncil
    : [];

  if (
    !screeningName &&
    !ofac.length &&
    !europa.length &&
    !csnu.length &&
    !palestinaCouncil.length
  ) {
    return "";
  }

  return `
    <div class="report-page">
      <h2 class="page-title">Sanções e Listas Restritivas</h2>

      <div class="section">
        <h3>Informações gerais</h3>
        ${renderGrid([
          { label: "Nome usado no screening", value: screeningName },
          { label: "Maior similaridade encontrada", value: maxSimilarity },
        ])}
      </div>

      ${ofac.length ? renderTable("Lista OFAC", ofac.filter(isRecord) as Record<string, unknown>[]) : ""}
      ${europa.length ? renderTable("Lista Europa", europa.filter(isRecord) as Record<string, unknown>[]) : ""}
      ${csnu.length ? renderTable("Lista CSNU", csnu.filter(isRecord) as Record<string, unknown>[]) : ""}
      ${palestinaCouncil.length ? renderTable("Lista Palestina", palestinaCouncil.filter(isRecord) as Record<string, unknown>[]) : ""}
    </div>
  `;
};

const renderDocumentsSection = (storedEvidence: any[]) => {
  return `
    <div class="report-page">
      <h2 class="page-title">Documentos Armazenados</h2>

      ${
        storedEvidence.length
          ? storedEvidence
              .map((evidence) => {
                const fileUrl = publicFileUrl(evidence?.storageKey);
                const imageHtml =
                  isImageFile(evidence?.mimeType, evidence?.storageKey) && fileUrl
                    ? `<img class="evidence-image" src="${escapeHtml(fileUrl)}" alt="${escapeHtml(
                        evidence?.label || evidence?.type || "documento",
                      )}" />`
                    : "";

                const pdfHtml =
                  isPdfFile(evidence?.mimeType, evidence?.storageKey) && fileUrl
                    ? `<p><strong>Arquivo PDF:</strong> ${escapeHtml(fileUrl)}</p>`
                    : "";

                return `
                  <div class="section">
                    <h3>${escapeHtml(evidence?.label || evidence?.type || "Documento")}</h3>

                    ${renderGrid([
                      { label: "Tipo", value: evidence?.type },
                      { label: "Status", value: evidence?.status },
                      { label: "Descrição", value: evidence?.description },
                      { label: "Exchange", value: evidence?.exchange },
                      { label: "OrderId externo", value: evidence?.externalOrderNumber },
                      { label: "MimeType", value: evidence?.mimeType },
                      { label: "Arquivo", value: evidence?.storageKey },
                      { label: "Validado por", value: evidence?.validatedBy },
                      { label: "Criado em", value: formatDate(evidence?.createdIn) },
                      { label: "Atualizado em", value: formatDate(evidence?.updated) },
                    ])}

                    ${imageHtml}
                    ${pdfHtml}

                    ${renderUnknown("Metadados do documento", evidence?.metadata)}
                  </div>
                `;
              })
              .join("")
          : `<div class="section"><p>Nenhum documento armazenado.</p></div>`
      }
    </div>
  `;
};

const renderMedsSection = (events: any[]) => {
  const meds = events.filter((event) => event?.type === "MED_RECORDED");

  return `
    <div class="report-page">
      <h2 class="page-title">Eventos MED</h2>

      ${
        meds.length
          ? meds
              .map(
                (event, index) => `
                  <div class="section">
                    <h3>MED #${index + 1}</h3>
                    ${renderGrid([
                      { label: "Título", value: event?.title },
                      { label: "Data do evento", value: formatDate(event?.createdIn) },
                      { label: "Motivo do MED", value: event?.description },
                      { label: "OrderId", value: event?.orderId },
                    ])}
                    ${renderUnknown("Detalhes do MED", event?.metadata)}
                  </div>
                `,
              )
              .join("")
          : `<div class="section"><p>Nenhum MED registrado.</p></div>`
      }
    </div>
  `;
};

const renderAllEventsSection = (events: any[]) => `
  <div class="report-page">
    <h2 class="page-title">Todos os Eventos do Compliance</h2>

    ${
      events.length
        ? events
            .map(
              (event, index) => `
                <div class="section">
                  <h3>Evento #${index + 1}</h3>
                  ${renderGrid([
                    { label: "Tipo", value: event?.type },
                    { label: "Título", value: event?.title },
                    { label: "Descrição", value: event?.description },
                    { label: "Criado por", value: event?.createdBy },
                    { label: "Data", value: formatDate(event?.createdIn) },
                    { label: "OrderId", value: event?.orderId },
                  ])}
                  ${renderUnknown("Detalhes adicionais do evento", event?.metadata)}
                </div>
              `,
            )
            .join("")
        : `<div class="section"><p>Nenhum evento encontrado.</p></div>`
    }
  </div>
`;

const renderDeskdataSection = (sources: Record<string, unknown>) => {
  const deskdataSummary = sources?.deskdataSummary;
  const deskdata = sources?.deskdata;
  const slaveDetails = sources?.slaveDetails;

  if (!deskdataSummary && !deskdata && !slaveDetails) return "";

  return `
    <div class="report-page">
      <h2 class="page-title">Deskdata e Outras Consultas</h2>
      ${deskdataSummary ? renderUnknown("Deskdata Summary", deskdataSummary) : ""}
      ${deskdata ? renderUnknown("Deskdata completo", deskdata) : ""}
      ${slaveDetails ? renderUnknown("Detalhes trabalho escravo", slaveDetails) : ""}
    </div>
  `;
};

export const generateComplianceFullReport = (
  data: any,
  extras?: {
    portalData?: PortalDaTransparenciaResponse | null;
    cnpjData?: Record<string, unknown> | null;
  },
) => {
  if (!data?.compliance) return;

  const input = data?.input ?? {};
  const user = data?.user ?? {};
  const compliance = data?.compliance ?? {};
  const sources = compliance?.sources ?? {};
  const limits = compliance?.limits ?? {};
  const behavior = compliance?.behavior ?? {};
  const flags = compliance?.flags ?? {};
  const requiredNow = compliance?.evidence?.requiredNow ?? [];
  const storedEvidence = compliance?.evidence?.stored ?? [];
  const events = compliance?.events ?? [];
  const persistence = compliance?.persistence ?? {};

  const portalData =
    extras?.portalData ??
    (isRecord(sources?.pdt) ? (sources.pdt as PortalDaTransparenciaResponse) : null);

  const cnpjData =
    extras?.cnpjData ??
    (isRecord(sources?.cnpj) ? (sources.cnpj as Record<string, unknown>) : null);

  const html = `
    <div class="report-page">
      <h1>CRYPTOTECH DESENVOLVIMENTO E TRADING LTDA</h1>
      <h2>Relatório Completo de Compliance</h2>
      <p class="muted" style="text-align:center;">
        Gerado em ${escapeHtml(new Date().toLocaleString("pt-BR"))}
      </p>

      <div class="section">
        <h3>Identificação</h3>
        ${renderGrid([
          { label: "Documento informado", value: input?.rawDocument },
          { label: "Documento normalizado", value: input?.normalizedDocument },
          { label: "Tipo de documento", value: input?.documentType },
          { label: "Nome do usuário", value: user?.name },
          { label: "Documento cadastrado", value: user?.document },
          { label: "Bloqueado no usuário", value: user?.blocked },
          { label: "Criado em", value: formatDate(user?.createdIn) },
          { label: "Atualizado em", value: formatDate(user?.updated) },
          { label: "Beneficiário responsável", value: sources?.beneficialOwnerName },
          { label: "Documento do responsável", value: sources?.beneficialOwnerDocument },
          { label: "Nome usado no screening", value: sources?.screeningName },
        ])}
      </div>

      ${
        Array.isArray(user?.accounts) && user.accounts.length
          ? renderList(
              "Contas / Exchanges",
              user.accounts.map(
                (account: any) => `${account?.exchange || "-"} - ${account?.counterparty || "-"}`,
              ),
            )
          : ""
      }

      <div class="section">
        <h3>Resultado da análise</h3>
        ${renderGrid([
          { label: "Status", value: compliance?.status },
          { label: "Risco", value: compliance?.riskLevel },
          { label: "Score", value: compliance?.riskScore },
          { label: "Resumo", value: compliance?.summary },
          { label: "Motivo do bloqueio", value: compliance?.blockedReason },
          { label: "Observações internas", value: compliance?.internalNotes },
          {
            label: "Restrição temporária até",
            value: formatDate(compliance?.temporaryRestrictionUntil),
          },
          {
            label: "Motivo da restrição temporária",
            value: compliance?.temporaryRestrictionReason,
          },
          { label: "Próximo reprocessamento", value: formatDate(persistence?.nextRescreenAt) },
          { label: "Última atualização persistida", value: formatDate(persistence?.updated) },
        ])}
      </div>

      ${Array.isArray(compliance?.reasons) ? renderList("Motivos atuais", compliance.reasons) : ""}
      ${
        Array.isArray(sources?.sourceSummary)
          ? renderList("Consultas realizadas", sources.sourceSummary)
          : ""
      }
    </div>

    <div class="report-page">
      <h2 class="page-title">Limites, Capacidade e Comportamento</h2>

      <div class="section">
        <h3>Limites e capacidade</h3>
        ${renderGrid([
          { label: "Limite mensal", value: formatMoney(limits?.monthlyLimitBrl) },
          { label: "Limite por ordem", value: formatMoney(limits?.maxSingleOrderBrl) },
          {
            label: "Capacidade estimada",
            value:
              limits?.capacityEstimateBrl != null
                ? formatMoney(limits?.capacityEstimateBrl)
                : "Não informado",
          },
          { label: "Origem da capacidade", value: limits?.capacitySource },
        ])}
      </div>

      <div class="section">
        <h3>Comportamento operacional</h3>
        ${renderGrid([
          { label: "Total de ordens", value: behavior?.totalOrders },
          { label: "Idade da conta em dias", value: behavior?.accountAgeDays },
          { label: "Ordens altas em 1 dia", value: behavior?.highValueOrders1d },
          { label: "Ordens altas em 30 dias", value: behavior?.highValueOrders30d },
          { label: "Volume diário", value: formatMoney(behavior?.dailyVolumeBrl) },
          { label: "Volume em 30 dias", value: formatMoney(behavior?.monthlyVolumeBrl) },
          { label: "Volume histórico", value: formatMoney(behavior?.lifetimeVolumeBrl) },
          { label: "Maior ordem em 1 dia", value: formatMoney(behavior?.highestOrder1d) },
          { label: "Maior ordem em 30 dias", value: formatMoney(behavior?.highestOrder30d) },
          { label: "Primeira ordem aprovada", value: formatDate(behavior?.firstApprovedOrderAt) },
          { label: "Última ordem", value: formatDate(behavior?.lastOrderAt) },
          {
            label: "Exchanges operadas",
            value: Array.isArray(behavior?.exchanges)
              ? behavior.exchanges.join(", ")
              : "Não informado",
          },
        ])}
      </div>

      <div class="section">
        <h3>Flags e exigências</h3>
        <div>
          ${Object.entries(flags ?? {})
            .map(
              ([key, value]) =>
                `<span class="pill">${escapeHtml(humanizeKey(key))}: ${escapeHtml(
                  renderPrimitive(value),
                )}</span>`,
            )
            .join("")}
        </div>
      </div>
    </div>

    <div class="report-page">
      <h2 class="page-title">Documentos e Exigências</h2>

      <div class="section">
        <h3>Documentos exigidos atualmente</h3>
        ${
          requiredNow.length
            ? requiredNow
                .map(
                  (item: any) => `
                    <div class="subsection">
                      <h4>${escapeHtml(item?.label || item?.type || "Documento exigido")}</h4>
                      <p><strong>Tipo:</strong> ${escapeHtml(item?.type || "-")}</p>
                      <p><strong>Motivo:</strong> ${escapeHtml(item?.reason || "-")}</p>
                    </div>
                  `,
                )
                .join("")
            : "<p>Nenhum documento exigido atualmente.</p>"
        }
      </div>
    </div>

    ${renderDocumentsSection(storedEvidence)}

    ${renderMedsSection(events)}

    ${renderAllEventsSection(events)}

    ${renderSanctionsSection(sources)}

    ${renderDeskdataSection(sources)}

    ${renderPortalSections(portalData)}

    ${renderCnpjSection(cnpjData)}
  `;

  generateDocAsPdf(html);
};
