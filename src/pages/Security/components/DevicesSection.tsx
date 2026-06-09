import { Trash } from "@phosphor-icons/react";
import { AxiosError } from "axios";
import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export type SecurityDeviceItem = {
  id: string;
  label?: string | null;
  userAgentFirstSeen?: string | null;
  status: "TRUSTED" | "LIMITED" | "BLOCKED";
  approved: boolean;
  ipFirstSeen?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  createdIn: string;
};

interface IDevicesSection {
  devices: SecurityDeviceItem[];
  onReloadProfile: () => Promise<void>;
}

const statusClassMap: Record<SecurityDeviceItem["status"], string> = {
  TRUSTED: "bg-green-100 text-green-700",
  LIMITED: "bg-yellow-100 text-yellow-800",
  BLOCKED: "bg-red-100 text-red-700",
};

export const DevicesSection = ({ devices, onReloadProfile }: IDevicesSection) => {
  const [approvingDeviceId, setApprovingDeviceId] = useState<string | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<SecurityDeviceItem | null>(null);

  const canShowDelete = useMemo(() => devices.length >= 2, [devices.length]);

  const approveDevice = async (deviceId: string) => {
    setApprovingDeviceId(deviceId);
    try {
      await api().post(apiRoute.securityApproveDevice(deviceId));
      responseSuccess("Dispositivo aprovado com sucesso.");
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setApprovingDeviceId(null);
    }
  };

  const deleteTrustedDevice = async () => {
    if (!deviceToDelete) return;

    setDeletingDeviceId(deviceToDelete.id);
    try {
      await api().delete(apiRoute.securityDeleteDevice(deviceToDelete.id));
      responseSuccess("Dispositivo confiável excluído com sucesso.");
      setDeviceToDelete(null);
      await onReloadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setDeletingDeviceId(null);
    }
  };

  return (
    <CardContainer full>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Dispositivos</h2>

        <div className="space-y-3">
          {devices.map((device) => {
            const readableName =
              device.label || device.userAgentFirstSeen || "Dispositivo atual / sem nome amigável";

            const locationText =
              [device.country, device.region, device.city].filter(Boolean).join(" / ") || "-";

            return (
              <div
                key={device.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold">{readableName}</div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClassMap[device.status]
                        }`}
                      >
                        {device.status}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          device.approved
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {device.approved ? "Aprovado" : "Não aprovado"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {device.status === "LIMITED" && (
                      <Button
                        onClick={() => approveDevice(device.id)}
                        disabled={approvingDeviceId === device.id}
                      >
                        {approvingDeviceId === device.id ? "Aprovando..." : "Aprovar dispositivo"}
                      </Button>
                    )}

                    {canShowDelete && device.status === "TRUSTED" && (
                      <button
                        type="button"
                        onClick={() => setDeviceToDelete(device)}
                        className="rounded-full p-2 text-red-600 hover:bg-red-50"
                        title="Excluir dispositivo confiável"
                      >
                        <Trash size={20} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <strong>IP:</strong> {device.ipFirstSeen ?? "-"}
                  </div>
                  <div>
                    <strong>Localização:</strong> {locationText}
                  </div>
                  <div>
                    <strong>Criado em:</strong> {device.createdIn}
                  </div>
                  <div>
                    <strong>Permissão:</strong>{" "}
                    {device.status === "LIMITED"
                      ? "Precisa aprovação manual na tela de segurança"
                      : "Confiável"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {deviceToDelete && (
          <ConfirmationModalButton
            text={`Tem certeza que deseja excluir o dispositivo confiável "${deviceToDelete.label || deviceToDelete.userAgentFirstSeen || "sem nome"}"?`}
            onCancel={() => setDeviceToDelete(null)}
            onConfirm={deleteTrustedDevice}
            confirmDisabled={deletingDeviceId === deviceToDelete.id}
          />
        )}
      </div>
    </CardContainer>
  );
};
