import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { queryClient } from "src/config/api";
import { app } from "src/routes/app";

export const useToken = () => {
  const navigate = useNavigate();
  const TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 3000;

  useQuery({
    queryKey: ["token-data"],
    queryFn: () => {
      const tokenData = queryClient.getQueryData<{ token: string; timestamp: number }>([
        "token-data",
      ]);

      if (tokenData && Date.now() - tokenData.timestamp > TOKEN_EXPIRE_TIME) {
        localStorage.removeItem("token");
        queryClient.removeQueries({ queryKey: ["token-data"] });
        toast.warning("Tempo de login expirado");
        navigate(app.login);
        return null;
      }

      return tokenData || { token: null, timestamp: Date.now() };
    },
    staleTime: TOKEN_EXPIRE_TIME,
    refetchInterval: TOKEN_EXPIRE_TIME,
  });
};
