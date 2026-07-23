"use client";

import { useState } from "react";
import CameraView from "./_temp/newKyc";
import CurrencyInput from "./_Input/curencyInput";

export default function KYCPage() {
  const [amount, setAmount] = useState<string>("");
  console.log(parseFloat(amount));
  return (
    <div className="flex items-center justify-center flex-col h-screen">
      <h1>KYC System</h1>
      <CurrencyInput value={amount} onChange={setAmount} />
      {/* <CameraView /> */}
    </div>
  );
}
