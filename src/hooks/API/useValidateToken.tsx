import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "src/config/api";
import { app } from "src/routes/app";

export const useValidateToken = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        // Endpoint que retorna o token atual do backend (ajuste conforme sua API)
        await api().get<{ token: string | null }>(app.validateToken);
      } catch (error) {
        // Erro na validação -> remove token e redireciona
        toast.error("Usuário não autenticado");
        localStorage.removeItem("token");
        navigate(app.auth, { replace: true });
      }
    };

    validateToken();
  }, [navigate]);
};
