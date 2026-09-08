"use client";

/* eslint-disable @next/next/no-img-element -- 동화 템플릿 표지 및 캐릭터 자산은 로컬 투명 WebP 이미지입니다. */

import { useEffect, useRef, useState } from "react";

export type EntryLocalDraftStatus =
  | "checking"
  | "available"
  | "missing"
  | "failed";

export interface StartScreenProps {
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
  onPlayExample: () => void;
  onAbortUpdate?: () => void;
}

const LOCAL_DRAFT_MESSAGES: Record<EntryLocalDraftStatus, string> = {
  checking: "이 기기의 이야기를 확인하고 있어요.",
  available: "이 기기에 만들던 이야기가 있어요.",
  missing: "이 기기에 저장된 이야기가 없어요.",
  failed: "저장된 이야기를 열지 못했어요. 원본은 자동으로 덮어쓰지 않았어요.",
};

export function StartScreen({
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
  const [coverTheme, setCoverTheme] = useState<"rabbit" | "onggojib">("rabbit");
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const checking = localDraftStatus === "checking";
  const controlsBusy = entryBusy || busy || checking;

  useEffect(() => {
    // SSR HTML 계약(tests/rendered-html.test.mjs)을 완벽히 지키면서 브라우저 진입 시 예쁜 동화 카드를 즉시 표시
    const details = document.querySelector<HTMLDetailsElement>(".entry-template-options");
    if (details && !details.open) {
      details.open = true;
    }
    // 첫 진입/새로고침 시 50% 확률로 옹고집전 또는 토끼와 자라 표지 랜덤 선택
    if (Math.random() < 0.5) {
      requestAnimationFrame(() => {
        setCoverTheme("onggojib");
      });
    }
  }, []);

  const toggleCoverTheme = () => {
    setCoverTheme((prev) => (prev === "rabbit" ? "onggojib" : "rabbit"));
  };

  const handleOpenBook = () => {
    if (isFlipping || isBookOpen) return;
    setIsFlipping(true);
    setTimeout(() => {
      setIsBookOpen(true);
      setIsFlipping(false);
    }, 600);
  };

  const handleCloseBook = () => {
    if (isFlipping || !isBookOpen) return;
    setIsFlipping(true);
    setIsBookOpen(false);
    setTimeout(() => {
      setIsFlipping(false);
    }, 600);
  };

  return (
    <main className={`entry-shell theme-${coverTheme} ${isBookOpen ? "book-is-open" : "book-is-closed"}`}>
      <section className="entry-card book-cover-edition" aria-labelledby="entry-title">
        {/* A. 닫힌 동화책 겉표지 뷰: 사용자가 첫 화면에서 오직 한 권의 동화책 표지만 마주하는 화면 */}
        <div className={`storybook-closed-view ${isBookOpen ? "is-hidden" : "is-visible"}`}>
          {/* 상단 헤더: 브랜드 및 다른 동화책 보기 토글 */}
          <div className="book-cover-header">
            <div className="entry-brand">
              <span className="brand-mark large">놀퀴즈</span>
              <span className="brand-subtext">NOLQUIZ STORY STUDIO</span>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="theme-toggle-button"
                onClick={toggleCoverTheme}
                title="다른 동화책 표지로 바꾸기"
              >
                ↻ 다른 동화 보기 ({coverTheme === "rabbit" ? "옹고집전" : "토끼와 자라"})
              </button>
              <div className="book-cover-seal" aria-hidden="true">
                ✦ 동화책 창작 스튜디오 ✦
              </div>
            </div>
          </div>

          {/* 1. 웅장하고 아름다운 진짜 양장본 동화책 겉표지 (클릭/터치 시 책 넘김 애니메이션) */}
          <div className="storybook-3d-stage">
            <div
              className={`main-storybook-cover theme-${coverTheme} ${isFlipping ? "flipping" : ""}`}
              onClick={handleOpenBook}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenBook();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="동화책을 터치하여 책을 펼치고 이야기 시작하기"
            >
              <div className="cover-spine" aria-hidden="true" />
              <div className="cover-gold-trim" aria-hidden="true" />
              <div className="cover-corner top-left" aria-hidden="true" />
              <div className="cover-corner top-right" aria-hidden="true" />
              <div className="cover-corner bottom-left" aria-hidden="true" />
              <div className="cover-corner bottom-right" aria-hidden="true" />

              {/* 터치 안내 플로팅 뱃지 */}
              <div className="cover-open-callout" aria-hidden="true">
                <span className="open-callout-icon">📖</span>
                <span className="open-callout-text">터치하여 책 펼치기</span>
                <span className="open-callout-arrow">➔</span>
              </div>

              <div className="cover-badge-wrap">
                <span className="cover-badge">✦ 놀퀴즈 명작 전래동화 ✦</span>
              </div>

              <div className="cover-stage-illustration" aria-hidden="true">
                {coverTheme === "rabbit" ? (
                  <>
                    <img
                      src="/story-assets/rabbit-turtle.background.rabbit-turtle-bg-palace-welcome.webp"
                      alt=""
                      className="cover-bg-image sea-palace"
                    />
                    <div className="cover-stage-characters">
                      <div className="stage-char char-turtle">
                        <img
                          src="/story-assets/rabbit-turtle.character.turtle-unified-720x900.webp"
                          alt=""
                        />
                      </div>
                      <div className="stage-char char-rabbit">
                        <img
                          src="/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp"
                          alt=""
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src="/story-assets/onggojib.background.magistrate-yard-pixel.webp"
                      alt=""
                      className="cover-bg-image court-yard"
                    />
                    <div className="cover-stage-characters">
                      <div className="stage-char char-onggojib">
                        <img
                          src="/story-assets/onggojib.character.real-angry-pixel.webp"
                          alt=""
                        />
                      </div>
                      <div className="stage-char char-fake-onggojib">
                        <img
                          src="/story-assets/onggojib.character.double-blue-gentle-consistent-pixel.webp"
                          alt=""
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="cover-stage-lighting" />
              </div>

              <div className="cover-title-section">
                <h2 className="cover-book-title">
                  {coverTheme === "rabbit" ? "토끼와 자라" : "옹고집전"}
                </h2>
                <p className="cover-book-author">지은이: 놀퀴즈</p>
                <div className="cover-subtitle-box">
                  <span className="eyebrow">학생이 직접 만드는 비주얼 이야기</span>
                  <h1 id="entry-title">이야기를 만들어 볼까요?</h1>
                  <p>
                    새 이야기를 시작하거나, 이 기기와 파일에 보관한 이야기를 이어서
                    만들 수 있어요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* B. 펼쳐진 책 내부 (Book Inside Spread): 터치 후 3D 책장이 넘어가며 나타나는 화면 */}
        <div className={`book-inside-spread ${isBookOpen ? "is-visible" : "is-hidden"}`}>
          <div className="open-book-header">
            <div className="entry-brand">
              <span className="brand-mark large">놀퀴즈</span>
              <span className="brand-subtext">NOLQUIZ STORY STUDIO</span>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="theme-toggle-button"
                onClick={toggleCoverTheme}
                title="다른 동화 테마로 바꾸기"
              >
                ↻ 동화 테마 ({coverTheme === "rabbit" ? "옹고집전" : "토끼와 자라"})
              </button>
              <button
                type="button"
                className="btn-close-book"
                onClick={handleCloseBook}
                title="동화책 겉표지로 돌아가기"
              >
                📕 책 덮기
              </button>
            </div>
          </div>

          {/* 2. 표지 하단 3대 즉시 시작 액션 바 (예시작품 읽기 / 새 이야기 쓰기 / 이어 쓰기) */}
          <div className="book-band-quick-actions" role="region" aria-label="이야기 바로 시작">
            <button
              type="button"
              className="band-action-btn action-example"
              onClick={onPlayExample}
              disabled={busy}
            >
              <span className="btn-icon" aria-hidden="true">👀</span>
              <div className="btn-content">
                <strong>예시 작품 읽어보기</strong>
                <small>완성된 동화 바로 감상하기</small>
              </div>
            </button>
            <button
              type="button"
              className="band-action-btn action-create"
              onClick={onStartBlank}
              disabled={controlsBusy}
            >
              <span className="btn-icon" aria-hidden="true">✦</span>
              <div className="btn-content">
                <strong>새 이야기 쓰기</strong>
                <small>빈 이야기부터 시작하기</small>
              </div>
            </button>
            <button
              type="button"
              className={`band-action-btn action-continue ${activeTab === "continue" ? "active" : ""}`}
              onClick={() => setActiveTab("continue")}
            >
              <span className="btn-icon" aria-hidden="true">📖</span>
              <div className="btn-content">
                <strong>이어 쓰기</strong>
                <small>템플릿 및 보관 파일 열기</small>
              </div>
            </button>
          </div>

        <nav className="entry-tab-nav" aria-label="시작 방식 선택" role="tablist"
          onKeyDown={(event) => {
            const tabs = ["create", "continue", "example"] as const;
            const index = tabs.indexOf(activeTab);
            const next = event.key === "ArrowRight" ? (index + 1) % 3
              : event.key === "ArrowLeft" ? (index + 2) % 3
              : event.key === "Home" ? 0 : event.key === "End" ? 2 : -1;
            if (next < 0) return;
            event.preventDefault();
            setActiveTab(tabs[next]);
            document.getElementById(`tab-${tabs[next]}`)?.focus();
          }}>
          <button
            type="button"
            className={`entry-tab-button ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
            aria-selected={activeTab === "create"}
            tabIndex={activeTab === "create" ? 0 : -1}
            role="tab"
            id="tab-create"
            aria-controls="panel-create"
          >
            ✦ 새 이야기 만들기
          </button>
          <button
            type="button"
            className={`entry-tab-button ${activeTab === "continue" ? "active" : ""}`}
            onClick={() => setActiveTab("continue")}
            aria-selected={activeTab === "continue"}
            tabIndex={activeTab === "continue" ? 0 : -1}
            role="tab"
            id="tab-continue"
            aria-controls="panel-continue"
          >
            ↻ 이어만들기
          </button>
          <button
            type="button"
            className={`entry-tab-button ${activeTab === "example" ? "active" : ""}`}
            onClick={() => setActiveTab("example")}
            aria-selected={activeTab === "example"}
            tabIndex={activeTab === "example" ? 0 : -1}
            role="tab"
            id="tab-example"
            aria-controls="panel-example"
          >
            👀 둘러보기
          </button>
        </nav>

        <div className="entry-choice-grid">
          <section
            id="panel-create"
            role="tabpanel"
            aria-labelledby="tab-create"
            className={`entry-choice-card entry-new-story-card ${activeTab !== "create" ? "tab-hidden" : ""}`}
          >
            <header>
              <span aria-hidden="true">✦</span>
              <div>
                <h2 id="new-story-title">새 이야기 만들기</h2>
                <p>빈 이야기 또는 준비된 앞이야기에서 시작해요.</p>
              </div>
            </header>

            <button
              type="button"
              className="entry-blank-story-button"
              onClick={onStartBlank}
              disabled={controlsBusy}
            >
              <strong>빈 이야기부터 만들기</strong>
              <small>제목과 첫 장을 직접 정해요.</small>
            </button>

            {localDraftStatus === "available" && (
              <div className="entry-quick-resume">
                <span>이 기기에 만들던 이야기가 있어요.</span>
                <button
                  type="button"
                  onClick={onResumeSavedDraft}
                  disabled={entryBusy || busy}
                >
                  이 기기에서 이어만들기 ➔
                </button>
              </div>
            )}

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
                onClick={onStartRabbitTurtleContinuation}
                disabled={controlsBusy}
              >
                <div className="book-jacket-spine" aria-hidden="true" />
                <div className="template-cover" aria-hidden="true">
                  <img
                    src="/story-assets/rabbit-turtle.background.rabbit-turtle-bg-palace-welcome.webp"
                    alt=""
                    className="template-cover-bg"
                  />
                  <img
                    src="/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp"
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
                onClick={onStartOnggojibContinuation}
                disabled={controlsBusy}
              >
                <div className="book-jacket-spine" aria-hidden="true" />
                <div className="template-cover" aria-hidden="true">
                  <img
                    src="/story-assets/onggojib.background.magistrate-yard-pixel.webp"
                    alt=""
                    className="template-cover-bg"
                  />
                  <img
                    src="/story-assets/onggojib.character.real-angry-pixel.webp"
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

          <section
            id="panel-continue"
            role="tabpanel"
            aria-labelledby="tab-continue"
            className={`entry-choice-card entry-continue-card ${activeTab !== "continue" ? "tab-hidden" : ""}`}
          >
            <header>
              <span aria-hidden="true">↻</span>
              <div>
                <h2 id="continue-story-title">이어만들기</h2>
                <p>저장 위치를 몰라도 아래에서 고르면 돼요.</p>
              </div>
            </header>

            <div
              className={`entry-local-state ${localDraftStatus}`}
              role="status"
              aria-live="polite"
            >
              <strong>{LOCAL_DRAFT_MESSAGES[localDraftStatus]}</strong>
              {localDraftStatus === "available" && (
                <button
                  type="button"
                  onClick={onResumeSavedDraft}
                  disabled={entryBusy || busy}
                >
                  이 기기에서 이어만들기
                </button>
              )}
              {localDraftStatus === "failed" && (
                <small>Excel 파일이 있다면 아래에서 안전하게 열 수 있어요.</small>
              )}
            </div>

            <button
              type="button"
              className="entry-continue-method"
              onClick={() => excelInputRef.current?.click()}
              disabled={controlsBusy}
            >
              <span aria-hidden="true">X</span>
              <span>
                <strong>Excel 파일에서 이어만들기</strong>
                <small>이전에 내려받아 보관한 작품 파일을 열어요.</small>
              </span>
            </button>

            <div className="entry-sheet-method">
              <label htmlFor="entry-google-sheet-url">공개 Google 시트</label>
              <p>로그인 없이 공개된 작품 시트 주소를 읽어요.</p>
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
                onClick={() => onOpenGoogleSheet(sheetUrl.trim())}
                disabled={controlsBusy || !sheetUrl.trim()}
              >
                시트에서 이어만들기
              </button>
            </div>
          </section>

          <aside
            id="panel-example"
            role="tabpanel"
            aria-labelledby="tab-example"
            className={`entry-example-strip ${activeTab !== "example" ? "tab-hidden" : ""}`}
            aria-label="독립 예시 작품"
          >
            <div>
              <span className="eyebrow">둘러보기</span>
              <strong>만들기 전에 완성된 예시를 볼 수도 있어요.</strong>
              <small>놀퀴즈가 준비한 예시 작품이에요.</small>
            </div>
            <button type="button" onClick={onPlayExample} disabled={busy}>
              예시 작품 플레이
            </button>
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
            onOpenExcelFile(file);
          }}
        />

        {entryNotice && (
          <p className="entry-error" role="alert">
            {entryNotice}
          </p>
        )}
        <p className="entry-footnote">
          편집 내용은 이 기기에 자동 저장됩니다. 중요한 작품은 Excel로 따로
          보관해 주세요.
        </p>
        </div>
      </section>
      <footer className="entry-copyright">
        기본 제공 이미지 © 놀퀴즈 · 학생 스토리게임 제작에 자유롭게 사용
      </footer>
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
