import React, { useEffect, useState } from "react";
import { Button } from "src/components/Buttons/Button";
import { InputX } from "src/components/Form/Input/InputX";
import { useAccessControl } from "src/routes/context/AccessControl";
import { IN1888 } from "./components/IN1888";
import { fortnigthlyFiduciaTable } from "./config/fortnigthlyFiduciaTable";
import { handleCompraVendaIN1888 } from "./config/handleDownload";
import { handleReceipt } from "./config/handleReceipt";
import { mensalFiduciaTable } from "./config/mensalFiduciaTable";
import { useListTransactionsInDate } from "./hooks/useListTransactionsInDate";

export const Home = () => {
  const { acesso } = useAccessControl();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDates, setFilterDates] = useState(() => {
    if (acesso === "User") {
      return { startDate: "2024-06-21", endDate: "3000-12-31" };
    }
    return { startDate: "", endDate: "" };
  });
  const [showModal, setShowModal] = useState(false);
  const [buyer, setBuyer] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [visibleExchanges, setVisibleExchanges] = useState<{ [key: string]: boolean }>({});
  const [valorTotalNFE, setValorTotalNFE] = useState(0);

  const { data, error, isLoading } = useListTransactionsInDate(
    filterDates.startDate,
    filterDates.endDate,
  );

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterDates({ startDate, endDate });
  };

  const calculateTotals = (filteredData: any[]) => {
    let totalVendas = 0;
    let totalCompras = 0;
    let precoMedioCompra = 0;
    let precoMedioVenda = 0;

    let somaValorTokenCompra = 0;
    let quantidadeComprasToken = 0;

    let somaValorTokenVenda = 0;
    let quantidadeVendasToken = 0;

    filteredData.forEach((transaction: any) => {
      const valor = parseFloat(
        transaction.valor.replace(".", "").replace(",", ".").replace("R$", ""),
      );

      if (transaction.tipo === "vendas") {
        totalVendas += valor;
      } else if (transaction.tipo === "compras") {
        totalCompras += valor;
      }

      const isStablecoin = ["USDT", "USDC"].includes(transaction.ativo);
      const valorToken = parseFloat(transaction.valorToken?.toString().replace(",", "."));

      if (!isNaN(valorToken) && isStablecoin) {
        if (transaction.tipo === "compras") {
          somaValorTokenCompra += valorToken;
          quantidadeComprasToken++;
        } else if (transaction.tipo === "vendas") {
          somaValorTokenVenda += valorToken;
          quantidadeVendasToken++;
        }
      }
    });

    if (quantidadeComprasToken > 0) {
      precoMedioCompra = somaValorTokenCompra / quantidadeComprasToken;
    }

    if (quantidadeVendasToken > 0) {
      precoMedioVenda = somaValorTokenVenda / quantidadeVendasToken;
    }

    return { totalVendas, totalCompras, precoMedioCompra, precoMedioVenda };
  };

  const filteredData =
    buyer === "" || buyer === " N/A"
      ? data || []
      : data?.filter((transaction: any) => transaction.User?.name === buyer);

  const { totalVendas, totalCompras, precoMedioCompra, precoMedioVenda } = filteredData
    ? calculateTotals(filteredData)
    : { totalVendas: 0, totalCompras: 0, precoMedioCompra: 0, precoMedioVenda: 0 };

  const handleGenerate = async () => {
    handleCompraVendaIN1888(filteredData, acesso);
  };

  useEffect(() => {
    if (data) {
      const uniqueBuyers = Array.from(
        new Set(data.map((t: any) => t.User?.name || " N/A")),
      ) as string[];

      setUsers(uniqueBuyers.sort());
    }
  }, [data]);

  // Função para agrupar transações por exchange
  const groupByExchange = (transactions: any[]) => {
    return transactions.reduce((acc: any, transaction: any) => {
      const exchange = transaction.exchange.split(" ")[0];
      if (!acc[exchange]) {
        acc[exchange] = [];
      }
      acc[exchange].push(transaction);
      return acc;
    }, {});
  };

  // Alternar visibilidade das ordens de uma exchange
  const toggleExchangeVisibility = (exchange: string) => {
    setVisibleExchanges((prev) => ({
      ...prev,
      [exchange]: !prev[exchange],
    }));
  };

  const groupedTransactions = filteredData ? groupByExchange(filteredData) : {};
  const validationDates = filterDates.startDate.length > 0 && filterDates.endDate.length > 0;
  const validationEmptyBuyers = buyer === "" || buyer === " N/A";

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  const showFortnightButton = diffDays >= 13 && diffDays <= 16;
  const showMonthlyButton = diffDays >= 28;

  const handleTransactions = async () => {
    if (!filteredData) return;

    // Helpers
    const parseBRL = (v: any) =>
      typeof v === "number"
        ? v
        : parseFloat(String(v).replace("R$", "").replace(/\./g, "").replace(",", "."));
    const parseNum = (v: any) => parseFloat(String(v).replace(",", "."));
    const toBRDate = (d: Date | string) =>
      new Date(d).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    // Config fixa (mesma que você já usa)
    const hoje = new Date();
    const monthName = hoje.toLocaleDateString("pt-BR", { month: "long" });
    const comissaoFixa = 0.1; // % base para não-stable / fallback
    const comissaoMargemErro = 10; // ajuste de margem
    const codMunicipioServicoPrestado = 352440;
    const codAtividade = 6619399;
    const codListaServicos = 10.02;
    const aliquota = 201; // 2,01% => "201" em centésimos de ponto
    const inscricaoMunicipal = 90598;

    // RPS sequencial (mantido)
    let numeroRPS = parseInt(localStorage.getItem("numeroRPS") || "0", 10);

    // Para o nome do arquivo
    const validationEmptyBuyers = buyer === "" || buyer === " N/A";
    const buyerNames = buyer.split(" ");
    const formattedBuyer =
      `${buyerNames[0] || ""} ${buyerNames[buyerNames.length - 1] || ""}`.trim();

    const isStable = (symbol: string) => ["USDT", "USDC"].includes(symbol);
    const isBtcOrEth = (symbol: string) => ["BTC", "ETH"].includes(symbol);

    // CSV header (mantido)
    let csvContent = `Indicador de Tipo de Serviço,""Número RPS"",""Serie RPS"",""Data Prestação de Serviço"",""Data Emissão do RPS"",""RPS Substitutivo"",""Documento CPF/CNPJ"",""Inscrição Mobiliária"",""Razão Social"",Endereço,Número,Complemento,Bairro,""Código do Município"",""Código do País"",Cep,Telefone,Email,""ISS Retido no Tomador"",""Código do Município onde o Serviço foi Prestado"",""Código da Atividade"",""Código da Lista de Serviços"",Discriminação,""Valor NF"",""Valor Deduções"",""Valor Desconto Condicionado"",""Valor Desconto Incondicionado"",""Valor INSS"",""Valor Csll"",""Valor Outras Retenções"",""Valor Pis"",""Valor Cofins"",""Valor Ir"",""Valor Iss"",""Prestador Optante Simples Nacional"",Alíquota,""Código da Obra"",""Código ART"",""Inscrição Própria"",""Código do Benefício""\n`;

    let somaTotalNFE = 0;

    // **Agora: 1 LINHA POR ORDEM**
    for (const t of filteredData) {
      // Se quiser emitir NFE apenas para VENDAS, descomente a linha abaixo:
      // if (t.tipo !== "vendas") continue;

      const buyerName = t.User?.name || "N/A";
      const cpfCnpj = (t.User?.document || "").replace(/\D/g, "") || "00000000000";

      const valorBRL = parseBRL(t.valor);
      const valorToken = parseNum(t.valorToken);
      const ativo = String(t.ativo || "").toUpperCase();

      // Comissão por ordem
      let comissao = comissaoFixa;
      if (isBtcOrEth(ativo)) {
        comissao = 5;
      } else if (isStable(ativo)) {
        const calc =
          precoMedioCompra > 0
            ? ((valorToken - precoMedioCompra) / precoMedioCompra) * 100
            : comissaoFixa;
        const calculada = calc - comissaoMargemErro;
        comissao = Math.max(comissaoFixa, calculada);
      } else {
        comissao = comissaoFixa;
      }

      // Valor da NFE (comissão * valor da ordem)
      const valorNfe = Number((valorBRL * (comissao / 100)).toFixed(2));
      const valorIss = Math.round(valorNfe * (aliquota / 10000)); // mesmo cálculo que você já usava
      somaTotalNFE += valorNfe;

      // Datas (uma por ordem)
      const dataPrestacaoServico = toBRDate(t.dataHora);

      // Discriminação (APENAS a ordem)
      const fileContent = `"- Serviço: Intermediação de Ativos Digitais
- Comissão aplicada: ${comissao.toFixed(2)}%
- Identificador da Ordem: ${t.numeroOrdem}
- Data/Hora: ${toBRDate(t.dataHora)}
- Valor do Token: ${t.valorToken}
- Ativo Digital: ${t.ativo}
- Quantidade de Tokens: ${t.quantidade}
- Valor Pago: ${t.valor}
- Exchange/Corretora: ${String(t.exchange || "").split(" ")[0]}

Suporte de Dúvidas
- Para informações do P2P, consulte a documentação ou o suporte da corretora"`; // mantém aspas conforme seu padrão

      // Linha CSV (mantém a sua estrutura)
      const csvData =
        `R,${numeroRPS},RPS,${dataPrestacaoServico},${toBRDate(hoje)},,${cpfCnpj},,${buyerName},,,,,,48,,,,S,` +
        `${codMunicipioServicoPrestado},${codAtividade},${codListaServicos},${fileContent},` +
        `${(valorNfe * 100).toFixed(2)},0,0,0,0,0,0,0,0,0,${valorIss},S,${aliquota},0,0,${inscricaoMunicipal},\n`;

      csvContent += csvData;
      numeroRPS += 1;
    }

    // Atualiza sequencial
    localStorage.setItem("numeroRPS", String(numeroRPS));
    setValorTotalNFE(somaTotalNFE);

    // Nome do arquivo
    const fileName = validationEmptyBuyers
      ? `nota_fiscal_${monthName}.csv`
      : `nota_fiscal_${formattedBuyer}_${monthName}.csv`;

    // Download
    const blobCsv = new Blob([csvContent], { type: "text/csv" });
    const linkCsv = document.createElement("a");
    linkCsv.href = URL.createObjectURL(blobCsv);
    linkCsv.download = fileName;
    document.body.appendChild(linkCsv);
    linkCsv.click();
    document.body.removeChild(linkCsv);
  };

  return (
    <div className="flex h-fit w-full flex-col gap-3 rounded-16 bg-white p-4 shadow-2xl">
      <div className="flex items-center gap-5">
        <h3 className="text-28 font-bold">Ordens</h3>
        {acesso === "Master" && <Button onClick={() => setShowModal(true)}>IN1888</Button>}
      </div>
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
        <InputX
          title="Data Início"
          typ="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <InputX
          title="Data Final"
          typ="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        {users.length > 0 && acesso !== "User" && (
          <InputX
            title="Compradores"
            placeholder="Selecione um comprador"
            value={buyer === " N/A" ? "" : buyer}
            onChange={(e) => setBuyer(e.target.value)}
            busca
            options={users}
          />
        )}
        <Button onClick={handleOrder} disabled={startDate.length !== 10 || endDate.length !== 10}>
          Filtrar
        </Button>
        {validationDates && (
          <>
            <Button onClick={handleGenerate}>Gerar IN188</Button>
            {acesso === "Master" && validationEmptyBuyers && (
              <>
                {showFortnightButton && (
                  <Button onClick={() => fortnigthlyFiduciaTable(filteredData)}>
                    Tabela Quinzenal
                  </Button>
                )}
                {showMonthlyButton && (
                  <Button onClick={() => mensalFiduciaTable(filteredData)}>Tabela Mensal</Button>
                )}
              </>
            )}
          </>
        )}
        {validationDates && acesso === "Master" && (
          <Button onClick={handleTransactions}>Emitir NFE</Button>
        )}
        {validationDates && <Button onClick={() => handleReceipt(filteredData)}>Recibo</Button>}
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && <p>Erro ao carregar dados</p>}

      {filteredData && (
        <div>
          <h6>Quantidade de ordens: {filteredData.length}</h6>
          <h6>Vendas: {totalVendas.toFixed(2)} BRL</h6>
          <h6>Compras: {totalCompras.toFixed(2)} BRL</h6>
          {acesso !== "User" && (
            <>
              <h6>Preço Médio de Compra em USDT/USDC: {precoMedioCompra.toFixed(2)} BRL</h6>
              <h6>Preço Médio de Venda em USDT/USDC: {precoMedioVenda.toFixed(2)} BRL</h6>
            </>
          )}
          {valorTotalNFE > 0 && (
            <h6 className="font-semibold text-green-700">
              Valor Total das NFE Emitidas: R$ {valorTotalNFE.toFixed(2)}
            </h6>
          )}
          {/* Listar as ordens agrupadas por exchange */}
          {Object.keys(groupedTransactions).map((exchange) => (
            <div key={exchange} className="mb-4">
              <h4
                className="cursor-pointer text-blue-600"
                onClick={() => toggleExchangeVisibility(exchange)}
              >
                {exchange} ({groupedTransactions[exchange].length} ordens)
              </h4>
              {visibleExchanges[exchange] && (
                <div className="flex flex-row flex-wrap gap-2">
                  {groupedTransactions[exchange].map((transaction: any) => (
                    <div
                      key={transaction.numeroOrdem}
                      className="my-1.5 w-full rounded-8 border-1 border-edge-primary p-4 sm:w-72"
                    >
                      <p className="max-w-[200px] truncate">
                        <strong>Ordem:</strong> {transaction.numeroOrdem}
                      </p>
                      <p>
                        <strong>Data/Hora:</strong> {transaction.dataHora}
                      </p>
                      <p>
                        <p className="max-w-[200px] truncate">
                          <strong>Usuário:</strong> {transaction.User?.name}
                        </p>
                        <strong>Ativo:</strong> {transaction.ativo}
                      </p>
                      <p>
                        <strong>Quantidade:</strong> {transaction.quantidade}
                      </p>
                      <p>
                        <strong>Valor:</strong> {transaction.valor}
                      </p>
                      <p>
                        <strong>Valor Token:</strong> {transaction.valorToken}
                      </p>
                      <p>
                        <strong>Taxa:</strong> {transaction.taxa === "" ? 0 : transaction.taxa}
                      </p>
                      <p>
                        <strong>Tipo:</strong> {transaction.tipo}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal && <IN1888 onClose={() => setShowModal(false)} />}
    </div>
  );
};
