import { useEffect, useState } from "react";
import { Compliance } from "./components/Compliance";
import { Edit } from "./components/Edit";
import { PendingOrders } from "./components/PendingOrders";
import { Register } from "./components/Register";

type TabKey = "register" | "edit" | "compliance";

export const Users = () => {
  const [form, setForm] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(form ? "register" : "edit");

  const [initialRegisterData, setInitialRegisterData] = useState({
    apelido: "",
    nome: "",
    exchange: "",
  });

  useEffect(() => {
    setActiveTab(form ? "register" : "edit");
  }, [form]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === "register") setForm(true);
    if (tab === "edit") setForm(false);
  };

  const tabBtnClass = (tab: TabKey) =>
    `px-4 py-2 -mb-px border-b-2 transition-colors ${
      activeTab === tab
        ? "border-black text-black font-semibold"
        : "border-transparent text-white hover:text-gray-900"
    }`;

  return (
    <div className="flex w-full flex-row flex-wrap justify-between gap-4 px-4">
      {/* Tabs */}
      <div className="w-full">
        <div className="mb-3 flex w-full gap-2 border-b border-gray-200 font-bold lg:w-[calc(50%-1rem)]">
          <button className={tabBtnClass("register")} onClick={() => switchTab("register")}>
            Cadastro
          </button>
          <button className={tabBtnClass("edit")} onClick={() => switchTab("edit")}>
            Editar
          </button>
          <button className={tabBtnClass("compliance")} onClick={() => switchTab("compliance")}>
            Compliance
          </button>
        </div>
        {activeTab === "register" && (
          <Register setForm={setForm} initialData={initialRegisterData} />
        )}
        {activeTab === "edit" && <Edit setForm={setForm} />}
        {activeTab === "compliance" && <Compliance />}
      </div>
      <PendingOrders setForm={setForm} setInitialRegisterData={setInitialRegisterData} />
    </div>
  );
};
