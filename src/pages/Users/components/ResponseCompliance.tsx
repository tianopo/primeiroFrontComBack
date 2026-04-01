import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { generateComplianceDoc } from "../utils/generateComplianceDoc";
import { Deskdata } from "./DeskData/Deskdata";
import { CSNU } from "./QueryDataList/CSNU";
import { Europa } from "./QueryDataList/Europa";
import { OFAC } from "./QueryDataList/OFAC";
import { PalestinaCouncil } from "./QueryDataList/PalestinaCouncil";
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

  const COLLAPSED_HEIGHT = 100; // ajuste como quiser (px)

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [contentHeight, setContentHeight] = useState<number>(COLLAPSED_HEIGHT);

  // Quando mudar a resposta, fecha novamente (opcional)
  useEffect(() => {
    setExpanded(false);
  }, [responseData]);

  // Mede altura real para decidir se precisa do "exibir mais"
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const h = el.scrollHeight;
    setContentHeight(h);
    setShowToggle(h > COLLAPSED_HEIGHT);
  }, [responseData]);

  const maxHeight = expanded ? contentHeight : COLLAPSED_HEIGHT;

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

      {/* Área colapsável */}
      <div className="mx-auto w-full max-w-6xl">
        <div
          className="relative overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight }}
        >
          {/* Conteúdo real */}
          <div ref={contentRef}>
            <div className="flex w-full flex-row flex-wrap justify-center">
              {/* Lists */}
              {typeof responseData?.slave === "boolean" && (
                <Slave responseData={responseData?.slave} />
              )}

              {responseData?.deskdata && <Deskdata responseData={responseData?.deskdata} />}

              {responseData?.ofac && <OFAC responseData={responseData?.ofac} />}
              {responseData?.europa && <Europa responseData={responseData?.europa} />}
              {responseData?.csnu && <CSNU responseData={responseData?.csnu} />}
              {responseData?.palestinaCouncil && (
                <PalestinaCouncil responseData={responseData?.palestinaCouncil} />
              )}

              {/* Portal da transparência */}
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
            </div>
          </div>

          {/* Fade no final quando estiver colapsado */}
          {showToggle && !expanded && (
            <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-white to-transparent" />
          )}
        </div>

        {/* Botão Exibir mais/menos */}
        {showToggle && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              className="rounded-md border border-black px-3 py-2 text-sm hover:opacity-90"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "Exibir menos" : "Exibir mais"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
