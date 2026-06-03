import { AxiosError } from "axios";
import { useState } from "react";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export const useSensitiveAction = () => {
  const [challenge, setChallenge] = useState<any>(null);

  const start = async (action: string) => {
    try {
      const res = await api().post(apiRoute.securitySensitiveActionStart, { action });
      const data = res.data;

      if (!data.required || data.method === "NONE") {
        return undefined;
      }

      setChallenge(data);
      return null;
    } catch (error) {
      responseError(error as AxiosError);
      return null;
    }
  };

  const clear = () => setChallenge(null);

  return {
    challenge,
    start,
    clear,
  };
};
