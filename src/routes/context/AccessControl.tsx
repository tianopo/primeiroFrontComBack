import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { app } from "../app";

type AccessControlContextType = {
  token: string;
  name: string;
  acesso: string;
  deviceLimited: boolean;
  hydrated: boolean;
  setAccessFromToken: (token: string) => void;
  clearAccess: () => void;
};

type JwtPayload = {
  name?: string;
  acesso?: string;
  role?: string;
  deviceLimited?: boolean;
};

const AccessControlContext = createContext<AccessControlContextType>({
  token: "",
  name: "",
  acesso: "",
  deviceLimited: false,
  hydrated: false,
  setAccessFromToken: () => undefined,
  clearAccess: () => undefined,
});

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

const redirectToAuth = () => {
  if (window.location.pathname !== app.auth) {
    window.location.replace(app.auth);
  }
};

const showLimitedDeviceWarning = () => {
  toast.warning(
    "Mais de 2 dispositivos conectados. Este dispositivo precisa de confirmação por outro dispositivo já aprovado na página de Segurança.",
  );
};

export const normalizeRole = (value: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [acesso, setAcesso] = useState("");
  const [deviceLimited, setDeviceLimited] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const clearAccess = () => {
    setToken("");
    setName("");
    setAcesso("");
    setDeviceLimited(false);

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("loginTicket");
    sessionStorage.removeItem("availableMethods");
    sessionStorage.removeItem("deviceLimited");
  };

  const setAccessFromToken = (nextToken: string) => {
    const payload = decodeJwtPayload(nextToken);

    const nextName = String(payload?.name ?? "");
    const nextAcesso = String(payload?.acesso ?? payload?.role ?? "");
    const nextDeviceLimited = Boolean(payload?.deviceLimited);

    if (nextDeviceLimited) {
      clearAccess();
      showLimitedDeviceWarning();
      redirectToAuth();
      return;
    }

    setToken(nextToken);
    setName(nextName);
    setAcesso(nextAcesso);
    setDeviceLimited(false);

    localStorage.setItem("token", nextToken);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token") ?? "";

    if (!storedToken) {
      setHydrated(true);
      return;
    }

    const payload = decodeJwtPayload(storedToken);
    const storedDeviceLimited = Boolean(payload?.deviceLimited);

    if (storedDeviceLimited) {
      clearAccess();
      showLimitedDeviceWarning();
      setHydrated(true);
      redirectToAuth();
      return;
    }

    setToken(storedToken);
    setName(String(payload?.name ?? ""));
    setAcesso(String(payload?.acesso ?? payload?.role ?? ""));
    setDeviceLimited(false);
    setHydrated(true);
  }, []);

  const value = useMemo(
    () => ({
      token,
      name,
      acesso,
      deviceLimited,
      hydrated,
      setAccessFromToken,
      clearAccess,
    }),
    [token, name, acesso, deviceLimited, hydrated],
  );

  return <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>;
};

export const useAccessControl = () => useContext(AccessControlContext);
