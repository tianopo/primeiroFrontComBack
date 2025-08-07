import { Fiducia } from "./QueryDataList/Fiducia";
import { OFAC } from "./QueryDataList/OFAC";
import { Slave } from "./QueryDataList/Slave";
import { AE } from "./QueryDataTransparencia/AE";
import { BPC } from "./QueryDataTransparencia/BPC";
import { CEAF } from "./QueryDataTransparencia/CEAF";
import { CEIS } from "./QueryDataTransparencia/CEIS";
import { CEPIM } from "./QueryDataTransparencia/CEPIM";
import { CF } from "./QueryDataTransparencia/CF";
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
      <h6>{responseData?.userAnalysis}</h6>
      <div className="flex w-full flex-row flex-wrap justify-center">
        {/*Lists*/}
        {typeof responseData?.slave === "boolean" && <Slave responseData={responseData?.slave} />}
        {typeof responseData?.fiducia === "boolean" && (
          <Fiducia responseData={responseData?.fiducia} />
        )}
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
        {responseData?.pdt?.cf && <CF responseData={responseData?.pdt?.cf} />}
        {responseData?.pdt?.cepim && <CEPIM responseData={responseData?.pdt?.cepim} />}
        {responseData?.pdt?.ceis && <CEIS responseData={responseData?.pdt?.ceis} />}
        {responseData?.pdt?.ceaf && <CEAF responseData={responseData?.pdt?.ceaf} />}
      </div>
    </div>
  );
};
