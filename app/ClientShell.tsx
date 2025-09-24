"use client";

import React from "react";
import BackgroundVideo from "./BackgroundVideo";
import EntranceGate from "./EntranceGate";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [entered, setEntered] = React.useState(false);
  return (
    <>
      <BackgroundVideo canPlay={entered} />
      {children}
      {!entered ? <EntranceGate onEnter={() => setEntered(true)} /> : null}
    </>
  );
}



