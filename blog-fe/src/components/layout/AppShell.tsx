"use client";

import { useState } from "react";
import { IntroSplash } from "@/components/IntroSplash";
import { SiteHeader } from "./SiteHeader";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const [introActive, setIntroActive] = useState(true);

  return (
    <div className={`app-shell${introActive ? " app-shell--intro" : ""}`}>
      <div className="page-gradient" aria-hidden />
      <div className="intro-scenery" aria-hidden />
      <div className="page-gradient-orb page-gradient-orb--1" aria-hidden />
      <div className="page-gradient-orb page-gradient-orb--2" aria-hidden />
      <div className="intro-scenery-orb intro-scenery-orb--1" aria-hidden />
      <div className="intro-scenery-orb intro-scenery-orb--2" aria-hidden />
      <div className="intro-scenery-orb intro-scenery-orb--3" aria-hidden />
      <SiteHeader />
      <IntroSplash onActiveChange={setIntroActive}>{children}</IntroSplash>
    </div>
  );
}
