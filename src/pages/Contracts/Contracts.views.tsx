import { useState } from "react";
import { Protection } from "./components/Protection";
import { Services } from "./components/Services";

export const Contracts = () => {
  const [activeTab, setActiveTab] = useState<number>(1);

  const TabContent = () => {
    switch (activeTab) {
      case 1:
        return <Services />;
      case 2:
        return <Protection />;
      default:
        return null;
    }
  };

  return (
    <div className="h-fit w-full rounded-16 bg-white p-4 shadow-2xl">
      {/* Tabs */}
      <div className="mb-4 flex flex-col justify-center gap-4 md:flex-row">
        <button
          className={`rounded px-4 py-2 ${
            activeTab === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab(1)}
        >
          Prestação de Serviços
        </button>
        <button
          className={`rounded px-4 py-2 ${
            activeTab === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab(2)}
        >
          Defesa Comercial
        </button>
      </div>
      <div className="w-full max-w-md rounded-lg border p-4">
        <TabContent />
      </div>
    </div>
  );
};
