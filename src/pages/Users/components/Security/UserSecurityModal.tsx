import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";
import { ConfirmationModalButton } from "src/components/Modal/ConfirmationModalButton";
import { Modal } from "src/components/Modal/Modal";
import { api } from "src/config/api";
import { responseError, responseSuccess } from "src/config/responseErrors";
import { apiRoute } from "src/routes/api";

export enum Role {
  User = "User",
  Worker = "Worker",
  Cliente = "Client",
  Bank = "Bank",
  Admin = "Admin",
  Master = "Master",
}

type UserSecurityProfile = {
  userId: string;
  role: string;
  hasTotp: boolean;
  hasAlternativePassword: boolean;
  emailOtpAddress: string | null;
  smsOtpPhone: string | null;
  passkeys: Array<{
    id: string;
    deviceName: string | null;
    createdIn: string;
    lastUsedAt: string | null;
    backedUp: boolean;
  }>;
  devices: Array<{
    id: string;
    label: string | null;
    userAgentFirstSeen: string | null;
    status: string;
    approved: boolean;
    ipFirstSeen: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    createdIn: string;
  }>;
};

type LogItem = {
  id: string;
  eventType: string;
  description: string | null;
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  createdIn: string;
};

type TabKey = "role" | "channels" | "devices" | "logs";

const roleOptions = Object.values(Role);

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 min-w-0">
        <h3 className="break-words text-lg font-semibold">{title}</h3>
        {subtitle ? <p className="mt-1 break-words text-sm text-gray-600">{subtitle}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
};

const ActionRow = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
      {children}
    </div>
  );
};

const Actions = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex min-w-0 flex-wrap gap-2 xl:justify-end">{children}</div>;
};

const TabButton = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`max-w-full rounded-full border px-4 py-2 text-left text-sm font-semibold transition-colors ${
        active
          ? "border-black bg-black text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:text-black"
      }`}
    >
      <span className="block break-words">{children}</span>
    </button>
  );
};

