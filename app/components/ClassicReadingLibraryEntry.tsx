"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

function classicReadingUrl() {
  const root = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : `${window.location.pathname}/`;
  return `${root}classic/rabbit/`;
}

export function ClassicReadingLibraryEntry() {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const stage = document.querySelector<HTMLElement>(".library-focus-stage");
        const title = stage?.querySelector<HTMLElement>(".focus-meta-title")?.textContent?.trim();
        const grid = stage?.querySelector<HTMLElement>(".focus-action-grid") ?? null;
        const availability = stage?.querySelector<HTMLElement>(".focus-availability");
        const rabbitSelected = title === "토끼와 자라";

        if (availability) {
          const label = rabbitSelected ? "원작 읽기 · 이용 가능" : "원작 읽기 · 준비 중";
          if (availability.textContent !== label) availability.textContent = label;
        }
        setTarget((current) => current === (rabbitSelected ? grid : null) ? current : (rabbitSelected ? grid : null));
      });
    };

    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  if (!target) return null;

  return createPortal(
    <button
      type="button"
      className="focus-action-card"
      style={{ order: -1 }}
      aria-label="토끼전 원작 읽기"
      onClick={() => window.location.assign(classicReadingUrl())}
    >
      <div className="action-card-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22V5.5Z" />
          <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5A2.5 2.5 0 0 1 21 22V5.5Z" />
        </svg>
      </div>
      <div className="action-card-text">
        <strong className="action-card-title">원작 읽기</strong>
        <small className="action-card-sub">고전 「토끼전」의 대표 이야기를 읽어요</small>
      </div>
    </button>,
    target,
  );
}
