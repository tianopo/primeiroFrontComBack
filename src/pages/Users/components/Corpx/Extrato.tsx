import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { useCorpxBalance } from "../../hooks/Corpx/useCorpxBalance";
import { useCorpxListMeds } from "../../hooks/Corpx/useCorpxListMeds";
import { useCorpxStatement } from "../../hooks/Corpx/useCorpxStatement";
import { MedTab } from "./MedTab";
import { PixOutModal } from "./PixOutModal";
import { RefundModal } from "./RefundModal";
import { StatementTab } from "./StatementTab";
import { StatusTab } from "./StatusTab";

type TabKey = "extrato" | "med" | "status";

// helper: yyyy-mm-dd (para input date)
const todayYMD = () => new Date().toISOString().slice(0, 10);

export const Extrato = () => {
  // accountId persistido igual PendingOrders
  const accountId = "c5130dff-f3f7-4e99-a78d-a3b3d7363cd0";
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "extrato";
    return (window.localStorage.getItem("corpxExtratoActiveTab") as TabKey) ?? "extrato";
  });

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("corpxExtratoActiveTab", tab);
    }
  };

  const tabBtnClass = (tab: TabKey) =>
    `px-4 py-2 -mb-px border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary font-semibold"
        : "border-transparent text-black hover:text-gray-600"
    }`;

  // filtros do extrato (form) + aplicado
  const [startDate, setStartDate] = useState(() => {
    if (typeof window === "undefined") return todayYMD();
    return window.localStorage.getItem("corpxStatementStartDate") ?? todayYMD();
  });

  const [endDate, setEndDate] = useState(() => {
    if (typeof window === "undefined") return todayYMD();
    return window.localStorage.getItem("corpxStatementEndDate") ?? todayYMD();
  });

  const [applied, setApplied] = useState(() => ({
    startDate,
    endDate,
    page: 1,
    size: 50,
  }));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("corpxStatementStartDate", startDate);
      window.localStorage.setItem("corpxStatementEndDate", endDate);
    }
  }, [startDate, endDate]);

  // queries gerais
  const balanceQ = useCorpxBalance();
  const medsQ = useCorpxListMeds("OPEN");

  // ✅ extrato via statement hook
  const statementQ = useCorpxStatement({
    accountId,
    startDate: applied.startDate,
    endDate: applied.endDate,
    page: applied.page,
    size: applied.size,
  });

  // modais
  const [showPixModal, setShowPixModal] = useState(false);
  const [refundModal, setRefundModal] = useState<{
    open: boolean;
    endToEndId?: string;
    amount?: number;
  }>({ open: false });

  return (
    <div className="flex w-full flex-col gap-4 px-4">
      <CardContainer full>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-28 font-bold">EXTRATO (CorpX)</h3>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            {balanceQ.isLoading ? (
              <h6>Carregando...</h6>
            ) : balanceQ.error ? (
              <h6>Erro ao carregar saldo</h6>
            ) : (
              <>
                <h6>
                  Saldo{balanceQ.data.total} {balanceQ.data.currency}
                </h6>
                <h6>
                  Disponível: {balanceQ.data.available} {balanceQ.data.locked}
                </h6>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setShowPixModal(true)}>Fazer PIX</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-3 flex w-full gap-2 border-b border-gray-200 font-bold lg:w-[calc(50%-1rem)]">
          <button className={tabBtnClass("extrato")} onClick={() => switchTab("extrato")}>
            Extrato
          </button>
          <button className={tabBtnClass("med")} onClick={() => switchTab("med")}>
            MED
          </button>
          <button className={tabBtnClass("status")} onClick={() => switchTab("status")}>
            Status
          </button>
        </div>

        {/* Conteúdo por tab */}
        {activeTab === "extrato" && (
          <StatementTab
            statementQ={statementQ}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
            onApply={() =>
              setApplied((p) => ({
                ...p,
                startDate,
                endDate,
                page: 1,
              }))
            }
            page={applied.page}
            size={applied.size}
            onPrev={() => setApplied((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            onNext={() => setApplied((p) => ({ ...p, page: p.page + 1 }))}
            onRefund={(endToEndId, amount) => setRefundModal({ open: true, endToEndId, amount })}
          />
        )}

        {activeTab === "med" && (
          <MedTab
            accountId={accountId}
            data={medsQ.data}
            isLoading={medsQ.isLoading}
            error={!!medsQ.error}
          />
        )}

        {activeTab === "status" && <StatusTab />}
      </CardContainer>

      {showPixModal && <PixOutModal accountId={accountId} onClose={() => setShowPixModal(false)} />}

      {refundModal.open && (
        <RefundModal
          accountId={accountId}
          endToEndId={refundModal.endToEndId}
          defaultAmount={refundModal.amount}
          onClose={() => setRefundModal({ open: false })}
        />
      )}
    </div>
  );
};
