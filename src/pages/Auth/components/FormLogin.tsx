import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { ILoginDto, useLogin } from "src/pages/Auth/hooks/useLogin";

export const FormLogin = () => {
  const { mutate, isPending, context } = useLogin();
  const {
    formState: { errors },
  } = context;
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = (data: ILoginDto) => {
    mutate(data);
  };

  return (
    <FormProvider {...context}>
      <FormX onSubmit={onSubmit}>
        <FlexCol className="w-fit items-center gap-1">
          <InputX title="E-mail" placeholder="johnwick@domain.com" typ="email" required />
          <InputX
            title="Password"
            placeholder="*******"
            typ={showPassword ? "text" : "password"}
            required
          />
          <label className="text-primaria-light flex w-11/12 flex-row items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="
              bg-primaria-light
              h-4
              w-4
              appearance-none
              rounded-6
              outline-none
              checked:bg-slate-800
              focus:outline-none"
            />
            {showPassword ? "Hide" : "Show"} Password
          </label>
          <button
            disabled={isPending || Object.keys(errors).length > 0}
            className="w-full rounded-4 bg-primary p-2 font-bold text-white"
          >
            {!isPending ? "LOGIN" : "loading..."}
          </button>
        </FlexCol>
      </FormX>
    </FormProvider>
  );
};
