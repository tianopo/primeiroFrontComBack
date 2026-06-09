import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useAccessControl } from "src/routes/context/AccessControl";
import { AntiPhishingSection } from "./components/AntiPhishingSection";
import { LogsSection } from "./components/LogsSection";
import { OtpChannelsSection } from "./components/OtpChannelsSection";
import { PasskeySection } from "./components/PasskeySection";
import { PasswordSection } from "./components/PasswordSection";
import { RecoveryCodesSection } from "./components/RecoveryCodesSanction";
import { TotpSection } from "./components/TotpSection";

export const SecurityPage = () => {
  const { acesso } = useAccessControl();
  const [profile, setProfile] = useState<any>(null);
  const [approvingDeviceId, setApprovingDeviceId] = useState<string | null>(null);
  const didLoadRef = useRef(false);

  const loadProfile = async () => {
    const res = await api().get(apiRoute.securityProfile);
    setProfile(res.data);
  };

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    loadProfile();
  }, []);

  const handleApproveDevice = async (deviceId: string) => {
    setApprovingDeviceId(deviceId);
    try {
      await api().post(apiRoute.securityDeviceApprove, { deviceId });
      responseSuccess("Dispositivo aprovado com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setApprovingDeviceId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold">Segurança</h1>

      <TotpSection enabled={Boolean(profile?.hasTotp)} onReloadProfile={loadProfile} />

      <PasskeySection passkeys={profile?.passkeys ?? []} onReloadProfile={loadProfile} />

      <PasswordSection
        hasAlternativePassword={Boolean(profile?.hasAlternativePassword)}
        hasThirdPassword={Boolean(profile?.hasThirdPassword)}
        canUseThirdPassword={acesso === "Master" || acesso === "Bank"}
        onReloadProfile={loadProfile}
      />

      <OtpChannelsSection profile={profile} onReloadProfile={loadProfile} />

      {/* <AntiPhishingSection profile={profile} onReloadProfile={loadProfile} /> */}

      <RecoveryCodesSection />

      <CardContainer full>
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Dispositivos</h2>

          <div className="space-y-2">
            {(profile?.devices ?? []).map((device: any) => (
              <div key={device.id} className="rounded border p-3">
                <div>
                  <strong>Nome:</strong>{" "}
                  {device.label ||
                    device.userAgentFirstSeen ||
                    "Dispositivo atual / sem nome amigável"}
                </div>
                <div>
                  <strong>Status:</strong> {device.status}
                </div>
                <div>
                  <strong>Aprovado:</strong> {device.approved ? "Sim" : "Não"}
                </div>
                <div>
                  <strong>IP:</strong> {device.ipFirstSeen ?? "-"}
                </div>
                <div>
                  <strong>Localização:</strong>{" "}
                  {[device.country, device.region, device.city].filter(Boolean).join(" / ") || "-"}
                </div>
                <div>
                  <strong>Criado em:</strong> {device.createdIn}
                </div>

                {!device.approved && (
                  <Button
                    onClick={() => handleApproveDevice(device.id)}
                    disabled={approvingDeviceId === device.id}
                  >
                    {approvingDeviceId === device.id ? "Aprovando..." : "Aprovar dispositivo"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContainer>

      <LogsSection />
    </div>
  );
};
