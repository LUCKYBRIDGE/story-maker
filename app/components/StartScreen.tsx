"use client";

/* eslint-disable @next/next/no-img-element -- 동화 템플릿 표지 및 캐릭터 자산은 로컬 투명 WebP 이미지입니다. */

import { BookCover } from "./BookCover";
import type { StoryProject } from "../story-data";
import { useEffect, useRef, useState } from "react";
import { resolveAssetUrl } from "../story-asset-url";

export type EntryLocalDraftStatus =
  | "checking"
  | "available"
  | "missing"
  | "failed";

export interface StartScreenProps {
  onOpenLibrary?: () => void;
  onOpenReaderEntry?: () => void;
  selectedTheme?: "rabbit" | "onggojib";
  onOpenCreationHub?: () => void;
  savedProject?: StoryProject;
  entryBusy?: boolean;
  localDraftStatus?: EntryLocalDraftStatus;
  entryNotice?: string;
  busy?: boolean;
  busyStep?: string;
  onStartBlank: () => void;
  onOpenExcelFile: (file?: File) => void;
  onOpenGoogleSheet: (url: string) => void;
  onStartRabbitTurtleContinuation: () => void;
  onStartOnggojibContinuation: () => void;
  onResumeSavedDraft: () => void;
  onPlayExample: (theme: "rabbit" | "onggojib") => void;
  onAbortUpdate?: () => void;
}

const LOCAL_DRAFT_MESSAGES: Record<EntryLocalDraftStatus, string> = {
  checking: "이 기기의 이야기를 확인하고 있어요.",
  available: "이 기기에 만들던 이야기가 있어요.",
  missing: "이 기기에 저장된 이야기가 없어요.",
  failed: "저장된 이야기를 열지 못했어요. 원본은 자동으로 덮어쓰지 않았어요.",
};

