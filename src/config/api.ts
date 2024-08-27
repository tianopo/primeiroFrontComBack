import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const ip = process.env.REACT_APP_BACK_HOST || "";
const port = process.env.REACT_APP_BACK_PORT;
const prod = process.env.REACT_APP_NODE_ENV;
const timeOut = 1000 * 30;
const authHeader = () => ({ authorization: `Bearer ${localStorage.getItem("token")}` });

export const auth = "auth";

export const fileBase = (fileUrl: string) => `${prod === "prod" ? ip : ip + port}/${fileUrl}`;

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
});

export const api = () =>
  axios.create({
    baseURL: `${prod === "dev" ? ip + port : ip}`,
    timeout: timeOut,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      accesso: "",
      ...authHeader(),
    },
  });

export const apiUpload = () =>
  axios.create({
    baseURL: `${prod === "dev" ? ip + port : ip}`,
    timeout: timeOut,
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });
