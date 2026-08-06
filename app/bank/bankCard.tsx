"use client";
import React, { useState, useRef, MouseEvent } from "react";
import { RotateCw } from "lucide-react";

interface Tilt {
  x: number;
  y: number;
}

export interface CardData {
  brandName: string; // e.g. "AFRAWALLET"
  cardNumber: string; // e.g. "1234567891051478" (raw digits, no spaces)
  holderName: string; // e.g. "NAFISEH IMANZADEH"
  cvc: string; // e.g. "984"
  expiry: string; // e.g. "10/28"
  bankName: string; // e.g. "Bank Passargad"
}

interface BankCardProps {
  data: CardData;
}

// Splits a raw card number into 4-digit chunks for display, e.g.
// "1234567891051478" -> ["1234", "5678", "9105", "1478"]
function chunkCardNumber(cardNumber: string): string[] {
  const digitsOnly = cardNumber.replace(/\D/g, "");
  const chunks: string[] = [];
  for (let i = 0; i < digitsOnly.length; i += 4) {
    chunks.push(digitsOnly.slice(i, i + 4));
  }
  return chunks;
}

export function BankCard({ data }: BankCardProps) {
  const { brandName, cardNumber, holderName, cvc, expiry, bankName } = data;
  const numberChunks = chunkCardNumber(cardNumber);

  const [flipped, setFlipped] = useState<boolean>(false);
  const [tilt, setTilt] = useState<Tilt>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height; // 0..1
    const rotateY = (px - 0.5) * 18; // left/right tilt
    const rotateX = (0.5 - py) * 14; // up/down tilt
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="w-full min-h-[560px] flex flex-col items-center justify-center gap-6 bg-[#0b0f0e] p-8">
      <div style={{ perspective: "1200px" }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setFlipped((f) => !f)}
          className="relative w-[240px] h-[330px] cursor-pointer select-none"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
            transition: flipped
              ? "transform 0.55s cubic-bezier(0.86,0,0.07,1)"
              : "transform 0.55s cubic-bezier(0.86,0,0.07,1)",
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-[#0c2b26]" />
            {/* subtle sheen */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25), transparent 45%)",
              }}
            />
            <div className="relative h-full flex flex-col justify-between p-5">
              <div className="flex justify-end">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-zinc-200 to-zinc-400 shadow-inner" />
              </div>
              <div>
                <span className="text-white text-sm font-semibold tracking-[0.15em]">
                  {brandName}
                </span>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#0c2b26] via-teal-800 to-emerald-700" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2), transparent 45%)",
              }}
            />
            <div className="relative h-full flex flex-col justify-between p-5">
              <div className="pt-2">
                <p className="text-white font-mono text-[19px] tracking-[0.12em] leading-relaxed">
                  {numberChunks.map((chunk, i) => (
                    <React.Fragment key={i}>
                      {chunk}
                      {i < numberChunks.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </p>
              </div>
              <div>
                <p className="text-white text-[13px] font-medium tracking-wide mb-2">
                  {holderName}
                </p>
                <div className="flex gap-6 mb-3">
                  <div>
                    <p className="text-white/50 text-[9px]">CVC</p>
                    <p className="text-white text-xs font-mono">{cvc}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-[9px]">EXP</p>
                    <p className="text-white text-xs font-mono">{expiry}</p>
                  </div>
                </div>
                <span className="text-white/60 text-[10px]">{bankName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 text-white/70 text-xs hover:bg-white/12 transition-colors"
      >
        <RotateCw size={13} />
        {flipped ? "Show front" : "Show back"}
      </button>
      <p className="text-white/30 text-[11px]">
        Tip: move your cursor over the card, or drag on mobile
      </p>
    </div>
  );
}

// Sample data — swap this out with real card data from your API/state in the actual app.
