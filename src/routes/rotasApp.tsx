import { createBrowserRouter } from "react-router-dom";
import { LayoutX } from "src/components/Layout/LayoutX/LayoutX";
import { Auth } from "src/pages/Auth/Auth.views";
import { Closing } from "src/pages/Closing/Closing";
import { ConsultaCPF } from "src/pages/ConsultarCPF";
import { CryptoTech } from "src/pages/CryptoTech/CryptoTech";
import { DocumentsGenerator } from "src/pages/Documents/DocumentsGenerator";
import { Record } from "src/pages/Record/Record";
import { RegisterOrders } from "src/pages/RegisterOrders/RegisterOrders";
import { Usuarios } from "src/pages/Usuarios/Usuarios";
import { app } from "./app";
import { AuthenticatedRoute } from "./context/AuthenticatedRoute";

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
          { path: app.closing, element: <Closing /> },
        ],
      },
    ],
  },
]);
