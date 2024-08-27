import { AxiosError } from "axios";
import { toast } from "react-toastify";

export function responseError(err: AxiosError<any, any> | string) {
  let errorMessage;

  if (err instanceof AxiosError) errorMessage = err.response?.data?.message || "Network Error";
  else errorMessage = err;

  if (err instanceof AxiosError && err.code === "ERR_NETWORK")
    toast.error("Server has no response");
  else if (err instanceof AxiosError && err.code === "ECONNABORTED") toast.error("No reply!");
  else toast.error(errorMessage);
}

export const responseSuccess = (description: string) => toast.success(description);
