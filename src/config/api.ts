import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const HOST = process.env.REACT_APP_BACK_HOST || "http://localhost";
const PORT = process.env.REACT_APP_BACK_PORT || ":3500";
const NODE_ENV = process.env.REACT_APP_NODE_ENV || "dev";

// sempre usa "/api" (pode sobrescrever via .env se quiser)
const API_PREFIX = process.env.REACT_APP_API_PREFIX || "/api";

// origem base (dev inclui porta; prod usa host direto)
export const BASE_ORIGIN = NODE_ENV === "dev" ? `${HOST}${PORT}` : HOST;

// baseURL final das APIs
export const BASE_API = `${BASE_ORIGIN}${API_PREFIX}`;

// arquivos estáticos
export const fileBase = (fileUrl: string) =>
  `${BASE_ORIGIN}${process.env.REACT_APP_BACK_PATH_ARQUIVO || "/static"}/${fileUrl.replace(/^\/+/, "")}`;

const timeOut = 1000 * 30;
const authHeader = () => ({ authorization: `Bearer ${localStorage.getItem("token")}` });

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
});

// cliente json
export const api = () =>
  axios.create({
    baseURL: BASE_API, // <-- sempre com /api
    timeout: timeOut,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeader(),
    },
  });

// upload
export const apiUpload = () =>
  axios.create({
    baseURL: BASE_API, // <-- sempre com /api
    timeout: timeOut,
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });
