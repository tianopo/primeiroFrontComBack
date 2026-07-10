import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AccessControlContextType = {
  token: string;
  name: string;
  acesso: string;
  deviceLimited: boolean;
  hydrated: boolean;
  bankAccountId: string;
  bankBranchNumber: string;
  bankAccountNumber: string;
  bankPixKeys: Array<{ key: string }>;
  setAccessFromToken: (token: string) => void;
  clearAccess: () => void;
};

type JwtPayload = {
  name?: string;
  acesso?: string;
  role?: string;
  deviceLimited?: boolean;
  bankAccountId?: string;
  bankBranchNumber?: string;
  bankAccountNumber?: string;
  bankPixKeys?: Array<{
    key: string;
  }>;
};

const AccessControlContext = createContext<AccessControlContextType>({
  token: "",
  name: "",
  acesso: "",
  deviceLimited: false,
  hydrated: false,
  bankAccountId: "",
  bankBranchNumber: "",
  bankAccountNumber: "",
  bankPixKeys: [],
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
  const [bankAccountId, setBankAccountId] = useState("");
  const [bankBranchNumber, setBankBranchNumber] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankPixKeys, setBankPixKeys] = useState<Array<{ key: string }>>([]);

  const clearAccess = () => {
    setToken("");
    setName("");
    setAcesso("");
    setDeviceLimited(false);
    setBankAccountId("");
    setBankBranchNumber("");
    setBankAccountNumber("");
    setBankPixKeys([]);

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

    setToken(nextToken);
    setName(nextName);
    setAcesso(nextAcesso);
    setDeviceLimited(false);

    setBankAccountId(String(payload?.bankAccountId ?? ""));
    setBankBranchNumber(String(payload?.bankBranchNumber ?? ""));
    setBankAccountNumber(String(payload?.bankAccountNumber ?? ""));
    setBankPixKeys(Array.isArray(payload?.bankPixKeys) ? payload.bankPixKeys : []);

    localStorage.setItem("token", nextToken);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token") ?? "";

    if (!storedToken) {
      setHydrated(true);
      return;
    }

    const payload = decodeJwtPayload(storedToken);

    setToken(storedToken);
    setName(String(payload?.name ?? ""));
    setAcesso(String(payload?.acesso ?? payload?.role ?? ""));
    setDeviceLimited(false);

    setBankAccountId(String(payload?.bankAccountId ?? ""));
    setBankBranchNumber(String(payload?.bankBranchNumber ?? ""));
    setBankAccountNumber(String(payload?.bankAccountNumber ?? ""));
    setBankPixKeys(Array.isArray(payload?.bankPixKeys) ? payload.bankPixKeys : []);

    setHydrated(true);
  }, []);

  const value = useMemo(
    () => ({
      token,
      name,
      acesso,
      deviceLimited,
      hydrated,
      bankAccountId,
      bankBranchNumber,
      bankAccountNumber,
      bankPixKeys,
      setAccessFromToken,
      clearAccess,
    }),
    [
      token,
      name,
      acesso,
      deviceLimited,
      hydrated,
      bankAccountId,
      bankBranchNumber,
      bankAccountNumber,
      bankPixKeys,
    ],
  );
  console.log(acesso, bankAccountId, "AccessControl");
  return <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>;
};

export const useAccessControl = () => useContext(AccessControlContext);
