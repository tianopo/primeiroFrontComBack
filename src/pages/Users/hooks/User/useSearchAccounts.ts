import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";
export type AccountSearchField = "apelido" | "nome" | "documento";
export type AccountSearchItem = {
  id: string;
  counterparty: string;
  exchange: string;
  User: { name: string; document: string; blocked: boolean };
};
export const useSearchAccounts = (field: AccountSearchField, value: string, active = true) => {
  const term = (field === "documento" ? value.replace(/\D/g, "") : value.trim()).slice(0, 100);
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(term), 350);
    return () => window.clearTimeout(timer);
  }, [term]);
  const query = useQuery({
    queryKey: ["users-data", "search", field, term],
    queryFn: async ({ signal }) => {
      const response = await api().get<AccountSearchItem[]>(apiRoute.accountSearch, {
        params: { field, q: term },
        signal,
      });
      return response.data;
    },
    enabled: active && term.length >= 3 && term === debounced,
    staleTime: 60_000,
    gcTime: 300_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return {
    ...query,
    canSearch: term.length >= 3,
    isSearching: active && term.length >= 3 && (term !== debounced || query.isFetching),
  };
};
