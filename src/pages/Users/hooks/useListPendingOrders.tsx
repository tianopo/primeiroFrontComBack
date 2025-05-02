import { useEffect, useState } from "react";
import { api } from "src/config/api";
import { apiRoute } from "src/routes/api";

export const useListPendingOrders = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    try {
      const result = await api().get(apiRoute.pendingOrders);
      setData(result.data || []);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
};
