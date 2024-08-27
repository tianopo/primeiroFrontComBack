import { Gear } from "@phosphor-icons/react";
import { useAccessControl } from "src/routes/context/AccessControl";
import "./Table.css";
import { IconX } from "../Icons/IconX";

interface ITable {
  headers: {
    title: string;
    width: string;
  }[];
  data: {
    id: string;
    one: string;
    two?: string;
    three?: string;
  }[];
  onClick?: (id: string, access: string) => void;
}

export const Table = ({ headers, data, onClick }: ITable) => {
  const { acesso } = useAccessControl();
  return (
    <div className="w-full overflow-x-auto">
      <span className="text-write-primary">
        Mostrando {data.length} usuário{data.length > 1 && "s"}
      </span>
      <table className="w-full rounded-lg border-1 border-edge-primary bg-white text-start">
        <thead>
          <tr className="bg-secundary uppercase leading-pattern text-write-primary">
            {headers.map((header, index) => (
              <th key={index} className={`space-h min-w-${header.width} max-w-${header.width}`}>
                {header.title}
              </th>
            ))}
            <th className="space-h min-w-6 max-w-6"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className={`space-b min-w-${headers[0].width} max-w-${headers[0].width}`}>
                {row.one}
              </td>
              <td className={`space-b min-w-${headers[1].width} max-w-${headers[1].width}`}>
                {row?.two}
              </td>
              <td className={`space-b min-w-${headers[2].width} max-w-${headers[2].width}`}>
                {row?.three}
              </td>
              {acesso !== "Cliente" && (
                <td className={`space-b min-w-6 max-w-6`}>
                  <IconX
                    name="Editar"
                    icon={
                      <Gear
                        className="cursor-pointer rounded-6 text-write-secundary hover:bg-secundary hover:text-write-primary"
                        width={19.45}
                        height={20}
                        weight="fill"
                        onClick={() => row?.two && onClick?.(row?.id, row.two)}
                      />
                    }
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
