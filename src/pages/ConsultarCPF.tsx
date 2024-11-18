import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "src/config/api";

export const ConsultaCPF = () => {
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resultado, setResultado] = useState<null | string>(null);
  const siteKey = "53be2ee7-5efc-494e-a3ba-c9258649c070"; // meu sitekey: ES_a154f66bdae64f9e9c5076ec41b31501

  // Callback para quando o hCaptcha é resolvido
  const handleVerify = (token: string) => {
    console.log("hCaptcha token:" + token);
    setCaptchaToken(token);
  };

  // Callback para quando o hCaptcha expira
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
      console.log(response);
      setResultado(response.data);
    } catch (error) {
      toast.error("Erro ao consultar CPF:" + error);
      setResultado("Erro ao consultar CPF");
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
          theme="light" // Pode ser 'light' ou 'dark'
          reCaptchaCompat={false}
        />

        <button type="submit">Consultar</button>
      </form>
      {resultado && <div>Resultado: {resultado}</div>}
    </div>
  );
};
