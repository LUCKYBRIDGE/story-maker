"use client";
import { useEffect, useRef } from "react";

/** One cancellable opening. No storage changes or narrative timing live here. */
export function TheaterCurtain({ onComplete, closing = false }: { onComplete: () => void; closing?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(onComplete);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let disposed = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { if (!disposed) completeRef.current(); };
    if (media.matches) { finish(); return; }
    const animations = Array.from(root.querySelectorAll<HTMLElement>(".theater-drape")).map((panel,index) =>
      panel.animate((closing ? [102,0] : [0,102]).map(distance => ({ transform: `translateX(${index === 0 ? "-" : ""}${distance}%)` })),
        {duration: 850, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards"}));
    Promise.all(animations.map(animation => animation.finished)).then(finish).catch(() => {});
    media.addEventListener("change", finish);
    return () => { disposed = true; animations.forEach(a => a.cancel()); media.removeEventListener("change", finish); };
  }, [closing]);
  return <div ref={rootRef} className="theater-curtain" aria-label={closing ? "무대의 막이 내려요" : "무대가 열리고 있어요"}>
    <div className="theater-drape left" aria-hidden="true" /><div className="theater-drape right" aria-hidden="true" />
    <div className="theater-spotlight-beam" aria-hidden="true" />
    <div className="theater-spotlight-glow" aria-hidden="true" />
    <button type="button" onClick={onComplete} autoFocus>연출 건너뛰기</button>
  </div>;
}
