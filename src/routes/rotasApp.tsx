import { createBrowserRouter } from "react-router-dom";
import { LayoutX } from "src/components/Layout/LayoutX/LayoutX";
import { Auth } from "src/pages/Auth/Auth.views";
import { CryptoTech } from "src/pages/CryptoTech/CryptoTech";
import { Operation } from "src/pages/Operation/Operation";
import { Record } from "src/pages/Record/Record";
import { Test } from "src/pages/Teste/Teste";
import { Transactions } from "src/pages/Transactions/Transactions";
import { app } from "./app";
import { AuthenticatedRoute } from "./context/AuthenticatedRoute";

export const browserRouter = createBrowserRouter([
  {
    children: [
      { path: app.first, element: <CryptoTech /> },
      { path: "*", element: <CryptoTech /> },
      { path: app.auth, element: <Auth /> },
      { path: "/teste", element: <Test /> },
      { path: "/record", element: <Record /> },
    ],
  },
  {
    element: <AuthenticatedRoute />,
    children: [
      {
        element: <LayoutX />,
        children: [
          { path: app.home, element: <Operation /> },
          { path: app.operation, element: <Operation /> },
          { path: app.transactions, element: <Transactions /> },
        ],
      },
    ],
  },
]);
