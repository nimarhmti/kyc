export default function WalletCard() {
  return (
    <div className="mx-4 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">Total Balance</p>
          <h2 className="mt-2 text-3xl font-bold">$12,458.65</h2>
        </div>

        <div className="rounded-full bg-white/10 px-3 py-1 text-sm">USD</div>
      </div>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-xs text-white/60">Card Holder</p>
          <p className="font-medium">John Doe</p>
        </div>

        <div>
          <p className="text-xs text-white/60">**** 4567</p>
        </div>
      </div>
    </div>
  );
}
