import { DESKDATA_OPTIONS_BY_KIND } from "../../config/deskdataCatalog";
import { DeskdataDataset, DeskdataStrategy, resolveDeskdataKind } from "../../utils/deskdataTypes";

interface IDeskdataSelector {
  documento: string;
  canShow: boolean;
  enabled: boolean;
  strategy: DeskdataStrategy;
  selectedDatasets: DeskdataDataset[];
  onEnabledChange: (value: boolean) => void;
  onStrategyChange: (value: DeskdataStrategy) => void;
  onSelectedDatasetsChange: (value: DeskdataDataset[]) => void;
}

export const DeskdataSelector = ({
  documento,
  canShow,
  enabled,
  strategy,
  selectedDatasets,
  onEnabledChange,
  onStrategyChange,
  onSelectedDatasetsChange,
}: IDeskdataSelector) => {
  const kind = resolveDeskdataKind(documento);

  if (!canShow) return null;

  const options = kind ? DESKDATA_OPTIONS_BY_KIND[kind] : [];

  const toggleDataset = (dataset: DeskdataDataset) => {
    if (selectedDatasets.includes(dataset)) {
      onSelectedDatasetsChange(selectedDatasets.filter((item) => item !== dataset));
      return;
    }

    onSelectedDatasetsChange([...selectedDatasets, dataset]);
  };

  return (
    <div className="mt-2 flex w-full flex-col gap-3 rounded-md border border-gray-200 p-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
        />
        <span className="font-semibold">Deskdata</span>
      </label>

      {enabled && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Estratégia</label>
            <select
              value={strategy}
              onChange={(e) => onStrategyChange(e.target.value as DeskdataStrategy)}
              className="rounded border p-2"
            >
              <option value="auto">Auto</option>
              <option value="missing_only">Apenas faltantes</option>
              <option value="refresh_union">Atualizar união</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold">
              Consultas disponíveis para {kind ?? "documento inválido"}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {options.map((option) => (
                <label key={option.value} className="flex items-start gap-2 rounded border p-2">
                  <input
                    type="checkbox"
                    checked={selectedDatasets.includes(option.value)}
                    onChange={() => toggleDataset(option.value)}
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
