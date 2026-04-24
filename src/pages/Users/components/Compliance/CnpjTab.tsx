import { cnpjFieldsConfig } from "../../config/cnpj.config";

interface ICnpjTab {
  responseData: Record<string, unknown> | null | undefined;
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
  return String(value);
};

export const CnpjTab = ({ responseData }: ICnpjTab) => {
  if (!responseData) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm">
        Nenhum dado de CNPJ encontrado.
      </div>
    );
  }

  return (
    <section className="rounded-md border border-gray-200 p-4">
      <h4 className="mb-3 text-lg font-bold">Consulta CNPJ</h4>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {cnpjFieldsConfig.map((field) => {
          const value = field.render
            ? field.render(responseData)
            : renderValue(getValueByPath(responseData, field.path));

          return (
            <div key={field.label} className="text-sm">
              <strong>{field.label}:</strong> {value}
            </div>
          );
        })}
      </div>
    </section>
  );
};
