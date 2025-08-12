import { ArrowFatLeft } from "@phosphor-icons/react";
import { ChangeEvent, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FlexCol } from "src/components/Flex/FlexCol";
import { FormX } from "src/components/Form/FormX";
import { InputX } from "src/components/Form/Input/InputX";
import { ILoginDto, useLogin } from "src/pages/Auth/hooks/useLogin";
import { app } from "src/routes/app";
import { formatCPFOrCNPJ } from "src/utils/formats";

export const FormLogin = () => {
  const { mutate, isPending, context } = useLogin();
  const navigate = useNavigate();
  const [document, setDocument] = useState<string>("");
  const {
    formState: { errors },
    setValue,
  } = context;
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = (data: ILoginDto) => {
    mutate(data);
  };

  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedDocument = formatCPFOrCNPJ(e.target.value);
    setValue("document", formattedDocument);
    setDocument(formattedDocument);
  };

  return (
    <FormProvider {...context}>
      <FormX onSubmit={onSubmit}>
        <FlexCol className="w-fit items-center gap-1">
          <InputX
            title="Document"
            placeholder="apenas números"
            value={document}
            onChange={handleDocumentChange}
            required
          />
          <InputX
            title="Password"
            placeholder="*******"
            typ={showPassword ? "text" : "password"}
            required
          />
          <label className="flex w-11/12 flex-row items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="
              h-4
              w-4
              appearance-none
              rounded-6
              bg-primary
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
          <button
            className="flex w-full cursor-pointer items-center rounded-6 py-1 font-semibold hover:text-primary"
            onClick={() => navigate(app.first)}
          >
            <ArrowFatLeft width={20} height={17} weight="duotone" />
            Voltar
          </button>
        </FlexCol>
      </FormX>
    </FormProvider>
  );
};
