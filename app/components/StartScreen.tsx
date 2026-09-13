"use client";
/* eslint-disable @next/next/no-img-element -- 기존 로컬 포스터 원본을 보존합니다. */
import { resolveAssetUrl } from "../story-asset-url";
export type EntryLocalDraftStatus = "checking" | "available" | "missing" | "failed";
export interface StartScreenProps {
  onOpenLibrary: () => void;
  onOpenReaderEntry: () => void;
  onOpenMyStories: () => void;
  onToggleTheme?: () => void;
  onOpenQr?: () => void;
  selectedTheme?: "rabbit" | "onggojib";
  busy?: boolean;
}
export function StartScreen({ onOpenLibrary, onOpenReaderEntry, onOpenMyStories, onToggleTheme,
  onOpenQr, selectedTheme: coverTheme = "onggojib", busy = false }: StartScreenProps) {
  const nextThemeName = coverTheme === "rabbit" ? "옹고집전" : "토끼와 자라";
  return (
    <main className={`nolstory-poster-viewport theme-${coverTheme}`}>
      <div className="nolstory-poster-frame">
        <header className="poster-brand">
          <svg viewBox="0 0 48 36" aria-hidden="true"><path d="M24 7Q13 0 3 4v26q11-4 21 2 10-6 21-2V4Q35 0 24 7Z" fill="#123653" stroke="#c99239" strokeWidth="2"/><path d="M24 7v25" stroke="#e5b760" strokeWidth="2"/></svg>
          <div className="poster-brand-title">
            <strong>놀스토리</strong>
            {onToggleTheme && (
              <button
                type="button"
                className="poster-theme-refresh"
                onClick={onToggleTheme}
                disabled={busy}
                aria-label={`다른 이야기 표지로 바꾸기 (${nextThemeName})`}
                title={`다른 이야기 표지로 바꾸기 (${nextThemeName})`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
              </button>
            )}
            {onOpenQr && (
              <button
                type="button"
                className="poster-qr-btn"
                onClick={onOpenQr}
                disabled={busy}
                aria-label="교실 접속 QR 코드 열기"
                title="교실 접속 QR 코드 열기"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="6.5" y="6.5" width="0.1" height="0.1" strokeWidth="3" />
                  <rect x="17.5" y="6.5" width="0.1" height="0.1" strokeWidth="3" />
                  <rect x="6.5" y="17.5" width="0.1" height="0.1" strokeWidth="3" />
                  <path d="M14 14h3v3h-3z" />
                  <path d="M20 14v3" />
                  <path d="M14 20h6" />
                </svg>
              </button>
            )}
          </div>
          <p>이야기로 만나는 <br />더 넓은 세상</p>
        </header>
        <nav className="poster-menu" aria-label="놀스토리 메인 메뉴">
          <button type="button" className="poster-button poster-create" onClick={onOpenMyStories}
            aria-label="나만의 이야기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5 5 5M9 15 20 4a2 2 0 0 0-3-3L6 12M9 15c-1 5-4 6-7 6 2-2 0-4 3-7 1-1 3-1 4 1Z" /></svg><span>나만의 이야기</span><span aria-hidden="true">›</span>
          </button>
          <button type="button" className="poster-button poster-library" onClick={onOpenLibrary} aria-label="서재 입장">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3v18M21 3v18M3 12h18M3 21h18M7 4v8M11 4v8M16 4l2 8M7 15v6M12 15v6M17 15v6" /></svg><span>서재 입장</span><span aria-hidden="true">›</span>
          </button>
        </nav>
        <section className="poster-heading" aria-live="polite" aria-atomic="true">
          <svg className="poster-leaves" viewBox="0 0 48 56" aria-hidden="true"><path d="M24 54Q23 30 32 8M25 40 10 25" fill="none" stroke="#7c8c59" strokeWidth="2"/><path d="M29 26Q18 10 35 2q8 14-6 24M23 40Q6 42 5 22q17 1 18 18M26 43q0-18 19-18-1 17-19 18" fill="#96a474"/></svg>
          <h2><span>{coverTheme === "rabbit" ? "토끼" : "옹고"}</span>{coverTheme === "rabbit" ? "와 자라" : "집전"}</h2>
          <p className="poster-author"><span aria-hidden="true">✦</span> 이 이야기의 작가: 당신 <span aria-hidden="true">✦</span></p>
          <p className="poster-description">당신이 직접 만들어 가는 이야기</p>
        </section>
        <div className="poster-scene-space" aria-hidden="true">
          <img
            src={resolveAssetUrl(`/story-assets/${coverTheme === "rabbit" ? "rabbit-turtle" : "onggojib"}.poster.art.webp`)}
            alt=""
            width={coverTheme === "rabbit" ? 940 : 941}
            height={1672}
            className="nolstory-poster-img"
            fetchPriority="high"
          />
        </div>
        <button type="button" className="poster-button poster-read" onClick={onOpenReaderEntry} disabled={busy}
          aria-label="이야기 읽기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1Zm0 0v16" /></svg><span>이야기 읽기</span><span aria-hidden="true">➜</span>
        </button>
        <footer className="poster-footer">© 놀퀴즈</footer>
      </div>

    </main>
  );
}
