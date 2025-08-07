import { createBrowserRouter } from "react-router-dom";
import { Unauthorized } from "src/components/Feedback/Unathorized.views";
import { LayoutX } from "src/components/Layout/LayoutX/LayoutX";
import { Auth } from "src/pages/Auth/Auth.views";
import { Closing } from "src/pages/Closing/Closing.views";
import { ConsultaCPF } from "src/pages/ConsultarCPF.views";
import { Contracts } from "src/pages/Contracts/Contracts.views";
import { CryptoTech } from "src/pages/CryptoTech/CryptoTech.views";
import { Home } from "src/pages/Home/Home";
import { Record } from "src/pages/Record/Record";
import { RegisterOrders } from "src/pages/RegisterOrders/RegisterOrders.views";
import { Users } from "src/pages/Users/Users.views";
import { app } from "./app";
import { AuthenticatedRoute } from "./context/AuthenticatedRoute";
import { RoleProtectedRoute } from "./context/RoleProtectedRoute";

export const browserRouter = createBrowserRouter([
  {
    children: [
      { path: app.first, element: <CryptoTech /> },
      { path: "*", element: <CryptoTech /> },
      { path: app.auth, element: <Auth /> },
      { path: "/record", element: <Record /> },
      { path: app.unauthorized, element: <Unauthorized /> },
    ],
  },
  {
    element: <AuthenticatedRoute />,
    children: [
      {
        element: <LayoutX />,
        children: [
          { path: "/teste", element: <ConsultaCPF /> },
          { path: app.home, element: <Home /> },
          {
            element: <RoleProtectedRoute allowedRoles={["Master"]} />,
            children: [
              { path: app.users, element: <Users /> },
              { path: app.registerOrders, element: <RegisterOrders /> },
              { path: app.documentsGenerator, element: <Contracts /> },
              { path: app.closing, element: <Closing /> },
            ],
          },
        ],
      },
    ],
  },
]);
