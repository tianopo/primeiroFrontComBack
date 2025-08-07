// AccessControl.tsx
import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface TokenPayload {
  document: string;
  acesso: string;
}

interface AccessControlContextType {
  document: string | null;
  acesso: string | null;
  setAccessFromToken: (token: string) => void;
}

const AccessControlContext = createContext<AccessControlContextType>({
  document: null,
  acesso: null,
  setAccessFromToken: () => {},
});

export const AccessControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [document, setDocument] = useState<string | null>(null);
  const [acesso, setAcesso] = useState<string | null>(null);

  const setAccessFromToken = (token: string) => {
    try {
      const decodedToken = jwtDecode<TokenPayload>(token);
      setDocument(decodedToken.document);
      setAcesso(decodedToken.acesso);
    } catch (error) {
      console.error("Token inválido:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAccessFromToken(token);
  }, []);

  return (
    <AccessControlContext.Provider value={{ document, acesso, setAccessFromToken }}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = (): AccessControlContextType => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error("useAccessControl must be used within an AccessControlProvider");
  }
  return context;
};
