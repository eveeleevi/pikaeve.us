"use client";

import React from "react";

export default function EntranceGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <button
        type="button"
        onClick={onEnter}
        className="relative z-10 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/40 bg-black/30 hover:bg-black/40 transition-colors"
      >
        {"Plz Continue >.<"}
      </button>
    </div>
  );
}


