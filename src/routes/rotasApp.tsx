import { createBrowserRouter } from "react-router-dom";
import { LayoutX } from "src/components/Layout/LayoutX/LayoutX";
import { Auth } from "src/pages/Auth/Auth.views";
import { ConsultaCPF } from "src/pages/ConsultarCPF";
import { CryptoTech } from "src/pages/CryptoTech/CryptoTech";
import { Usuarios } from "src/pages/Usuarios/Usuarios";
import { Record } from "src/pages/Record/Record";
import { RegisterOrders } from "src/pages/RegisterOrders/RegisterOrders";
import { app } from "./app";
import { AuthenticatedRoute } from "./context/AuthenticatedRoute";
import { DocumentsGenerator } from "src/pages/Documents/DocumentsGenerator";

export const browserRouter = createBrowserRouter([
  {
    children: [
      { path: app.first, element: <CryptoTech /> },
      { path: "*", element: <CryptoTech /> },
      { path: app.auth, element: <Auth /> },
      { path: "/record", element: <Record /> },
    ],
  },
  {
    element: <AuthenticatedRoute />,
    children: [
      {
        element: <LayoutX />,
        children: [
          { path: "/teste", element: <ConsultaCPF /> },
          { path: app.home, element: <Usuarios /> },
          { path: app.users, element: <Usuarios /> },
          { path: app.registerOrders, element: <RegisterOrders /> },
          { path: app.documentsGenerator, element: <DocumentsGenerator /> },
        ],
      },
    ],
  },
]);
