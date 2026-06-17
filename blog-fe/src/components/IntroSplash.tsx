"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const INTRO_SRC = "/intro.mp4";

type Phase = "checking" | "playing" | "leaving" | "done";

type Props = {
  children: React.ReactNode;
  onActiveChange?: (active: boolean) => void;
};

export function IntroSplash({ children, onActiveChange }: Props) {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("checking");

  const finish = useCallback(() => {
    setPhase("leaving");
    window.setTimeout(() => setPhase("done"), 550);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setPhase("done");
    } else {
      setPhase("playing");
    }
  }, [pathname]);

  useEffect(() => {
    onActiveChange?.(phase === "checking" || phase === "playing" || phase === "leaving");
  }, [phase, onActiveChange]);

  useEffect(() => {
    if (phase !== "playing") return;
    const v = videoRef.current;
    if (!v) return;

    const start = () => {
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => finish());
      });
    };

    if (v.readyState >= 2) {
      start();
    } else {
      v.addEventListener("loadeddata", start, { once: true });
      return () => v.removeEventListener("loadeddata", start);
    }
  }, [phase, finish]);

  const showVideo = phase === "playing" || phase === "leaving";
  const showContent = phase === "done" || phase === "leaving";

  return (
    <>
      {showVideo && (
        <div
          className={`intro-splash${phase === "leaving" ? " intro-splash--leaving" : ""}`}
          aria-hidden={phase === "leaving"}
        >
          <video
            ref={videoRef}
            className="intro-splash-video"
            src={INTRO_SRC}
            playsInline
            autoPlay
            preload="auto"
            onEnded={finish}
          />
        </div>
      )}

      <div
        className={showContent ? "app-content app-content--visible" : "app-content app-content--intro-hidden"}
        aria-hidden={!showContent}
      >
        {children}
      </div>
    </>
  );
}
