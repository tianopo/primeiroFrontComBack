import { useState } from "react";
import { Compliance } from "./components/Compliance";
import { Edit } from "./components/Edit";
import { PendingOrders } from "./components/PendingOrders";
import { Register } from "./components/Register";
import { Transactions } from "./components/Transactions";

export const Users = () => {
  const [form, setForm] = useState(true);

  const [initialRegisterData, setInitialRegisterData] = useState({
    apelido: "",
    nome: "",
    exchange: "",
  });

  return (
    <div className="flex w-full flex-row flex-wrap justify-between gap-4 px-4">
      {form ? (
        <Register setForm={setForm} initialData={initialRegisterData} />
      ) : (
        <Edit setForm={setForm} />
      )}
      <Compliance />
      <PendingOrders setForm={setForm} setInitialRegisterData={setInitialRegisterData} />
      <Transactions />
    </div>
  );
};