export const UserSecurityModal = ({
  userId,
  userLabel,
  open,
  onClose,
}: {
  userId: string;
  userLabel: string;
  open: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("role");
  const [profile, setProfile] = useState<UserSecurityProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [role, setRole] = useState("");
  const [alternativePassword, setAlternativePassword] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsHasMore, setLogsHasMore] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    title: string;
    onConfirm?: () => Promise<void>;
  }>({ open: false, title: "" });

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await api().get<UserSecurityProfile>(apiRoute.securityAdminProfile(userId));
      setProfile(res.data);
      setRole(res.data.role ?? "");
      setEmailOtp(res.data.emailOtpAddress ?? "");
      setSmsOtp(res.data.smsOtpPhone ?? "");
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadLogs = async (page = 1, append = false) => {
    setLogsLoading(true);
    try {
      const res = await api().get(apiRoute.securityAdminLogs(userId), {
        params: { page, take: 5 },
      });

      const nextItems = (res.data?.items ?? []) as LogItem[];

      setLogs((prev) => (append ? [...prev, ...nextItems] : nextItems));
      setLogsPage(page);
      setLogsHasMore(Boolean(res.data?.hasMore));
    } catch (error) {
      responseError(error as AxiosError);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadProfile();
    void loadLogs(1, false);
  }, [open, userId]);

  const trustedDeviceCount = useMemo(
    () => (profile?.devices ?? []).filter((item) => item.status === "TRUSTED").length,
    [profile?.devices],
  );

  const saveRole = async () => {
    try {
      await api().patch(apiRoute.securityAdminUpdateRole(userId), { role });
      responseSuccess("Role atualizado com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const deleteTotp = async () => {
    try {
      await api().delete(apiRoute.securityAdminDeleteTotp(userId));
      responseSuccess("Google Authenticator removido com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const deletePasskey = async (passkeyId: string) => {
    try {
      await api().delete(apiRoute.securityAdminDeletePasskey(userId, passkeyId));
      responseSuccess("Chave de acesso removida com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const saveAlternativePassword = async () => {
    try {
      await api().patch(apiRoute.securityAdminSetAlternativePassword(userId), {
        alternativePassword,
      });
      responseSuccess("Senha alternativa salva com sucesso.");
      setAlternativePassword("");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const deleteAlternativePassword = async () => {
    try {
      await api().delete(apiRoute.securityAdminDeleteAlternativePassword(userId));
      responseSuccess("Senha alternativa removida com sucesso.");
      setAlternativePassword("");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const saveEmailOtp = async () => {
    try {
      await api().patch(apiRoute.securityAdminSetEmailOtp(userId), {
        email: emailOtp,
      });
      responseSuccess("E-mail OTP salvo com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const deleteEmailOtp = async () => {
    try {
      await api().delete(apiRoute.securityAdminDeleteEmailOtp(userId));
      responseSuccess("E-mail OTP removido com sucesso.");
      setEmailOtp("");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const saveSmsOtp = async () => {
    try {
      await api().patch(apiRoute.securityAdminSetSmsOtp(userId), {
        phone: smsOtp,
      });
      responseSuccess("SMS OTP salvo com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const deleteSmsOtp = async () => {
    try {
      await api().delete(apiRoute.securityAdminDeleteSmsOtp(userId));
      responseSuccess("SMS OTP removido com sucesso.");
      setSmsOtp("");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const regenerateRecoveryCodes = async () => {
    try {
      const res = await api().post(apiRoute.securityAdminRegenerateRecoveryCodes(userId));
      const codes = (res.data?.codes ?? []) as string[];
      responseSuccess("Novos códigos de recuperação gerados com sucesso.");
      window.alert(codes.join("\n"));
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      await api().delete(apiRoute.securityAdminDeleteDevice(userId, deviceId));
      responseSuccess("Dispositivo removido com sucesso.");
      await loadProfile();
    } catch (error) {
      responseError(error as AxiosError);
    }
  };

  if (!open) return null;

  return (
    <Modal onClose={onClose}>
      <div className="flex h-[88vh] w-full min-w-0 max-w-[min(1280px,96vw)] flex-col gap-4 overflow-hidden rounded-2xl bg-white p-3 sm:p-4 md:p-6">
        <header className="shrink-0 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold">Security do usuário</h2>
          <p className="mt-1 text-sm text-gray-600">{userLabel}</p>
        </header>

        <div className="flex min-w-0 shrink-0 flex-wrap gap-2 overflow-x-hidden">
          <TabButton active={activeTab === "role"} onClick={() => setActiveTab("role")}>
            Role / Authenticator / Chaves
          </TabButton>
          <TabButton active={activeTab === "channels"} onClick={() => setActiveTab("channels")}>
            Senha alt / Email / SMS / Recovery
          </TabButton>
          <TabButton active={activeTab === "devices"} onClick={() => setActiveTab("devices")}>
            Dispositivos
          </TabButton>
          <TabButton active={activeTab === "logs"} onClick={() => setActiveTab("logs")}>
            Logs
          </TabButton>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          {loadingProfile ? (
            <div className="flex h-full items-center justify-center text-base text-gray-600">
              Carregando...
            </div>
          ) : (
            <>
              {activeTab === "role" && (
                <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-2">
                  <SectionCard title="Role" subtitle="Altere a função do usuário no sistema.">
                    <ActionRow>
                      <div className="w-full min-w-0">
                        <Select
                          title="Role"
                          options={roleOptions}
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        />
                      </div>
                      <Actions>
                        <Button onClick={saveRole}>Salvar role</Button>
                      </Actions>
                    </ActionRow>
                  </SectionCard>

                  <SectionCard
                    title="Google Authenticator"
                    subtitle={`Status: ${profile?.hasTotp ? "Ativado" : "Não ativado"}`}
                  >
                    {profile?.hasTotp ? (
                      <Actions>
                        <Button
                          onClick={() =>
                            setConfirmDelete({
                              open: true,
                              title: "Tem certeza que deseja remover o Google Authenticator?",
                              onConfirm: deleteTotp,
                            })
                          }
                        >
                          Remover Google Authenticator
                        </Button>
                      </Actions>
                    ) : (
                      <p className="text-sm text-gray-600">
                        O usuário não possui Google Authenticator ativo.
                      </p>
                    )}
                  </SectionCard>

                  <SectionCard
                    title="Chaves de acesso"
                    subtitle="Gerencie as passkeys cadastradas para este usuário."
                  >
                    {(profile?.passkeys ?? []).length === 0 ? (
                      <p className="text-sm text-gray-600">Nenhuma chave cadastrada.</p>
                    ) : (
                      <div className="space-y-3">
                        {profile?.passkeys.map((passkey) => (
                          <div
                            key={passkey.id}
                            className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 xl:grid-cols-[minmax(0,1fr)_auto]"
                          >
                            <div className="min-w-0 break-words">
                              <div className="break-words font-semibold">
                                {passkey.deviceName ?? "Dispositivo sem nome"}
                              </div>
                              <div className="mt-1 text-sm text-gray-600">
                                Criado em: {passkey.createdIn}
                              </div>
                              <div className="text-sm text-gray-600">
                                Último uso: {passkey.lastUsedAt ?? "-"}
                              </div>
                            </div>

                            <Actions>
                              <Button
                                onClick={() =>
                                  setConfirmDelete({
                                    open: true,
                                    title: `Tem certeza que deseja excluir a chave "${passkey.deviceName ?? "sem nome"}"?`,
                                    onConfirm: async () => deletePasskey(passkey.id),
                                  })
                                }
                              >
                                Excluir chave
                              </Button>
                            </Actions>
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}

              {activeTab === "channels" && (
                <div className="grid min-w-0 grid-cols-1 gap-4">
                  <SectionCard
                    title="Senha alternativa"
                    subtitle={`Status: ${profile?.hasAlternativePassword ? "Cadastrada" : "Não cadastrada"}`}
                  >
                    <ActionRow>
                      <div className="w-full">
                        <InputX
                          title="Nova senha alternativa"
                          value={alternativePassword}
                          onChange={(e) => setAlternativePassword(e.target.value)}
                        />
                      </div>

                      <Actions>
                        <Button onClick={saveAlternativePassword}>Salvar</Button>
                        {profile?.hasAlternativePassword && (
                          <Button
                            onClick={() =>
                              setConfirmDelete({
                                open: true,
                                title: "Tem certeza que deseja excluir a senha alternativa?",
                                onConfirm: deleteAlternativePassword,
                              })
                            }
                          >
                            Excluir
                          </Button>
                        )}
                      </Actions>
                    </ActionRow>
                  </SectionCard>

                  <SectionCard
                    title="Email OTP"
                    subtitle="Altere ou remova o e-mail de verificação."
                  >
                    <ActionRow>
                      <div className="w-full">
                        <InputX
                          title="Email"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                        />
                      </div>

                      <Actions>
                        <Button onClick={saveEmailOtp}>Salvar</Button>
                        {profile?.emailOtpAddress && (
                          <Button
                            onClick={() =>
                              setConfirmDelete({
                                open: true,
                                title: "Tem certeza que deseja excluir o e-mail OTP?",
                                onConfirm: deleteEmailOtp,
                              })
                            }
                          >
                            Excluir
                          </Button>
                        )}
                      </Actions>
                    </ActionRow>
                  </SectionCard>

                  <SectionCard
                    title="SMS OTP"
                    subtitle="Altere ou remova o telefone de verificação."
                  >
                    <ActionRow>
                      <div className="w-full">
                        <InputX
                          title="Telefone"
                          value={smsOtp}
                          onChange={(e) => setSmsOtp(e.target.value)}
                        />
                      </div>

                      <Actions>
                        <Button onClick={saveSmsOtp}>Salvar</Button>
                        {profile?.smsOtpPhone && (
                          <Button
                            onClick={() =>
                              setConfirmDelete({
                                open: true,
                                title: "Tem certeza que deseja excluir o SMS OTP?",
                                onConfirm: deleteSmsOtp,
                              })
                            }
                          >
                            Excluir
                          </Button>
                        )}
                      </Actions>
                    </ActionRow>
                  </SectionCard>

                  <SectionCard
                    title="Códigos de recuperação"
                    subtitle="Gere novos códigos de recuperação para este usuário."
                  >
                    <Actions>
                      <Button onClick={regenerateRecoveryCodes}>Gerar novos códigos</Button>
                    </Actions>
                  </SectionCard>
                </div>
              )}

              {activeTab === "devices" && (
                <div className="min-w-0 space-y-4">
                  <SectionCard
                    title="Dispositivos"
                    subtitle={`Dispositivos confiáveis atualmente: ${trustedDeviceCount}`}
                  >
                    <div className="space-y-3">
                      {(profile?.devices ?? []).map((device) => (
                        <div
                          key={device.id}
                          className="grid min-w-0 grid-cols-1 gap-3 rounded-xl border border-gray-200 p-4 xl:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <div className="min-w-0 break-words">
                            <div className="break-words font-semibold">
                              {device.label || device.userAgentFirstSeen || "Dispositivo sem nome"}
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              Status: {device.status} | Aprovado: {device.approved ? "Sim" : "Não"}
                            </div>
                            <div className="text-sm text-gray-600">
                              IP: {device.ipFirstSeen ?? "-"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {[device.country, device.region, device.city]
                                .filter(Boolean)
                                .join(" / ") || "-"}
                            </div>
                            <div className="text-sm text-gray-600">
                              Criado em: {device.createdIn}
                            </div>
                          </div>

                          <Actions>
                            <Button
                              onClick={() =>
                                setConfirmDelete({
                                  open: true,
                                  title: "Tem certeza que deseja excluir este dispositivo?",
                                  onConfirm: async () => deleteDevice(device.id),
                                })
                              }
                            >
                              Excluir
                            </Button>
                          </Actions>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}

              {activeTab === "logs" && (
                <div className="min-w-0 space-y-4">
                  <SectionCard
                    title="Logs"
                    subtitle="Visualização paginada dos eventos de segurança do usuário."
                  >
                    <div className="space-y-3">
                      {logs.map((log) => (
                        <article
                          key={log.id}
                          className="min-w-0 overflow-hidden rounded-xl border border-gray-200 p-4 text-sm"
                        >
                          <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <strong>Evento:</strong> {log.eventType}
                            </div>
                            <div>
                              <strong>Data:</strong> {log.createdIn}
                            </div>
                            <div className="md:col-span-2">
                              <strong>Descrição:</strong> {log.description ?? "-"}
                            </div>
                            <div>
                              <strong>IP:</strong> {log.ip ?? "-"}
                            </div>
                            <div>
                              <strong>Dispositivo:</strong> {log.userAgent ?? "-"}
                            </div>
                            <div className="md:col-span-2">
                              <strong>Localização:</strong>{" "}
                              {[log.country, log.region, log.city].filter(Boolean).join(" / ") ||
                                "-"}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {logsHasMore && (
                      <div className="mt-4">
                        <Button onClick={() => loadLogs(logsPage + 1, true)} disabled={logsLoading}>
                          {logsLoading ? "Buscando..." : "Buscar mais 5 logs"}
                        </Button>
                      </div>
                    )}
                  </SectionCard>
                </div>
              )}
            </>
          )}
        </div>

        {confirmDelete.open && confirmDelete.onConfirm && (
          <ConfirmationModalButton
            text={confirmDelete.title}
            onCancel={() => setConfirmDelete({ open: false, title: "" })}
            onConfirm={async () => {
              await confirmDelete.onConfirm?.();
              setConfirmDelete({ open: false, title: "" });
            }}
          />
        )}
      </div>
    </Modal>
  );
};
