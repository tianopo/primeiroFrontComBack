import { generateComplianceDoc } from "../utils/generateComplianceDoc";
import { Deskdata } from "./DeskData/Deskdata";
import { OFAC } from "./QueryDataList/OFAC";
import { Slave } from "./QueryDataList/Slave";
import { AE } from "./QueryDataTransparencia/AE";
import { BPC } from "./QueryDataTransparencia/BPC";
import { CEAF } from "./QueryDataTransparencia/CEAF";
import { CEIS } from "./QueryDataTransparencia/CEIS";
import { CEPIM } from "./QueryDataTransparencia/CEPIM";
import { CNEP } from "./QueryDataTransparencia/CNEP";
import { CNPJ } from "./QueryDataTransparencia/CNPJ";
import { PEP } from "./QueryDataTransparencia/PEP";
import { PETI } from "./QueryDataTransparencia/PETI";
import { Safra } from "./QueryDataTransparencia/Safra";
import { SDC } from "./QueryDataTransparencia/SDC";
import { Viagens } from "./QueryDataTransparencia/Viagens";

interface IResponseCompliance {
  responseData: any;
}

export const ResponseCompliance = ({ responseData }: IResponseCompliance) => {
  if (!responseData) return null;

  return (
    <div className="text-center">
      <h5>
        <strong>{responseData?.pdt?.cpf?.nome}</strong>
      </h5>

      {responseData?.pdt?.cpf?.nis && (
        <h5>
          <strong>NIS: </strong>
          {responseData?.pdt?.cpf?.nis}
        </h5>
      )}

      <h6>{responseData?.ourData}</h6>
      <h6>Algumas ordens são registradas apenas no mês seguinte</h6>
      <h6>{responseData?.userAnalysis}</h6>

      <div className="my-2 flex justify-center">
        <button
          type="button"
          className="rounded-md bg-black px-3 py-2 text-sm text-white hover:opacity-90"
          onClick={() => generateComplianceDoc(responseData)}
        >
          Gerar PDF
        </button>
      </div>

      <div className="flex w-full flex-row flex-wrap justify-center">
        {/*Lists*/}
        {typeof responseData?.slave === "boolean" && <Slave responseData={responseData?.slave} />}
        {responseData?.ofac && <OFAC responseData={responseData?.ofac} />}
        {/*Portal da transparência*/}
        {responseData?.pdt?.viagens && <Viagens responseData={responseData?.pdt?.viagens} />}
        {responseData?.pdt?.pep && <PEP responseData={responseData?.pdt?.pep} />}
        {responseData?.pdt?.cnpj && <CNPJ responseData={responseData?.pdt?.cnpj} />}
        {responseData?.pdt?.sdc && <SDC responseData={responseData?.pdt?.sdc} />}
        {responseData?.pdt?.safra && <Safra responseData={responseData?.pdt?.safra} />}
        {responseData?.pdt?.peti && <PETI responseData={responseData?.pdt?.peti} />}
        {responseData?.pdt?.bpc && <BPC responseData={responseData?.pdt?.bpc} />}
        {responseData?.pdt?.ae && <AE responseData={responseData?.pdt?.ae} />}
        {responseData?.pdt?.cnep && <CNEP responseData={responseData?.pdt?.cnep} />}
        {responseData?.pdt?.cepim && <CEPIM responseData={responseData?.pdt?.cepim} />}
        {responseData?.pdt?.ceis && <CEIS responseData={responseData?.pdt?.ceis} />}
        {responseData?.pdt?.ceaf && <CEAF responseData={responseData?.pdt?.ceaf} />}

        {responseData?.deskdata && <Deskdata responseData={responseData?.deskdata} />}
      </div>
    </div>
  );
};
