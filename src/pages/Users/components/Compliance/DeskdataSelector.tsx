import {
  DESKDATA_OPTIONS_BY_KIND,
  DESKDATA_OWNER_OPTIONS_FOR_COMPANY,
} from "../../config/deskdataCatalog";
import { DeskdataDataset, resolveDeskdataKind } from "../../utils/deskdataTypes";

interface IDeskdataSelector {
  documento: string;
  canShow: boolean;
  enabled: boolean;
  selectedDatasets: DeskdataDataset[];
  ownerDatasets: DeskdataDataset[];
  onEnabledChange: (value: boolean) => void;
  onSelectedDatasetsChange: (value: DeskdataDataset[]) => void;
  onOwnerDatasetsChange: (value: DeskdataDataset[]) => void;
}

export const DeskdataSelector = ({
  documento,
  canShow,
  enabled,
  selectedDatasets,
  ownerDatasets,
  onEnabledChange,
  onSelectedDatasetsChange,
  onOwnerDatasetsChange,
}: IDeskdataSelector) => {
  const kind = resolveDeskdataKind(documento);

  if (!canShow) return null;

  const options = kind ? DESKDATA_OPTIONS_BY_KIND[kind] : [];
  const shouldShowOwnerOptions = kind === "CNPJ" && selectedDatasets.includes("relationships");

  const toggleDataset = (
    dataset: DeskdataDataset,
    current: DeskdataDataset[],
    setter: (value: DeskdataDataset[]) => void,
  ) => {
    if (current.includes(dataset)) {
      setter(current.filter((item) => item !== dataset));
      return;
    }

    setter([...current, dataset]);
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-md border border-gray-200 p-3">
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
          <div className="text-sm text-gray-500">
            Estratégia fixa: <strong>auto</strong>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold">
              Datasets para {kind ?? "documento inválido"}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {options.map((option) => (
                <label key={option.value} className="flex items-start gap-2 rounded border p-2">
                  <input
                    type="checkbox"
                    checked={selectedDatasets.includes(option.value)}
                    onChange={() =>
                      toggleDataset(option.value, selectedDatasets, onSelectedDatasetsChange)
                    }
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {shouldShowOwnerOptions && (
            <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3">
              <div className="text-sm font-semibold">Dados do CPF do primeiro sócio</div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {DESKDATA_OWNER_OPTIONS_FOR_COMPANY.map((option) => (
                  <label
                    key={`owner-${option.value}`}
                    className="flex items-start gap-2 rounded border p-2"
                  >
                    <input
                      type="checkbox"
                      checked={ownerDatasets.includes(option.value)}
                      onChange={() =>
                        toggleDataset(option.value, ownerDatasets, onOwnerDatasetsChange)
                      }
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
