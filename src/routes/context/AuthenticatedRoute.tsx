import { createContext } from "react";
import { Outlet } from "react-router-dom";
import { useValidateToken } from "src/hooks/API/useValidateToken";
import { useTitle } from "src/hooks/utils/useTitle";

interface IPrivateRouteContext {
  token: string | null;
}

const PrivateRouteUserContext = createContext<IPrivateRouteContext>({ token: null });

export const AuthenticatedRoute = () => {
  useTitle();
  useValidateToken(); // chama o hook para validar token

  return (
    <PrivateRouteUserContext.Provider value={{ token: localStorage.getItem("token") }}>
      <Outlet />
    </PrivateRouteUserContext.Provider>
  );
};
