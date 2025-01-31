import { createBrowserRouter } from "react-router-dom";
import { LayoutX } from "src/components/Layout/LayoutX/LayoutX";
import { Auth } from "src/pages/Auth/Auth.views";
import { Closing } from "src/pages/Closing/Closing.views";
import { ConsultaCPF } from "src/pages/ConsultarCPF.views";
import { Contracts } from "src/pages/Contracts/Contracts.views";
import { CryptoTech } from "src/pages/CryptoTech/CryptoTech.views";
import { PoliticaKYC } from "src/pages/CryptoTech/PoliticaKYC.views";
import { DocumentsGenerator } from "src/pages/Documents/DocumentsGenerator.views";
import { Record } from "src/pages/Record/Record";
import { RegisterOrders } from "src/pages/RegisterOrders/RegisterOrders.views";
import { Users } from "src/pages/Users/Users.views";
import { app } from "./app";
import { AuthenticatedRoute } from "./context/AuthenticatedRoute";
import { PoliticaPLD } from "src/pages/CryptoTech/PoliticaPLD.views";

export const browserRouter = createBrowserRouter([
  {
    children: [
      { path: app.first, element: <CryptoTech /> },
      { path: "*", element: <CryptoTech /> },
      { path: app.kyc, element: <PoliticaKYC /> },
      { path: app.pld, element: <PoliticaPLD /> },
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
          { path: app.home, element: <Users /> },
          { path: app.users, element: <Users /> },
          { path: app.registerOrders, element: <RegisterOrders /> },
          { path: app.tax, element: <DocumentsGenerator /> },
          { path: app.documentsGenerator, element: <Contracts /> },
          { path: app.closing, element: <Closing /> },
        ],
      },
    ],
  },
]);
