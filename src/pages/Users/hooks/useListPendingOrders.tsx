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
      setError(null); // 🔹 zera o erro se a requisição for bem sucedida
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

    // 🔹 Atualização automática normal
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      const retry = setTimeout(fetchData, 5000);
      return () => clearTimeout(retry);
    }
  }, [error]);

  return { data, isLoading, error };
};
