import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { api } from "src/config/api";
import { responseError } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";
import { useAccessControl } from "src/routes/context/AccessControl";
import { AntiPhishingSection } from "./components/AntiPhishingSection";
import { DevicesSection, SecurityDeviceItem } from "./components/DevicesSection";
import { LogsSection } from "./components/LogsSection";
import { OtpChannelsSection } from "./components/OtpChannelsSection";
import { PasskeySection } from "./components/PasskeySection";
import { PasswordSection } from "./components/PasswordSection";
import { RecoveryCodesSection } from "./components/RecoveryCodesSanction";
import { TotpSection } from "./components/TotpSection";

type SecurityProfile = {
  hasTotp?: boolean;
  passkeys?: Array<{
    id: string;
    deviceName?: string | null;
    createdIn?: string;
    lastUsedAt?: string | null;
  }>;
  hasAlternativePassword?: boolean;
  hasThirdPassword?: boolean;
  emailOtpAddress?: string | null;
  smsOtpPhone?: string | null;
  hasAntiPhishingCode?: boolean;
  antiPhishingMasked?: string | null;
  antiPhishingCode?: string | null;
  devices?: SecurityDeviceItem[];
};

export const SecurityPage = () => {
  const { acesso } = useAccessControl();
  const [profile, setProfile] = useState<SecurityProfile | null>(null);
  const didLoadRef = useRef(false);

  const loadProfile = async () => {
    try {
      const res = await api().get<SecurityProfile>(apiRoute.securityProfile);
      setProfile(res.data);
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    void loadProfile();
  }, []);

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

      <DevicesSection devices={profile?.devices ?? []} onReloadProfile={loadProfile} />

      <LogsSection />
    </div>
  );
};
