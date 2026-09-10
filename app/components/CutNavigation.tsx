"use client";

import { useEffect, useEffectEvent } from "react";

/** Shared dock for manuscript and focused editing; never handles modal/IME keys. */
export function CutNavigation({ index, total, onMove, onAdd }: {
  index: number;
  total: number;
  onMove: (delta: -1 | 1) => void;
  onAdd: () => void;
}) {
  const handleKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.repeat ||
        !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        !(event.target instanceof Element) || !event.target.closest(".making-workspace") ||
        event.target.closest('[role="dialog"], dialog, [role="region"][aria-label="창작 메모"]')) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -1 : 1;
    if (index + delta >= 0 && index + delta < total) onMove(delta);
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKey(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  return <nav className="cut-navigation-dock" aria-label="항상 보이는 컷 이동">
    <button type="button" disabled={index <= 0} aria-keyshortcuts="Alt+ArrowLeft" title="Alt + ←" onPointerDown={event => event.preventDefault()} onClick={() => onMove(-1)}>◀ 이전 컷</button>
    <strong aria-live="polite">컷 {index + 1} / {total}</strong>
    <button type="button" disabled={index >= total - 1} aria-keyshortcuts="Alt+ArrowRight" title="Alt + →" onPointerDown={event => event.preventDefault()} onClick={() => onMove(1)}>다음 컷 ▶</button>
    <button type="button" onClick={onAdd}>+ 컷 추가</button>
    <small>Alt + ← / →</small>
  </nav>;
}
