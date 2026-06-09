import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const LogsSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const didLoadRef = useRef(false);

  const loadPage = async (nextPage: number, append = false) => {
    setLoading(true);
    try {
      const res = await api().get(apiRoute.securityLogs, {
        params: {
          page: nextPage,
          take: 5,
        },
      });

      const nextItems = res.data?.items ?? [];

      setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setPage(nextPage);
      setHasMore(Boolean(res.data?.hasMore));
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    loadPage(1, false);
  }, []);

  return (
    <CardContainer full>
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Logs</h2>

        <div className="space-y-2">
          {items.map((log: any) => (
            <div key={log.id} className="rounded border p-3 text-sm">
              <div>
                <strong>Evento:</strong> {log.eventType}
              </div>
              <div>
                <strong>Descrição:</strong> {log.description ?? "-"}
              </div>
              <div>
                <strong>IP:</strong> {log.ip ?? "-"}
              </div>
              <div>
                <strong>Dispositivo:</strong> {log.userAgent ?? "-"}
              </div>
              <div>
                <strong>Localização:</strong>{" "}
                {[log.country, log.region, log.city].filter(Boolean).join(" / ") || "-"}
              </div>
              <div>
                <strong>Data:</strong> {log.createdIn}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div>
            <Button onClick={() => loadPage(page + 1, true)} disabled={loading}>
              {loading ? "Buscando..." : "Buscar mais 5 logs"}
            </Button>
          </div>
        )}
      </div>
    </CardContainer>
  );
};
