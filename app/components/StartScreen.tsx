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
  const checking = localDraftStatus === "checking";
  const controlsBusy = entryBusy || busy || checking;

  useEffect(() => {
    // SSR HTML 계약(tests/rendered-html.test.mjs)을 완벽히 지키면서 브라우저 진입 시 예쁜 동화 카드를 즉시 표시
    const details = document.querySelector<HTMLDetailsElement>(".entry-template-options");
    if (details && !details.open) {
      details.open = true;
    }
  }, []);

  return (
    <main className="entry-shell">
      <section className="entry-card" aria-labelledby="entry-title">
        <div className="entry-brand">
          <span className="brand-mark large">놀퀴즈</span>
          <span className="brand-subtext">NOLQUIZ STORY STUDIO</span>
          <div className="entry-brand-mascots" aria-hidden="true">
            <img
              src="/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp"
              alt=""
              className="brand-mascot mascot-rabbit"
            />
            <img
              src="/story-assets/rabbit-turtle.character.turtle-unified-720x900.webp"
              alt=""
              className="brand-mascot mascot-turtle"
            />
            <img
              src="/story-assets/onggojib.character.real-angry-pixel.webp"
              alt=""
              className="brand-mascot mascot-onggojib"
            />
          </div>
        </div>

        <div className="book-cover-hero-illustration" aria-hidden="true">
          <div className="hero-artwork-bg">
            <img
              src="/story-assets/rabbit-turtle.background.rabbit-turtle-bg-palace-welcome.webp"
              alt=""
              className="hero-bg-image sea-palace"
            />
            <img
              src="/story-assets/onggojib.background.magistrate-yard-pixel.webp"
              alt=""
              className="hero-bg-image court-yard"
            />
          </div>
          <div className="hero-artwork-characters">
            <div className="hero-char-wrap char-turtle">
              <img
                src="/story-assets/rabbit-turtle.character.turtle-unified-720x900.webp"
                alt=""
              />
            </div>
            <div className="hero-char-wrap char-rabbit">
              <img
                src="/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp"
                alt=""
              />
            </div>
            <div className="hero-char-wrap char-onggojib">
              <img
                src="/story-assets/onggojib.character.real-angry-pixel.webp"
                alt=""
              />
            </div>
            <div className="hero-char-wrap char-fake-onggojib">
              <img
                src="/story-assets/onggojib.character.double-blue-gentle-consistent-pixel.webp"
                alt=""
              />
            </div>
          </div>
          <div className="hero-artwork-overlay">
            <span className="hero-book-seal">✦ 놀퀴즈 명작 전래동화 컬렉션 ✦</span>
          </div>
        </div>

        <div className="entry-copy">
          <span className="eyebrow">학생이 직접 만드는 비주얼 이야기</span>
          <h1 id="entry-title">이야기를 만들어 볼까요?</h1>
          <p>
            새 이야기를 시작하거나, 이 기기와 파일에 보관한 이야기를 이어서
            만들 수 있어요.
          </p>
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
            <div className="entry-template-list">
              <button
                type="button"
                className="entry-template-card rabbit-theme"
                onClick={onStartRabbitTurtleContinuation}
                disabled={controlsBusy}
              >
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
                className="entry-template-card onggojib-theme"
                onClick={onStartOnggojibContinuation}
                disabled={controlsBusy}
              >
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
