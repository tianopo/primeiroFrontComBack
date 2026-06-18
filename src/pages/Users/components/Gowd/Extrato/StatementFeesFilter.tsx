const STORAGE_KEY = "corpxGowdStatementHideFees";

export const getInitialStatementHideFees = () => {
  if (typeof window === "undefined") return false;

  const saved = window.localStorage.getItem(STORAGE_KEY);

  if (saved === null) return false;

  return saved === "true";
};

type StatementFeesFilterProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const StatementFeesFilter = ({ checked, onChange }: StatementFeesFilterProps) => {
  const handleChange = (value: boolean) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    }

    onChange(value);
  };

  return (
    <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 md:w-auto">
      <span>{checked ? "Taxas ocultas" : "Taxas visíveis"}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => handleChange(event.target.checked)}
        className="h-4 w-4 cursor-pointer"
      />
    </label>
  );
};
