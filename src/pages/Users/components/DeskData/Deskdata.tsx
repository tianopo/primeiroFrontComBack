import { DeskdataBalance } from "./DeskdataBalance";
import { DeskdataLawsuits } from "./DeskdataLawsuits";
import { DeskdataRelationships } from "./DeskdataRelationships";

type DeskdataSmartResult = {
  balance?: any;
  personLawsuits?: any;
  companyRelationships?: any;
};

export const Deskdata = ({ responseData }: { responseData: DeskdataSmartResult }) => {
  if (!responseData) return null;

  const lawsuits = responseData.personLawsuits?.data?.lawsuits;
  const relationships = responseData.companyRelationships?.data?.relationships;
  const balance = responseData.balance;

  const hasSomething = !!balance || !!lawsuits || !!relationships;
  if (!hasSomething) return null;

  return (
    <div className="mt-3 w-full rounded-lg border border-gray-200 bg-white p-3">
      <h5 className="mb-2 text-base font-bold">DESKDATA</h5>

      <DeskdataBalance balance={balance} />
      <DeskdataRelationships relationships={relationships} />
      <DeskdataLawsuits lawsuits={lawsuits} />
    </div>
  );
};
