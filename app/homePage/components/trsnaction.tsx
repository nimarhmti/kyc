import { Suspense } from "react";

const transactions = Array.from({ length: 2 }, (_, i) => ({
  id: i + 1,
  title: `Transaction ${i + 1}`,
  amount: `$${(Math.random() * 200).toFixed(2)}`,
}));

export default function Transactions() {
  return (
    <div className="space-y-3 p-4">
      {transactions.map((transaction) => (
        <Suspense fallback={<div>Loading...</div>} key={transaction.id}>
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div>
              <h3 className="font-medium">{transaction.title}</h3>
              <p className="text-sm text-slate-500">Today · 09:30 AM</p>
            </div>

            <span className="font-semibold">{transaction.amount}</span>
          </div>
        </Suspense>
      ))}
    </div>
  );
}