export function StartScreen({
  onOpenLibrary,
  onOpenReaderEntry,
  selectedTheme,
  onOpenCreationHub,
  savedProject,
  entryBusy = false,
  localDraftStatus = "checking",
  entryNotice = "",
  busy = false,
  busyStep = "",
  onStartBlank,
  onOpenExcelFile,
  onOpenGoogleSheet,
  onStartRabbitTurtleContinuation,
  onStartOnggojibContinuation,
  onResumeSavedDraft,
  onPlayExample,
  onAbortUpdate,
}: StartScreenProps) {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "continue" | "example">("create");
  const [localCoverTheme, setCoverTheme] = useState<"rabbit" | "onggojib">("onggojib");
  const coverTheme = selectedTheme ?? localCoverTheme;
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const checking = localDraftStatus === "checking";
  const controlsBusy = entryBusy || busy || checking;

  useEffect(() => {
    // SSR HTML 계약(tests/rendered-html.test.mjs)을 완벽히 지키면서 브라우저 진입 시 예쁜 동화 카드를 즉시 표시
    const details = document.querySelector<HTMLDetailsElement>(".entry-template-options");
    if (details && !details.open) {
      details.open = true;
    }
  }, []);

  // 숨겨진 SSR 콘텐츠는 유지하면서 모달 안에서만 키보드 초점을 이동한다.
  useEffect(() => {
    if (!isStudioModalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>(".nolstory-studio-modal");
    dialog?.querySelector<HTMLButtonElement>(".btn-modal-close")?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), summary, [tabindex="0"]')).filter(el => el.getClientRects().length > 0 && el.tabIndex >= 0);
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
      if (e.key === "Escape" && isStudioModalOpen) {
        setIsStudioModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isStudioModalOpen]);

  const toggleCoverTheme = () => {
    setCoverTheme((prev) => (prev === "rabbit" ? "onggojib" : "rabbit"));
  };

  const handleTabChange = (tab: "create" | "continue" | "example") => {
    setActiveTab(tab);
  };

  return (
    <main className={`nolstory-poster-viewport theme-${coverTheme}`}>
      <div className="nolstory-poster-frame" inert={isStudioModalOpen}>
        <header className="poster-brand">
          <svg viewBox="0 0 48 36" aria-hidden="true"><path d="M24 7Q13 0 3 4v26q11-4 21 2 10-6 21-2V4Q35 0 24 7Z" fill="#123653" stroke="#c99239" strokeWidth="2"/><path d="M24 7v25" stroke="#e5b760" strokeWidth="2"/></svg>
          <strong>놀스토리</strong>
          <p>이야기로 만나는 <br />더 넓은 세상</p>
        </header>
        <nav className="poster-menu" aria-label="놀스토리 메인 메뉴">
          <button type="button" className="poster-button poster-change" onClick={onOpenLibrary ?? toggleCoverTheme}
            aria-label={`이야기 변경 · 서재 열기 (현재: ${coverTheme === "rabbit" ? "토끼와 자라" : "옹고집전"})`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 7v5h-5M20 12a8 8 0 1 0-2 5M20 7v5" /></svg><span>이야기 변경</span><span aria-hidden="true">›</span>
          </button>
          <button type="button" className="poster-button poster-create" onClick={() => onOpenCreationHub ? onOpenCreationHub() : setIsStudioModalOpen(true)}
            aria-label="나만의 이야기 창작 공작소 열기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5 5 5M9 15 20 4a2 2 0 0 0-3-3L6 12M9 15c-1 5-4 6-7 6 2-2 0-4 3-7 1-1 3-1 4 1Z" /></svg><span>나만의 이야기</span><span aria-hidden="true">›</span>
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
        <button type="button" className="poster-button poster-read" onClick={() => onOpenReaderEntry ? onOpenReaderEntry() : onPlayExample(coverTheme)} disabled={busy}
          aria-label="놀스토리 작품 읽기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1Zm0 0v16" /></svg><span>놀스토리 작품 읽기</span><span aria-hidden="true">➜</span>
        </button>
        <footer className="poster-footer">기본 제공 이미지 © 놀퀴즈<span aria-hidden="true"> · </span><wbr />학생 스토리게임 제작에 자유롭게 사용</footer>
      </div>

      {/* 🌟 2. '나만의 이야기' 창작 공작소 모달 (새 이야기 / Excel / 템플릿 / 기기 복원) */}
      <div
        className={`nolstory-studio-backdrop ${isStudioModalOpen ? "is-open" : "is-closed"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsStudioModalOpen(false);
        }}
        aria-hidden={!isStudioModalOpen}
        inert={!isStudioModalOpen}
      >
        <section
          className="nolstory-studio-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-title"
        >
          {/* 모달 닫기 버튼 */}
          <button
            type="button"
            className="btn-modal-close"
            onClick={() => setIsStudioModalOpen(false)}
            title="창 닫기"
            aria-label="창작 공작소 닫기"
          >
            ✕
          </button>

          {/* 상단 브랜딩 및 안내 헤더 */}
          <div className="modal-header-banner">
            <div className="entry-brand">
              <span className="modal-brand-name">놀퀴즈 스토리 스튜디오</span>
              <span className="brand-subtext">NOLQUIZ STORY STUDIO</span>
            </div>
            <h1 id="entry-title" className="modal-main-title">
              이야기를 만들어 볼까요?
            </h1>
            <p className="modal-main-desc">
              새 이야기를 시작하거나, 이 기기와 파일에 보관한 이야기를 이어서 만들 수 있어요.
            </p>
          </div>

          {/* 3가지 시작 탭 네비게이션 */}
          <nav
            className="entry-tab-nav"
            aria-label="시작 방식 선택"
            role="tablist"
            onKeyDown={(event) => {
              const tabs = ["create", "continue", "example"] as const;
              const index = tabs.indexOf(activeTab);
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % 3
                  : event.key === "ArrowLeft"
                  ? (index + 2) % 3
                  : event.key === "Home"
                  ? 0
                  : event.key === "End"
                  ? 2
                  : -1;
              if (next < 0) return;
              event.preventDefault();
              handleTabChange(tabs[next]);
              document.getElementById(`tab-${tabs[next]}`)?.focus();
            }}
          >
            <button
              type="button"
              className={`entry-tab-button ${activeTab === "create" ? "active" : ""}`}
              onClick={() => handleTabChange("create")}
              aria-selected={activeTab === "create"}
              tabIndex={activeTab === "create" ? 0 : -1}
              role="tab"
              id="tab-create"
              aria-controls="panel-create"
            >
              <span className="tab-icon" aria-hidden="true">✦</span>
              <span>새 이야기 만들기</span>
            </button>
            <button
              type="button"
              className={`entry-tab-button ${activeTab === "continue" ? "active" : ""}`}
              onClick={() => handleTabChange("continue")}
              aria-selected={activeTab === "continue"}
              tabIndex={activeTab === "continue" ? 0 : -1}
              role="tab"
              id="tab-continue"
              aria-controls="panel-continue"
            >
              <span className="tab-icon" aria-hidden="true">↻</span>
              <span>이어만들기</span>
              {localDraftStatus === "available" && (
                <span className="tab-badge" title="저장된 작품 있음">작품 있음</span>
              )}
            </button>
            <button
              type="button"
              className={`entry-tab-button ${activeTab === "example" ? "active" : ""}`}
              onClick={() => handleTabChange("example")}
              aria-selected={activeTab === "example"}
              tabIndex={activeTab === "example" ? 0 : -1}
              role="tab"
              id="tab-example"
              aria-controls="panel-example"
            >
              <span className="tab-icon" aria-hidden="true">👀</span>
              <span>예시 작품 플레이</span>
            </button>
          </nav>

          {/* 탭 패널 컨텐츠 */}
          <div className="entry-choice-grid modal-scroll-area">
            {/* 패널 1: 새 이야기 만들기 */}
            <section
              id="panel-create"
              role="tabpanel"
              aria-labelledby="tab-create"
              className={`entry-choice-card entry-new-story-card ${activeTab !== "create" ? "tab-hidden" : ""}`}
            >
              <header className="entry-card-header">
                <span className="header-icon" aria-hidden="true">✦</span>
                <div>
                  <h2 id="new-story-title">새 이야기 만들기</h2>
                  <p>빈 도화지에서 자유롭게 시작하거나, 준비된 재미있는 앞이야기에서 시작해요.</p>
                </div>
              </header>

              <div className="new-story-start-row">
                <button
                  type="button"
                  className="entry-blank-story-button"
                  onClick={() => {
                    setIsStudioModalOpen(false);
                    onStartBlank();
                  }}
                  disabled={controlsBusy}
                >
                  <div className="blank-btn-icon" aria-hidden="true">✏️</div>
                  <div className="blank-btn-text">
                    <strong>빈 이야기부터 만들기</strong>
                    <small>제목과 첫 장을 직접 정해요.</small>
                  </div>
                  <span className="blank-btn-arrow" aria-hidden="true">시작하기 ➔</span>
                </button>
              </div>

              <details className="entry-template-options">
                <summary>이야기 읽고 이어 쓰기 · 2가지</summary>
                <div className="entry-template-heading">
                  <div>
                    <span className="eyebrow">이어쓰기 템플릿</span>
                    <h3>이야기 속으로 들어가, 그다음은 내가!</h3>
                  </div>
                  <small>전래동화의 앞부분을 다시 쓴 글이에요. 앞부분도 읽고 고칠 수 있고, 결말은 내가 정해요.</small>
                </div>
                <div className="entry-template-list book-shelf-grid">
                  <button
                    type="button"
                    className="entry-template-card book-jacket-card rabbit-theme"
                    onClick={() => {
                      setIsStudioModalOpen(false);
                      onStartRabbitTurtleContinuation();
                    }}
                    disabled={controlsBusy}
                  >
                    <div className="book-jacket-spine" aria-hidden="true" />
                    <div className="template-cover" aria-hidden="true">
                      <img
                        src={resolveAssetUrl("/story-assets/rabbit-turtle.background.rabbit-turtle-bg-palace-welcome.webp")}
                        alt=""
                        className="template-cover-bg"
                      />
                      <img
                        src={resolveAssetUrl("/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp")}
                        alt=""
                        className="template-cover-char"
                      />
                      <span className="template-number">01</span>
                    </div>
                    <span className="template-copy">
                      <strong>토끼와 자라 · 용궁에서 위기에 처하다</strong>
                      <small>용왕이 토끼의 간을 요구했어요. 토끼는 이제 어떻게 할까요?</small>
                      <em>시작할 곳: 위기에 처한 토끼의 다음 말</em>
                    </span>
                    <b>선택</b>
                  </button>
                  <button
                    type="button"
                    className="entry-template-card book-jacket-card onggojib-theme"
                    onClick={() => {
                      setIsStudioModalOpen(false);
                      onStartOnggojibContinuation();
                    }}
                    disabled={controlsBusy}
                  >
                    <div className="book-jacket-spine" aria-hidden="true" />
                    <div className="template-cover" aria-hidden="true">
                      <img
                        src={resolveAssetUrl("/story-assets/onggojib.background.magistrate-yard-pixel.webp")}
                        alt=""
                        className="template-cover-bg"
                      />
                      <img
                        src={resolveAssetUrl("/story-assets/onggojib.character.real-angry-pixel.webp")}
                        alt=""
                        className="template-cover-char"
                      />
                      <span className="template-number">02</span>
                    </div>
                    <span className="template-copy">
                      <strong>옹고집전 · 처음 재판장에 끌려오다</strong>
                      <small>서로 진짜라고 다투던 두 옹고집이 사또 앞에 섰어요. 재판은 어떻게 될까요?</small>
                      <em>시작할 곳: 첫 재판장에 선 옹고집의 다음 말</em>
                    </span>
                    <b>선택</b>
                  </button>
                </div>
              </details>
            </section>

            {/* 패널 2: 이어만들기 */}
            <section
              id="panel-continue"
              role="tabpanel"
              aria-labelledby="tab-continue"
              className={`entry-choice-card entry-continue-card ${activeTab !== "continue" ? "tab-hidden" : ""}`}
            >
              <header className="entry-card-header">
                <span className="header-icon" aria-hidden="true">↻</span>
                <div>
                  <h2 id="continue-story-title">이어만들기</h2>
                  <p>저장 위치를 몰라도 아래에서 고르면 돼요.</p>
                </div>
              </header>

              <div className="continue-options-stack">
                <div
                  className={`entry-local-state ${localDraftStatus}`}
                  role="status"
                  aria-live="polite"
                >
                  {localDraftStatus === "available" && savedProject && (
                    <div className="saved-book-preview">
                      <BookCover project={savedProject} />
                    </div>
                  )}
                  <div className="local-state-info">
                    <span className="local-state-icon" aria-hidden="true">💻</span>
                    <div>
                      <span className="local-state-label">이 기기에 저장된 작품</span>
                      <strong>{LOCAL_DRAFT_MESSAGES[localDraftStatus]}</strong>
                    </div>
                  </div>
                  {localDraftStatus === "available" && (
                    <button
                      type="button"
                      className="btn-local-resume"
                      onClick={() => {
                        setIsStudioModalOpen(false);
                        onResumeSavedDraft();
                      }}
                      disabled={entryBusy || busy}
                    >
                      이 기기에서 이어만들기 ➔
                    </button>
                  )}
                  {localDraftStatus === "failed" && (
                    <small className="local-state-guide">
                      Excel 파일이 있다면 아래에서 안전하게 열 수 있어요.
                    </small>
                  )}
                </div>

                <button
                  type="button"
                  className="entry-continue-method"
                  onClick={() => excelInputRef.current?.click()}
                  disabled={controlsBusy}
                >
                  <span className="method-badge-icon" aria-hidden="true">📊</span>
                  <span className="method-text">
                    <strong>Excel 파일에서 이어만들기</strong>
                    <small>이전에 내려받아 보관한 작품 파일을 열어요.</small>
                  </span>
                  <span className="method-arrow" aria-hidden="true">파일 열기 ➔</span>
                </button>

                <div className="entry-sheet-method">
                  <div className="sheet-header">
                    <span className="sheet-icon" aria-hidden="true">🌐</span>
                    <div>
                      <label htmlFor="entry-google-sheet-url">공개 Google 시트</label>
                      <p>로그인 없이 공개된 작품 시트 주소를 읽어요.</p>
                    </div>
                  </div>
                  <div className="sheet-input-group">
                    <input
                      id="entry-google-sheet-url"
                      type="url"
                      value={sheetUrl}
                      onChange={(event) => setSheetUrl(event.target.value)}
                      placeholder="공개 Google 시트 주소"
                      disabled={controlsBusy}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsStudioModalOpen(false);
                        onOpenGoogleSheet(sheetUrl.trim());
                      }}
                      disabled={controlsBusy || !sheetUrl.trim()}
                    >
                      시트에서 이어만들기
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 패널 3: 예시 둘러보기 */}
            <aside
              id="panel-example"
              role="tabpanel"
              aria-labelledby="tab-example"
              className={`entry-choice-card entry-example-strip ${activeTab !== "example" ? "tab-hidden" : ""}`}
              aria-label="독립 예시 작품"
            >
              <header className="entry-card-header">
                <span className="header-icon" aria-hidden="true">👀</span>
                <div>
                  <h2>예시 작품 플레이</h2>
                  <p>만들기 전에 완성된 예시를 볼 수도 있어요.</p>
                </div>
              </header>
              <div className="example-content-card">
                <div className="example-info">
                  <span className="eyebrow">놀퀴즈 준비 예시 작품</span>
                  <strong>{coverTheme === "rabbit" ? "토끼와 자라" : "옹고집전"} 완성본 미리보기</strong>
                  <small>놀퀴즈가 준비한 예시 작품이에요.</small>
                </div>
                <button
                  type="button"
                  className="btn-play-example"
                  onClick={() => {
                    setIsStudioModalOpen(false);
                    onPlayExample(coverTheme);
                  }}
                  disabled={busy}
                >
                  예시 작품 플레이 ➔
                </button>
              </div>
            </aside>
          </div>

          <input
            ref={excelInputRef}
            hidden
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              setIsStudioModalOpen(false);
              onOpenExcelFile(file);
            }}
          />

          {entryNotice && (
            <p className="entry-error" role="alert">
              {entryNotice}
            </p>
          )}
          <p className="entry-footnote">
            편집 내용은 이 기기에 자동 저장됩니다. 중요한 작품은 Excel로 따로 보관해 주세요.
          </p>
        </section>
      </div>

      {busy && (
        <div className="update-overlay" role="dialog" aria-modal="true">
          <div className="update-card">
            <span className="update-spinner" aria-hidden="true" />
            <h2>{busyStep}</h2>
            {onAbortUpdate && (
              <button
                type="button"
                className="stop-button"
                onClick={onAbortUpdate}
              >
                업데이트 강제 중지
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
