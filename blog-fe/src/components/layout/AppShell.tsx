"use client";

import { SiteHeader } from "./SiteHeader";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="app-shell">
      <div className="page-gradient" aria-hidden />
      <div className="page-gradient-orb page-gradient-orb--1" aria-hidden />
      <div className="page-gradient-orb page-gradient-orb--2" aria-hidden />
      <SiteHeader />
      <div className="app-content">{children}</div>
    </div>
  );
}
