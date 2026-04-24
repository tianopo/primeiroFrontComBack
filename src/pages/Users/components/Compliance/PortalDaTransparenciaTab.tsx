import { portalSectionsConfig } from "../../config/portal-transparencia.config";
import { PortalDaTransparenciaResponse, PortalItem } from "../../utils/portal-transparencia.types";

interface IPortalDaTransparenciaTab {
  portalData: PortalDaTransparenciaResponse | null | undefined;
}

const getValueByPath = (obj: unknown, path?: string): unknown => {
  if (!obj || !path) return null;

  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return null;
  }, obj);
};

const renderValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : "Não informado";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const PortalDaTransparenciaTab = ({ portalData }: IPortalDaTransparenciaTab) => {
  const data = portalData ?? ({} as PortalDaTransparenciaResponse);

  const visibleSections = portalSectionsConfig.filter((section) => {
    const value = data[section.key];
    return Array.isArray(value) && value.length > 0;
  });

  if (!visibleSections.length) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm">
        Nenhum dado do Portal da Transparência encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {visibleSections.map((section) => {
        const items = data[section.key] as PortalItem[];

        return (
          <section key={section.key} className="rounded-md border border-gray-200 p-4">
            <h4 className="mb-3 text-lg font-bold">{section.title}</h4>

            <div className="flex flex-col gap-3">
              {items.map((item, index) => (
                <div key={`${section.key}-${index}`} className="rounded border p-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {section.fields.map((field) => {
                      const value = field.render
                        ? field.render(item)
                        : renderValue(getValueByPath(item, field.path));

                      return (
                        <div key={`${section.key}-${field.label}-${index}`} className="text-sm">
                          <strong>{field.label}:</strong> {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
