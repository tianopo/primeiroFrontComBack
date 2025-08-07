import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { app } from "src/routes/app";

export const useTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const pathSnippets = location.pathname.split(app.auth).filter((i) => i);
    const pageTitle =
      pathSnippets.length > 0 ? pathSnippets[pathSnippets.length - 1] : "Authentication";
    const formattedTitle = `${pageTitle.charAt(0).toUpperCase()}${pageTitle.slice(1)}`;

    document.title = `${process.env.REACT_APP_PROJETO} - ${formattedTitle.replace("/", "")}`;
  }, [location.pathname]);
};
