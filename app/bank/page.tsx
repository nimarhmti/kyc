"use client";

import React, { useState, useCallback, UIEvent } from "react";

// ===================== Tunable constants =====================

const SCROLL_RANGE = 150; // px of scroll over which the card finishes shrinking
const SCALE_FROM = 1;
const SCALE_TO = 0.75;

const CARD_TOP = 76; // px, fixed position of the card (never moves)
const CARD_WIDTH = 220;
const CARD_HEIGHT = 300; // unscaled card height

const BAND_HEIGHT = 210; // px — the blur/fade band, scaled from the 393x227 SVG spec to our 360-wide phone
const BG = "#141616"; // must match the phone's background color exactly, since the band fades INTO it

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function CardScrollBlur() {
  const [scrollTop, setScrollTop] = useState<number>(0);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const progress = clamp(scrollTop / SCROLL_RANGE, 0, 1);
  const scale = SCALE_FROM + (SCALE_TO - SCALE_FROM) * progress;

  return (
    <div className="w-full h-full min-h-[720px] flex items-center justify-center p-6 bg-[#0b0f0e]">
      <div
        className="relative w-[360px] h-[700px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
        style={{ background: BG }}
      >
        {/* ===== Card — fixed in place, never scrolls, only scales down ===== */}
        <div
          className="absolute left-0 right-0 flex justify-center z-10"
          style={{ top: `${CARD_TOP}px` }}
        >
          <div
            className="rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-[#0c2b26] shadow-2xl flex items-center justify-center"
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top center", // shrinks toward the top, so its bottom edge recedes upward
            }}
          >
            <span className="text-white/40 text-xs">card</span>
          </div>
        </div>

        {/* ===== The one scroll container. Its content — starting with the blur/fade band — ===== */}
        {/* ===== naturally slides up over the fixed card as the user scrolls it. No extra JS needed for that part. ===== */}
        <div
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto z-20"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Spacer: reserves the card's full-size footprint so nothing overlaps at rest (scrollTop = 0) */}
          <div style={{ height: CARD_TOP + CARD_HEIGHT }} />

          {/* Blur + fade band — exactly your SVG spec: backdrop-blur(9.7px) + gradient to solid bg at 63.94% */}
          {/* Because it's the first thing in the scroll flow, it's always right at the leading edge of the content */}
          {/* as it scrolls — which is what creates the "border" effect at the seam. */}
          {/* <div
            className="pointer-events-none"
            style={{
              height: `${BAND_HEIGHT}px`,
              backdropFilter: "blur(9.7px)",
              WebkitBackdropFilter: "blur(9.7px)",
              background: `linear-gradient(to bottom, rgba(20,22,22,0) 0%, ${BG} 63.94%, ${BG} 100%)`,
            }}
          /> */}

          {/* Real content — opaque, sits below the band */}
          <div className="px-5 pb-24" style={{ background: BG }}>
            <div className="w-full h-16 rounded-xl bg-white/6 mb-4" />
            <div className="w-full h-16 rounded-xl bg-white/6 mb-4" />
            <div className="w-full h-16 rounded-xl bg-white/6 mb-4" />
            <div className="w-full h-16 rounded-xl bg-white/6 mb-4" />
            <div className="w-full h-16 rounded-xl bg-white/6 mb-4" />
            <div className="w-full h-16 rounded-xl bg-white/6 mb-4" />
            <p className="text-white/30 text-xs text-center mt-6">
              scrollTop: {scrollTop.toFixed(0)}px · card scale:{" "}
              {scale.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
