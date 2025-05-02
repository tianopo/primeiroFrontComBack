import { useState } from "react";
import { Cashier } from "./components/Cashier";
import { Compliance } from "./components/Compliance";
import { Edit } from "./components/Edit";
import { PendingOrders } from "./components/PendingOrders";
import { Register } from "./components/Register";

export const Users = () => {
  const [form, setForm] = useState(true);
  return (
    <div className="flex w-full flex-row flex-wrap justify-between gap-4 px-4">
      {form ? <Register setForm={setForm} /> : <Edit setForm={setForm} />}
      <Compliance />
      <PendingOrders />
      <Cashier />
    </div>
  );
};
