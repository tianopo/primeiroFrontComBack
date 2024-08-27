import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Outlet } from "react-router-dom";
import { useTitle } from "src/hooks/utils/useTitle";

export const PublicLayout = () => {
  useTitle();

  return (
    <div className="flex">
      <div className="bg-gradient hidden h-screen w-1/2 items-center justify-center md:flex">
        <img src="/logo/logo-black.png" alt="logo Reurb" height="267" width="446" />
      </div>
      <div className="flex h-auto w-full flex-col items-center justify-center md:w-1/2">
        <Outlet />
        <div
          className="bg-gradient fixed bottom-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full duration-300 hover:scale-125"
          rel="noopener noreferrer"
          onClick={() => {
            const newWindow = window.open(
              "https://wa.me/5511981452227",
              "_blank",
              "noopener,noreferrer",
            );
            if (newWindow) newWindow.opener = null;
          }}
        >
          <WhatsappLogo color="white" width={24} height={24} weight="bold" />
        </div>
      </div>
    </div>
  );
};
