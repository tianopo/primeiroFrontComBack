import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "src/config/api";

export const ConsultaCPF = () => {
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [htmlResponse, setHtmlResponse] = useState<string>("");

  const siteKey = "53be2ee7-5efc-494e-a3ba-c9258649c070";

  const handleVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleExpire = () => {
    toast.success("hCaptcha expirado. Por favor, resolva novamente.");
    setCaptchaToken(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.warning("Por favor, resolva o captcha antes de continuar.");
      return;
    }

    try {
      const response = await api().post("http://localhost:3500/compliance/consultar-cpf", {
        cpf,
        dataNascimento,
        captchaResponse: captchaToken,
      });
      const blob = new Blob([response.data], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Erro ao consultar CPF:" + error);
      setHtmlResponse("Erro ao consultar CPF");
    }
  };

  return (
    <div>
      <h2>Consulta Receita Federal</h2>
      <form onSubmit={handleSubmit}>
        <label>
          CPF:
          <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} />
        </label>
        <label>
          Data de Nascimento:
          <input
            type="text"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
          />
        </label>
        <HCaptcha
          sitekey={siteKey}
          onVerify={handleVerify}
          onExpire={handleExpire}
          theme="light"
          reCaptchaCompat={false}
        />
        <button type="submit">Consultar</button>
      </form>
    </div>
  );
};
