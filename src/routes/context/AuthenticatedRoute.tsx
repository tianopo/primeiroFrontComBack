import { createContext } from "react";
import { Outlet } from "react-router-dom";
import { useToken } from "src/hooks/API/useToken";
import { useTitle } from "src/hooks/utils/useTitle";

interface IPrivateRouteContext {
  token: string | null;
}

const PrivateRouteUserContext = createContext<IPrivateRouteContext>({ token: null });

export const AuthenticatedRoute = () => {
  useTitle();
  useToken();

  return (
    <PrivateRouteUserContext.Provider value={{ token: localStorage.getItem("token") }}>
      <Outlet />
    </PrivateRouteUserContext.Provider>
  );
};
