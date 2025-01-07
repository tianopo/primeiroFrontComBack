import { useState } from "react";
import { toast } from "react-toastify";
import { CardContainer } from "src/components/Layout/CardContainer";

export const Closing = () => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const handleBankCsv = async (file: File): Promise<{ headers: string[]; rows: any[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (!data) {
          reject("O arquivo está vazio.");
          return;
        }

        const rows = data.split("\n").map((row) => row.split(";"));
        if (rows.length < 1) {
          reject("Formato do arquivo inválido.");
          return;
        }

        const extractedHeaders = rows[0].map((header) => header.trim());
        const processedRows = rows.slice(1).map((row) => {
          const item: Record<string, string> = {};
          row.forEach((value, index) => {
            item[extractedHeaders[index]] = value.trim();
          });
          return item;
        });

        resolve({ headers: extractedHeaders, rows: processedRows });
      };

      reader.onerror = (error) => {
        reject("Erro ao ler o arquivo CSV: " + error);
      };

      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }

    try {
      const fileArray = Array.from(files);
      let combinedHeaders: string[] = [];
      const combinedData: any[] = [];

      for (const file of fileArray) {
        const { headers, rows } = await handleBankCsv(file);
        combinedHeaders = headers;

        // Filtrando as linhas para remover as que começam com "Tarifa"
        const filteredRows = rows.filter((row) => {
          const description = row["Descrição"] || "";
          return !description.startsWith("Tarifa");
        });

        combinedData.push(...filteredRows);
      }

      const filteredData = combinedData.filter((row) => {
        const valor = row["Valor"] ? row["Valor"].replace(/\s+/g, "") : "";
        return valor !== "R$-0,01";
      });

      setHeaders(combinedHeaders);
      setFileData((prev) => [...prev, ...filteredData]);
      toast.success("Arquivo(s) processado(s) com sucesso!");
    } catch (error) {
      toast.error(`Erro ao processar o arquivo: ${error}`);
    }
  };

  const parseDescription = (description: string) => {
    const teste = description.split("PIX");
    const regexBanco = /\((\d+)\s*-\s*(.*)\)/;
    const matchBanco = teste[1]?.match(regexBanco);

    let tipo = teste[0]?.trim() || "";
    let pessoa = teste[1]?.split("(")[0]?.trim() || "";
    let banco = matchBanco ? matchBanco[2]?.trim() : "";
    const codigoBanco = matchBanco ? matchBanco[1] : "";

    // Modificar o tipo de transferência removendo " de"
    if (tipo.endsWith(" de")) {
      tipo = tipo.slice(0, -3).trim();
    }

    // Remover "para origem " da pessoa
    if (pessoa.startsWith("para origem ")) {
      pessoa = pessoa.slice(12).trim();
    }

    // Adicionar o código do banco junto com o nome do banco
    banco = `${codigoBanco} - ${banco}`;

    return { tipo, pessoa, banco, codigoBanco };
  };

  return (
    <CardContainer>
      <div className="flex w-full flex-col items-center">
        <div className="flex w-full">
          <label
            htmlFor="file-upload"
            className="w-full cursor-pointer rounded bg-blue-500 p-1.5 text-center font-bold text-white hover:bg-blue-700"
          >
            Escolher Arquivo(s) CSV
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <div className="mt-4 w-full overflow-auto">
          {fileData.length > 0 ? (
            <table className="min-w-full border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  {headers
                    .filter(
                      (header) =>
                        !["Referência", "Lançamento futuro", "Tipo de transação"].includes(header),
                    )
                    .map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 p-1.5 text-left text-sm font-bold"
                      >
                        {header === "Descrição" ? "Tipo de transação" : header}
                      </th>
                    ))}
                  <th className="border border-gray-300 p-1.5 text-left text-sm font-bold">
                    Pessoa
                  </th>
                  <th className="border border-gray-300 p-1.5 text-left text-sm font-bold">
                    Banco
                  </th>
                </tr>
              </thead>
              <tbody>
                {fileData.map((row, rowIndex) => {
                  const description = parseDescription(row["Descrição"] || "");

                  // Verifica o valor e define a cor correspondente
                  const valor = row["Valor"] || "";
                  const valorNumerico = parseFloat(
                    valor.replace("R$", "").replace(".", "").replace(",", ".").trim(),
                  );
                  const valorCor = valorNumerico >= 0 ? "text-green-500" : "text-red-500";

                  return (
                    <tr
                      key={rowIndex}
                      className={`${rowIndex % 2 === 0 ? "bg-gray-100" : "bg-white"}`}
                    >
                      {headers
                        .filter(
                          (header) =>
                            !["Referência", "Lançamento futuro", "Tipo de transação"].includes(
                              header,
                            ),
                        )
                        .map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className={`border border-gray-300 p-1.5 text-sm ${
                              header === "Valor" ? valorCor : ""
                            }`}
                          >
                            {header === "Descrição" ? description.tipo : row[header] || ""}
                          </td>
                        ))}
                      <td className="border border-gray-300 p-1.5 text-sm">{description.pessoa}</td>
                      <td className="border border-gray-300 p-1.5 text-sm">{description.banco}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">Nenhum dado carregado ainda.</p>
          )}
        </div>
      </div>
    </CardContainer>
  );
};
