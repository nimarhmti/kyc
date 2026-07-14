"use client";

import WalletCard from "./components/walletCard";
import CoreActions from "./components/coreAction";

import Transactions from "./components/trsnaction";

export default function WalletPage() {
  return (
    <main>
      <section className="sticky top-0 pt-4 h-[220px] bg-amber-300">
        <WalletCard />
      </section>

      <section className="relative z-10  rounded-t-3xl bg-white">
        <div className="sticky top-0 z-20 bg-white">
          <CoreActions />
        </div>

        <Transactions />
      </section>
    </main>
  );
}
