import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export interface GowdStatementItem {
  timestamp: string;
  amount: number;
  currency: string;
  operation?: string;
  description?: string;
  balance?: number;
  transactionType?: string;
  method?: string;
  status?: string;
  direction?: "IN" | "OUT" | string;
  identifier?: string;
  payer?: {
    name?: string;
    document?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };
  payee?: {
    name?: string;
    document?: string;
    bankCode?: string;
    bankName?: string;
    branch?: string;
    account?: string;
    pixKey?: string;
  };
  endToEndId?: string;
  orderId?: string;
  code?: string;
  transactionId?: string;
  raw?: unknown;
}

export interface GowdStatementResponse {
  count: number;
  page: number;
  limit: number;
  sort: "asc" | "desc" | string;
  hasNext: boolean;
  items: GowdStatementItem[];
}

type GowdScope = "own" | "baas";

type UseGowdStatementParams = {
  startDate: string;
  endDate: string;
  page?: number;
  size?: number;
  scope?: GowdScope;
  accountId?: string;
};

const MANUAL_REFRESH_COOLDOWN_MS = 30_000;

export const useGowdStatement = ({
  startDate,
  endDate,
  page = 1,
  size = 1000,
  scope = "own",
  accountId,
}: UseGowdStatementParams) => {
  const [lastManualRefreshAt, setLastManualRefreshAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  const route = scope === "baas" ? apiRoute.gowd.baasStatement : apiRoute.gowd.statement;

  const query = useQuery<GowdStatementResponse>({
    queryKey: ["gowd-statement", scope, accountId, startDate, endDate, page, size],
    queryFn: async () => {
      const response = await api().post<GowdStatementResponse>(
        route,
        {
          startDate: `${startDate}T00:00:00.000Z`,
          endDate: `${endDate}T23:59:59.999Z`,
          currency: "BRL",
          page,
          pageSize: size,
          direction: "DESC",
        },
        {
          params: scope === "baas" && accountId ? { accountId } : undefined,
        },
      );

      return response.data;
    },
    enabled: !!startDate && !!endDate && (scope === "own" || !!accountId),
    refetchInterval: scope === "own" ? 30_000 : false,
    retry: false,
  });

  useEffect(() => {
    if (query.error) {
      responseError(query.error as AxiosError);
    }
  }, [query.error]);

  useEffect(() => {
    if (scope !== "baas") {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [scope]);

  const manualRefreshCooldown = useMemo(() => {
    if (scope !== "baas") {
      return 0;
    }

    const remaining = MANUAL_REFRESH_COOLDOWN_MS - (now - lastManualRefreshAt);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, [scope, now, lastManualRefreshAt]);

  const canManualRefresh =
    scope !== "baas" ? false : manualRefreshCooldown <= 0 && !query.isFetching;

  const refreshNow = async () => {
    if (scope !== "baas") {
      return;
    }

    if (!accountId) {
      return;
    }

    if (!canManualRefresh) {
      return;
    }

    setLastManualRefreshAt(Date.now());
    await query.refetch();
  };

  return {
    ...query,
    refreshNow,
    canManualRefresh,
    manualRefreshCooldown,
  };
};
