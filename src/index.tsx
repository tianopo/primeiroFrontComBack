import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "./config/api";
import "./index.css";
import "./languages/translation";
import { AccessControlProvider } from "./routes/context/AccessControl";
import { browserRouter } from "./routes/rotasApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AccessControlProvider>
        <ToastContainer />
        <RouterProvider router={browserRouter} />
      </AccessControlProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
