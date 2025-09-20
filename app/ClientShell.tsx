"use client";

import React from "react";
import BackgroundVideo from "./BackgroundVideo";
import EntranceGate from "./EntranceGate";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = React.useState(false);
  return (
    <>
      <BackgroundVideo src="/ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_1080p.mp4" audioSrc="/ssvid.net--MIDWXST-SIDELINES-A-SILENT-VOICE-4K-AMV_128kbps.m4a.mp3" canPlay={entered} />
      {children}
      {!entered ? <EntranceGate onEnter={() => setEntered(true)} /> : null}
    </>
  );
}



