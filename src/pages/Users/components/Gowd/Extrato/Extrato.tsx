import { useMemo, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { CardContainer } from "src/components/Layout/CardContainer";
import { useGowdBalance } from "../../../hooks/Gowd/useGowdBalance";
import { GowdStatementItem, useGowdStatement } from "../../../hooks/Gowd/useGowdStatement";
import { PixToolModal } from "../Pix/PixToolModal";
import { StatementExportButtons } from "./StatementExportButtons";
import { getInitialStatementHideFees, StatementFeesFilter } from "./StatementFeesFilter";
import { StatementRedisModal } from "./StatementRedisModal";
import { StatementTab } from "./StatementTab";

type TabKey = "extrato";
type GowdScope = "own" | "baas";

type ExtratoProps = {
  scope?: GowdScope;
  accountId?: string;
  title?: string;
  companyLabel?: string;
  pixKeyLabel?: string;
};

const todayYMD = () => new Date().toISOString().slice(0, 10);

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const Extrato = ({
  scope = "own",
  accountId,
  title = "EXTRATO (GOWD)",
  companyLabel = "CNPJ: 55.636.113/0001-70",
  pixKeyLabel = "Chave Pix: ab512de6-aa7b-4750-8321-914416061baa",
}: ExtratoProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("extrato");
  const [openRedisModal, setOpenRedisModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [hideFees, setHideFees] = useState(getInitialStatementHideFees);

  const { data: gowdBalance, isLoading } = useGowdBalance(scope);

  const STATEMENT_PAGE_SIZE = 20;
  const BACKEND_FETCH_SIZE = 1000;

  const [startDate, setStartDate] = useState(todayYMD());
  const [endDate, setEndDate] = useState(todayYMD());

  const [applied, setApplied] = useState(() => ({
    startDate: todayYMD(),
    endDate: todayYMD(),
    page: 1,
    size: STATEMENT_PAGE_SIZE,
  }));

  const statementQ = useGowdStatement({
    startDate: applied.startDate,
    endDate: applied.endDate,
    page: 1,
    size: BACKEND_FETCH_SIZE,
    scope,
    accountId,
  });

  const formattedBalance = Number(gowdBalance ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const tabBtnClass = (tab: TabKey) =>
    `px-4 py-2 -mb-px border-b-2 transition-colors ${
      activeTab === tab
        ? "border-primary text-primary font-semibold"
        : "border-transparent text-black hover:text-gray-600"
    }`;

  const allStatementItems = useMemo<GowdStatementItem[]>(() => {
    return Array.isArray(statementQ.data?.items) ? statementQ.data.items : [];
  }, [statementQ.data?.items]);

  const filteredStatementItems = useMemo<GowdStatementItem[]>(() => {
    if (!hideFees) {
      return allStatementItems;
    }

    return allStatementItems.filter((item) => {
      const operation = String(item.operation ?? item.transactionType ?? "").toUpperCase();
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
        : undefined,
    };
  }, [statementQ, paginatedStatementItems, currentStatementPage]);

  const totals = useMemo(() => {
    return allStatementItems.reduce(
      (acc, item) => {
        const amount = Number(item.amount ?? 0);

        if (!Number.isFinite(amount)) {
          return acc;
        }

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
    return allStatementItems.reduce((acc, item) => {
      const operation = String(item.operation ?? item.transactionType ?? "").toUpperCase();

      if (!operation.includes("FEE")) {
        return acc;
      }

      const amount = Math.abs(Number(item.amount ?? 0));
      return Number.isFinite(amount) ? acc + amount : acc;
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

  const handleChangeHideFees = (checked: boolean) => {
    setHideFees(checked);
    setApplied((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const canUseBaas = scope === "baas";

  return (
    <div className="flex w-full flex-col gap-4 px-4">
      <CardContainer full>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-28 font-bold">{title}</h4>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <strong>Saldo: {isLoading ? "Carregando..." : formattedBalance}</strong>
            <strong className="text-green-700">Entradas: {formatBRL(totals.entradas)}</strong>
            <strong className="text-red-700">Saídas: {formatBRL(totals.saidas)}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scope === "own" ? (
              <>
                <Button onClick={() => setOpenRedisModal(true)}>Checar</Button>
                {openRedisModal ? (
                  <StatementRedisModal onClose={() => setOpenRedisModal(false)} />
                ) : null}
              </>
            ) : null}

            <Button onClick={() => setShowPixModal(true)} disabled={canUseBaas && !accountId}>
              Fazer PIX
            </Button>

            {canUseBaas ? (
              <Button onClick={statementQ.refreshNow} disabled={!statementQ.canManualRefresh}>
                {statementQ.isFetching
                  ? "Atualizando..."
                  : statementQ.canManualRefresh
                    ? "Atualizar"
                    : `Atualizar em ${statementQ.manualRefreshCooldown}s`}
              </Button>
            ) : null}

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

            <h5>{companyLabel}</h5>
            <h5>{pixKeyLabel}</h5>
          </div>
        </div>

        {canUseBaas && !accountId ? (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Informe um accountId para consultar extrato, transferir e consultar Dict da conta BAAS.
          </div>
        ) : (
          <>
            <div className="mb-3 flex w-full gap-2 border-b border-gray-200 font-bold lg:w-[calc(50%-1rem)]">
              <button className={tabBtnClass("extrato")} onClick={() => setActiveTab("extrato")}>
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
          </>
        )}
      </CardContainer>

      {showPixModal ? (
        <PixToolModal onClose={() => setShowPixModal(false)} scope={scope} accountId={accountId} />
      ) : null}
    </div>
  );
};
