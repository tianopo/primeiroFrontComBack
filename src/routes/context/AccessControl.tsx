import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface TokenPayload {
  document: string;
  acesso: string;
}

interface AccessControlContextType {
  document: string | null;
  acesso: string | null;
}

const AccessControlContext = createContext<AccessControlContextType>({
  document: null,
  acesso: null,
});

export const AccessControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [document, setDocument] = useState<string | null>(null);
  const [acesso, setAcesso] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<TokenPayload>(token);
        setDocument(decodedToken.document);
        setAcesso(decodedToken.acesso);
      } catch (error) {
        console.error("Token inválido:", error);
      }
    }
  }, []);

  return (
    <AccessControlContext.Provider value={{ document, acesso }}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = (): AccessControlContextType => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error(
      "o controle de acesso deve ser usado dentro de um provedor de controle de acesso",
    );
  }
  return context;
};
