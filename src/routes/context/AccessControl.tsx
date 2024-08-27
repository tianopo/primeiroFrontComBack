import { jwtDecode } from "jwt-decode";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface TokenPayload {
  email: string;
  acesso: string;
}

interface AccessControlContextType {
  email: string | null;
  acesso: string | null;
}

const AccessControlContext = createContext<AccessControlContextType>({ email: null, acesso: null });

export const AccessControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [acesso, setAcesso] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<TokenPayload>(token);
        setEmail(decodedToken.email);
        setAcesso(decodedToken.acesso);
      } catch (error) {
        console.error("Token inválido:", error);
      }
    }
  }, []);

  return (
    <AccessControlContext.Provider value={{ email, acesso }}>
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
