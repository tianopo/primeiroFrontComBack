import { useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { useGowdBalance } from "../../hooks/Gowd/useGowdBalance";
import { useGowdStatement } from "../../hooks/Gowd/useGowdStatement";
import { PixToolModal } from "./Pix/PixToolModal";
import { StatementRedisModal } from "./StatementRedisModal";
import { StatementTab } from "./StatementTab";

type TabKey = "extrato";

const todayYMD = () => new Date().toISOString().slice(0, 10);

export const Extrato = () => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "extrato";
    return (window.localStorage.getItem("corpxExtratoActiveTab") as TabKey) ?? "extrato";
  });

  const [open, setOpen] = useState(false);
  const { data: gowdBalance, isLoading } = useGowdBalance();

  const formattedBalance = Number(gowdBalance ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
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

  const [startDate, setStartDate] = useState(todayYMD());
  const [endDate, setEndDate] = useState(todayYMD());

  const [applied, setApplied] = useState(() => ({
    startDate,
    endDate,
    page: 1,
    size: 1000,
  }));

  const statementQ = useGowdStatement({
    startDate: applied.startDate,
    endDate: applied.endDate,
    page: applied.page,
    size: applied.size,
  });

  const [showPixModal, setShowPixModal] = useState(false);

  return (
    <div className="flex w-full flex-col gap-4 px-4">
      <CardContainer full>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-28 font-bold">EXTRATO (GOWD)</h4>

          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <strong>Saldo: {isLoading ? "Carregando..." : formattedBalance}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setOpen(true)}>Checar</Button>
            {open && <StatementRedisModal onClose={() => setOpen(false)} />}
            <Button onClick={() => setShowPixModal(true)}>Fazer PIX</Button>
          </div>
        </div>

        <div className="mb-3 flex w-full gap-2 border-b border-gray-200 font-bold lg:w-[calc(50%-1rem)]">
          <button className={tabBtnClass("extrato")} onClick={() => switchTab("extrato")}>
            Extrato
          </button>
        </div>

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
                size: 1000,
              }))
            }
            page={applied.page}
            size={applied.size}
            onPrev={() => setApplied((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            onNext={() => setApplied((p) => ({ ...p, page: p.page + 1 }))}
          />
        )}
      </CardContainer>

      {showPixModal && <PixToolModal onClose={() => setShowPixModal(false)} />}
    </div>
  );
};
