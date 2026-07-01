import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { useGowdBalance } from "../../../hooks/Gowd/useGowdBalance";
import { useGowdStatement } from "../../../hooks/Gowd/useGowdStatement";
import { PixToolModal } from "../Pix/PixToolModal";
import { StatementExportButtons } from "./StatementExportButtons";
import { getInitialStatementHideFees, StatementFeesFilter } from "./StatementFeesFilter";
import { StatementRedisModal } from "./StatementRedisModal";
import { StatementTab } from "./StatementTab";

type TabKey = "extrato";

const todayYMD = () => new Date().toISOString().slice(0, 10);

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const Extrato = () => {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    if (typeof window === "undefined") return "extrato";
    return (window.localStorage.getItem("corpxExtratoActiveTab") as TabKey) ?? "extrato";
  });

  const [open, setOpen] = useState(false);
  const [hideFees, setHideFees] = useState(getInitialStatementHideFees);
  const { data: gowdBalance, isLoading } = useGowdBalance();

  const STATEMENT_PAGE_SIZE = 20;
  const BACKEND_FETCH_SIZE = 1000;

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
    size: STATEMENT_PAGE_SIZE,
  }));

  const statementQ = useGowdStatement({
    startDate: applied.startDate,
    endDate: applied.endDate,
    page: 1,
    size: BACKEND_FETCH_SIZE,
  });

  const allStatementItems = useMemo(() => {
    const items = statementQ.data?.items ?? [];

    return Array.isArray(items) ? items : [];
  }, [statementQ.data?.items]);

  const filteredStatementItems = useMemo(() => {
    if (!hideFees) return allStatementItems;

    return allStatementItems.filter((item: any) => {
      const operation = String(item?.operation ?? item?.transactionType ?? "").toUpperCase();

      return !operation.includes("FEE");
    });
  }, [allStatementItems, hideFees]);

  const totalStatementItems = filteredStatementItems.length;

  const totalStatementPages = Math.max(1, Math.ceil(totalStatementItems / applied.size));

  const currentStatementPage = Math.min(applied.page, totalStatementPages);

  const paginatedStatementItems = useMemo(() => {
    const start = (currentStatementPage - 1) * applied.size;
    const end = start + applied.size;

    return filteredStatementItems.slice(start, end);
  }, [filteredStatementItems, applied.size, currentStatementPage]);

  const paginatedStatementQ = useMemo(() => {
    return {
      ...statementQ,
      data: statementQ.data
        ? {
            ...statementQ.data,
            items: paginatedStatementItems,
            count: paginatedStatementItems.length,
            page: currentStatementPage,
          }
        : statementQ.data,
    };
  }, [statementQ, paginatedStatementItems, currentStatementPage]);

  const totals = useMemo(() => {
    return allStatementItems.reduce(
      (acc: { entradas: number; saidas: number }, item: any) => {
        const amount = Number(item?.amount ?? 0);

        if (!Number.isFinite(amount)) return acc;

        if (amount > 0) {
          acc.entradas += amount;
        } else if (amount < 0) {
          acc.saidas += Math.abs(amount);
        }

        return acc;
      },
      { entradas: 0, saidas: 0 },
    );
  }, [allStatementItems]);

  const feeTotal = useMemo(() => {
    return allStatementItems.reduce((acc: number, item: any) => {
      const operation = String(item?.operation ?? item?.transactionType ?? "").toUpperCase();

      if (!operation.includes("FEE")) return acc;

      const amount = Math.abs(Number(item?.amount ?? 0));

      if (!Number.isFinite(amount)) return acc;

      return acc + amount;
    }, 0);
  }, [allStatementItems]);

  const applyStatementFilter = () => {
    setApplied({
      startDate,
      endDate,
      page: 1,
      size: STATEMENT_PAGE_SIZE,
    });
  };

  const goPrevStatementPage = () => {
    setApplied((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  };

  const goNextStatementPage = () => {
    setApplied((prev) => {
      const totalPages = Math.max(1, Math.ceil(totalStatementItems / prev.size));

      if (prev.page >= totalPages) {
        return prev;
      }

      return {
        ...prev,
        page: prev.page + 1,
      };
    });
  };

  const [showPixModal, setShowPixModal] = useState(false);

  const handleChangeHideFees = (checked: boolean) => {
    setHideFees(checked);

    setApplied((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  return (
    <div className="flex w-full flex-col gap-4 px-4">
      <CardContainer full>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-28 font-bold">EXTRATO (GOWD)</h4>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <strong>Saldo: {isLoading ? "Carregando..." : formattedBalance}</strong>
            <strong className="text-green-700">Entradas: {formatBRL(totals.entradas)}</strong>
            <strong className="text-red-700">Saídas: {formatBRL(totals.saidas)}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setOpen(true)}>Checar</Button>
            {open && <StatementRedisModal onClose={() => setOpen(false)} />}

            <Button onClick={() => setShowPixModal(true)}>Fazer PIX</Button>

            <StatementFeesFilter checked={hideFees} onChange={handleChangeHideFees} />

            <StatementExportButtons
              items={allStatementItems}
              startDate={applied.startDate}
              endDate={applied.endDate}
              balance={Number(gowdBalance ?? 0)}
              entradas={totals.entradas}
              saidas={totals.saidas}
              taxas={feeTotal}
            />

            <h5>CNPJ: 55.636.113/0001-70</h5>
            <h5>Chave Pix: ab512de6-aa7b-4750-8321-914416061baa</h5>
          </div>
        </div>

        <div className="mb-3 flex w-full gap-2 border-b border-gray-200 font-bold lg:w-[calc(50%-1rem)]">
          <button className={tabBtnClass("extrato")} onClick={() => switchTab("extrato")}>
            Extrato
          </button>
        </div>

        {activeTab === "extrato" && (
          <StatementTab
            statementQ={paginatedStatementQ}
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
            onApply={applyStatementFilter}
            page={currentStatementPage}
            size={applied.size}
            totalItems={totalStatementItems}
            onPrev={goPrevStatementPage}
            onNext={goNextStatementPage}
          />
        )}
      </CardContainer>

      {showPixModal && <PixToolModal onClose={() => setShowPixModal(false)} />}
    </div>
  );
};
