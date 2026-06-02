import { AxiosError } from "axios";
import QRCode from "qrcode";
import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

interface ITotpSection {
  enabled?: boolean;
  onReloadProfile: () => Promise<void>;
}

type SetupMode = "qr" | "manual";

export const TotpSection = ({ enabled, onReloadProfile }: ITotpSection) => {
  const [totpSetup, setTotpSetup] = useState<any>(null);
  const [totpCode, setTotpCode] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [setupMode, setSetupMode] = useState<SetupMode>("qr");
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const [setupLoading, setSetupLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);

  const handleTotpCodeChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(onlyNumbers);
  };

  const resetSetupState = () => {
    setTotpSetup(null);
    setTotpCode("");
    setQrDataUrl("");
    setSetupMode("qr");
  };

  const handleTotpSetup = async () => {
    setSetupLoading(true);
    try {
      const res = await api().post(apiRoute.securityTotpSetup);
      setTotpSetup(res.data);

      const dataUrl = await QRCode.toDataURL(res.data.otpauth);
      setQrDataUrl(dataUrl);

      responseSuccess(res?.data?.message ?? "Configuração do Google Authenticator gerada.");
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleTotpVerify = async () => {
    if (!/^\d{6}$/.test(totpCode)) {
      responseError({
        response: {
          data: {
            message: "O código do Google Authenticator deve conter exatamente 6 números.",
          },
        },
      } as any);
      return;
    }

    setVerifyLoading(true);
    try {
      const res = await api().post(apiRoute.securityTotpVerify, { code: totpCode });

      responseSuccess(res?.data?.message ?? "Google Authenticator ativado com sucesso.");
      resetSetupState();
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleTotpDisable = async () => {
    setDisableLoading(true);
    try {
      await api().delete(apiRoute.securityTotpDelete);
      resetSetupState();
      setConfirmRemoveOpen(false);
      responseSuccess("Google Authenticator removido com sucesso.");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setDisableLoading(false);
    }
  };

  const copyText = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      responseSuccess("Copiado com sucesso.");
    } catch {
      responseError({
        response: {
          data: {
            message: "Não foi possível copiar.",
          },
        },
      } as any);
    }
  };

  const showActivationFlow = !enabled && !!totpSetup;

  return (
    <CardContainer full>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Google Authenticator</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              enabled ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {enabled ? "Ativado" : "Não ativado"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {!enabled && !totpSetup && (
            <Button
              onClick={handleTotpSetup}
              disabled={setupLoading || verifyLoading || disableLoading}
            >
              {setupLoading ? "Gerando..." : "Ativar Google Authenticator"}
            </Button>
          )}

          {enabled && (
            <Button
              onClick={() => setConfirmRemoveOpen(true)}
              disabled={disableLoading || setupLoading || verifyLoading}
            >
              {disableLoading ? "Removendo..." : "Remover Google Authenticator"}
            </Button>
          )}
        </div>

        {showActivationFlow && (
          <div className="mt-2 flex flex-col gap-4 rounded-lg border border-gray-200 p-4">
            <div className="flex gap-2">
              <Button onClick={() => setSetupMode("qr")}>Usar QR Code</Button>
              <Button onClick={() => setSetupMode("manual")}>Usar chave manual</Button>
            </div>

            {setupMode === "qr" && (
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code do Google Authenticator"
                    className="h-44 w-44 rounded border border-gray-200"
                  />
                )}

                <div className="flex flex-1 flex-col gap-3">
                  <div className="text-sm text-gray-700">
                    1. Abra o Google Authenticator no celular.
                    <br />
                    2. Toque em <strong>+</strong>.
                    <br />
                    3. Escolha <strong>Escanear QR code</strong>.
                    <br />
                    4. Depois digite abaixo o código de 6 números gerado no aplicativo.
                  </div>
                </div>
              </div>
            )}

            {setupMode === "manual" && (
              <div className="flex flex-col gap-3 rounded border border-gray-200 p-3">
                <div className="text-sm text-gray-700">
                  No Google Authenticator:
                  <br />
                  1. Toque em <strong>+</strong>
                  <br />
                  2. Escolha <strong>Inserir chave de configuração</strong>
                  <br />
                  3. Preencha os dados abaixo
                </div>

                <div className="rounded bg-gray-50 p-3 text-sm">
                  <div className="mb-2">
                    <strong>Nome da conta:</strong> {totpSetup?.accountName ?? "-"}
                  </div>
                  <div className="mb-2">
                    <strong>Emissor:</strong> {totpSetup?.issuer ?? "-"}
                  </div>
                  <div className="mb-2 break-all">
                    <strong>Chave secreta:</strong> {totpSetup?.secret ?? "-"}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => copyText(totpSetup?.secret)}>Copiar chave</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <input
                value={totpCode}
                onChange={(e) => handleTotpCodeChange(e.target.value)}
                placeholder="Código de 6 dígitos"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="rounded border px-3 py-2"
              />

              <Button
                onClick={handleTotpVerify}
                disabled={verifyLoading || !/^\d{6}$/.test(totpCode)}
              >
                {verifyLoading ? "Confirmando..." : "Confirmar TOTP"}
              </Button>
            </div>
          </div>
        )}

        {confirmRemoveOpen && (
          <ConfirmationModalButton
            text="Tem certeza que deseja remover o Google Authenticator? Você deixará de usar este fator extra de segurança até cadastrar novamente."
            onCancel={() => setConfirmRemoveOpen(false)}
            onConfirm={handleTotpDisable}
            confirmDisabled={disableLoading}
          />
        )}
      </div>
    </CardContainer>
  );
};
