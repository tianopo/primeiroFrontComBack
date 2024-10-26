import { useState } from "react";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FormLogin } from "./components/FormLogin";
import { FormRegister } from "./components/FormRegister";

export const Auth = () => {
  const [showRegister, setShowRegister] = useState(false);
  const loginOrRegister = !showRegister ? "LOGIN" : "REGISTER";

  return (
    <section
      className={`flex h-screen items-center justify-center bg-gradient-to-r from-slate-600 to-slate-200 p-2`}
    >
      <div className="w-2/3 rounded-xl bg-neutral-600 p-3 shadow-2xl md:w-96">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          <h2 className="text-4xl font-semibold text-white">{loginOrRegister}</h2>
          {showRegister ? <FormRegister /> : <FormLogin />}
          <FlexCol className="items-center">
            <p className="break-all font-semibold text-white">
              {showRegister ? "Already have an account?" : "Don't have an account?"}
            </p>
            <p className="cursor-pointer font-semibold text-white hover:underline">
              {showRegister ? "Login" : "Register"}
            </p>
          </FlexCol>
        </div>
      </div>
    </section>
  );
};
