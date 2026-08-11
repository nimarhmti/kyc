import Image from "next/image";
import React from "react";

export default function Container() {
  return (
    <div className="relative min-h-screen w-screen">
      {/* 843px content */}
      <div className="relative z-10 w-[calc(100%-600px)] rounded-e-4xl bg-amber-100/40 h-screen">
        {/* Your content */}
        ad
      </div>

      {/* Hero — always at logical end */}
      <div className="hero-visual absolute! top-0 inset-e-0 z-0 h-screen! overflow-hidden border">
        {/* Main image */}
        <div className="absolute inset-0">
          <Image src="/images/coins.png" alt="" fill className="object-cover" />
        </div>

        {/* Pattern */}
        <div className="absolute left-0 top-0 h-[83.2%] w-[96.82%]">
          <Image
            src="/images/Vector.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* Ethereum */}
        <div className="absolute bottom-[-3.43%] left-0 aspect-square w-[49.2%]">
          <Image
            src="/images/Ethereum.png"
            alt=""
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
