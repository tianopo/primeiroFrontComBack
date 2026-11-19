import { useState, type ComponentProps } from "react";
import { InputX } from "src/components/Form/Input/InputX";
import {
  useSearchAccounts,
  type AccountSearchField,
  type AccountSearchItem,
} from "../../hooks/User/useSearchAccounts";
type Props = Omit<ComponentProps<typeof InputX>, "busca" | "options" | "value"> & {
  value: string;
  field: AccountSearchField;
  onPick: (account: AccountSearchItem) => void;
};
export const AccountSearchInput = ({ field, value, onPick, onChange, ...props }: Props) => {
  const [open, setOpen] = useState(false);
  const {
    data = [],
    canSearch,
    isSearching,
    isError,
  } = useSearchAccounts(field, value, open && !props.disabled && !props.readOnly);
  return (
    <div
      className="input_container relative [&>.input_container]:w-full"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
        if (event.key === "Enter" && open && event.target instanceof HTMLInputElement)
          event.preventDefault();
      }}
    >
      <InputX
        {...props}
        value={value}
        onChange={(event) => {
          setOpen(true);
          onChange?.(event);
        }}
      />
      {open && (
        <ul
          aria-label={"Resultados de " + props.title}
          className="absolute left-0 top-full z-50 max-h-60 w-full overflow-auto rounded border bg-white shadow"
        >
          {!canSearch ? (
            <li className="p-2">Digite pelo menos 3 caracteres.</li>
          ) : isSearching ? (
            <li className="p-2" role="status">
              Buscando...
            </li>
          ) : isError ? (
            <li className="p-2" role="alert">
              Não foi possível buscar.
            </li>
          ) : data.length === 0 ? (
            <li className="p-2">Nenhum cadastro encontrado.</li>
          ) : (
            data.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  className="w-full p-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onPick(account);
                    setOpen(false);
                  }}
                >
                  {account.counterparty} — {account.User.name} — {account.User.document} —{" "}
                  {account.exchange.split(" ")[0]}
                </button>
              </li>
            ))
          )}
          {canSearch && !isSearching && !isError && data.length === 20 && (
            <li className="p-2 text-sm text-gray-500">Refine a busca para reduzir as opções.</li>
          )}
        </ul>
      )}
    </div>
  );
};
