import axios from "axios";
import { toast } from "react-toastify";

export function responseError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") {
      toast.error("Tente novamente mais tarde.");
      return;
    }

    if (error.code === "ECONNABORTED") {
      toast.error("Sem resposta, aguarde!");
      return;
    }

    const backendMessage = error.response?.data?.message;

    const message =
      typeof backendMessage === "string"
        ? backendMessage
        : Array.isArray(backendMessage)
          ? backendMessage.join("\n")
          : typeof error.response?.data === "string"
            ? error.response.data
            : typeof error.response?.data?.error === "string"
              ? error.response.data.error
              : error.message || "Erro ao realizar a requisição.";

    toast.error(message, {
      autoClose: 20000,
      closeOnClick: false,
      style: {
        whiteSpace: "pre-line",
        maxHeight: "70vh",
        overflowY: "auto",
        width: "500px",
        maxWidth: "90vw",
      },
    });

    return;
  }

  if (error instanceof Error) {
    toast.error(error.message, {
      autoClose: 20000,
      closeOnClick: false,
      style: {
        whiteSpace: "pre-line",
        maxHeight: "70vh",
        overflowY: "auto",
        width: "500px",
        maxWidth: "90vw",
      },
    });

    return;
  }

  toast.error(typeof error === "string" ? error : "Erro inesperado.");
}

export const responseSuccess = (description: string) => toast.success(description);
