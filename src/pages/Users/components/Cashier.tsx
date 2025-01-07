import { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { Select } from "src/components/Form/Select/Select";

interface Transaction {
  type: string;
  amount: number;
  exchange: string;
}

export const Cashier = () => {
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>(0);
  const [exchange, setExchange] = useState<string>("");
  const [isCashierOpen, setIsCashierOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedInitialAmount = parseFloat(localStorage.getItem("initialAmount") || "0");
    const savedCurrentAmount = parseFloat(localStorage.getItem("currentAmount") || "0");
    const savedTotalPurchases = parseFloat(localStorage.getItem("totalPurchases") || "0");
    const savedTotalSales = parseFloat(localStorage.getItem("totalSales") || "0");
    const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    const savedIsCashierOpen = localStorage.getItem("isCashierOpen") === "true";

    setInitialAmount(savedInitialAmount);
    setCurrentAmount(savedCurrentAmount);
    setTotalPurchases(savedTotalPurchases);
    setTotalSales(savedTotalSales);
    setTransactions(savedTransactions);
    setIsCashierOpen(savedIsCashierOpen);
  }, []);

  useEffect(() => {
    if (isCashierOpen) {
      localStorage.setItem("initialAmount", initialAmount.toString());
      localStorage.setItem("currentAmount", currentAmount.toString());
      localStorage.setItem("totalPurchases", totalPurchases.toString());
      localStorage.setItem("totalSales", totalSales.toString());
      localStorage.setItem("transactions", JSON.stringify(transactions));
      localStorage.setItem("isCashierOpen", isCashierOpen.toString());
    }
  }, [initialAmount, currentAmount, totalPurchases, totalSales, transactions, isCashierOpen]);

  const handleStartCashier = () => {
    setIsCashierOpen(true);
    setCurrentAmount(initialAmount);
  };

  const handlePurchase = () => {
    if (inputValue <= 0 || !exchange) return;
    const newTotalPurchases = totalPurchases + inputValue;
    setTotalPurchases(newTotalPurchases);
    setCurrentAmount(currentAmount - inputValue);
    setTransactions([...transactions, { type: "Compra", amount: inputValue, exchange }]);
    setInputValue(0);
    setExchange("");
  };

  const handleSale = () => {
    if (inputValue <= 0 || !exchange) return;
    const newTotalSales = totalSales + inputValue;
    setTotalSales(newTotalSales);
    setCurrentAmount(currentAmount + inputValue);
    setTransactions([...transactions, { type: "Venda", amount: inputValue, exchange }]);
    setInputValue(0);
    setExchange("");
  };

  const handleCloseCashier = () => {
    const finalAmount = initialAmount + totalSales - totalPurchases;
    const gainAmount = totalSales - totalPurchases;
    alert(
      `Caixa fechado com valor final: R$ ${finalAmount.toFixed(2)} com lucro de R$ ${gainAmount.toFixed(2)}`,
    );
    setIsCashierOpen(false);
    resetCashier();
  };

  const resetCashier = () => {
    setInitialAmount(0);
    setCurrentAmount(0);
    setTotalPurchases(0);
    setTotalSales(0);
    setInputValue(0);
    setTransactions([]);
    localStorage.clear();
  };

  const categorizedTransactions = (type: string) => {
    return transactions
      .filter((transaction) => transaction.type === type)
      .reduce(
        (acc, transaction) => {
          const { exchange } = transaction;
          if (!acc[exchange]) acc[exchange] = [];
          acc[exchange].push(transaction);
          return acc;
        },
        {} as Record<string, Transaction[]>,
      );
  };

  const purchasesByExchange = categorizedTransactions("Compra");
  const salesByExchange = categorizedTransactions("Venda");

  return (
    <div className="flex h-fit w-full flex-col rounded-16 bg-white p-4 shadow-2xl">
      <h3 className="text-28 font-bold">CAIXA</h3>
      {!isCashierOpen ? (
        <div className="flex flex-col gap-2">
          <InputX
            title="Valor Inicial"
            placeholder="Digite o valor inicial"
            typ="number"
            value={initialAmount.toString()}
            onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
            required
          />
          <Button onClick={handleStartCashier}>Iniciar Caixa</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <InputX
            title="Valor da Transação"
            placeholder="Digite o valor"
            typ="number"
            step="0.01"
            value={inputValue.toString()}
            onChange={(e) => setInputValue(parseFloat(e.target.value))}
            required
          />
          <Select
            title="Exchange"
            placeholder="Bybit"
            options={["Binance", "Bybit", "Kucoin", "Gate.IO", "CoinEx"]}
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            required
          />
          <Button onClick={handlePurchase}>Compra</Button>
          <Button onClick={handleSale}>Venda</Button>
          <div>
            <p>
              <strong>Caixa Aberto com:</strong> R$ {initialAmount.toFixed(2)}
            </p>
            <p>
              <strong>Total de Compras:</strong> R$ {totalPurchases.toFixed(2)}
            </p>
            <p>
              <strong>Total de Vendas:</strong> R$ {totalSales.toFixed(2)}
            </p>
            <p>
              <strong>Saldo Atual:</strong> R$ {currentAmount.toFixed(2)}
            </p>
            <p>
              <strong>Lucro:</strong> R$ {(totalSales - totalPurchases).toFixed(2)}
            </p>
          </div>
          <Button onClick={handleCloseCashier}>Fechar Caixa</Button>
          <div>
            <h3>Histórico de Compras</h3>
            {Object.keys(purchasesByExchange).map((exchange) => (
              <div key={exchange}>
                <h4>{exchange}</h4>
                <ul className="flex flex-row flex-wrap gap-1">
                  {purchasesByExchange[exchange].map((transaction, index) => (
                    <li key={index}>
                      {index + 1} - R$ {transaction.amount.toFixed(2)} |
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h3>Histórico de Vendas</h3>
            {Object.keys(salesByExchange).map((exchange) => (
              <div key={exchange}>
                <h4>{exchange}</h4>
                <ul className="flex flex-row flex-wrap gap-1">
                  {salesByExchange[exchange].map((transaction, index) => (
                    <li key={index}>
                      {index + 1} - R$ {transaction.amount.toFixed(2)} |
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
