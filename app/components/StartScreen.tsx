"use client";

import { useRef, useState } from "react";

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
  onStartRabbitTurtleContinuation1: () => void;
  onStartRabbitTurtleContinuation2: () => void;
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
  onStartRabbitTurtleContinuation1,
  onStartRabbitTurtleContinuation2,
  onStartOnggojibContinuation,
  onResumeSavedDraft,
  onPlayExample,
  onAbortUpdate,
}: StartScreenProps) {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const checking = localDraftStatus === "checking";
  const controlsBusy = entryBusy || busy || checking;

  return (
    <main className="entry-shell">
      <section className="entry-card" aria-labelledby="entry-title">
        <div className="entry-brand">
          <span className="brand-mark large">놀퀴즈</span>
          <span>NOLQUIZ STORY STUDIO</span>
        </div>

        <div className="entry-copy">
          <span className="eyebrow">학생이 직접 만드는 비주얼 이야기</span>
          <h1 id="entry-title">이야기를 만들어 볼까요?</h1>
          <p>
            새 이야기를 시작하거나, 이 기기와 파일에 보관한 이야기를 이어서
            만들 수 있어요.
          </p>
        </div>

        <div className="entry-choice-grid">
          <section
            className="entry-choice-card entry-new-story-card"
            aria-labelledby="new-story-title"
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

            <details className="entry-template-options">
              <summary>준비된 앞이야기에서 시작하기 · 3가지</summary>
            <div className="entry-template-heading">
              <div>
                <span className="eyebrow">이어쓰기 템플릿</span>
                <h3>준비된 앞부분 다음부터 만들기</h3>
              </div>
              <small>앞부분도 내 이야기처럼 읽고 고칠 수 있어요.</small>
            </div>
            <div className="entry-template-list">
              <button
                type="button"
                className="entry-template-card"
                onClick={onStartRabbitTurtleContinuation1}
                disabled={controlsBusy}
              >
                <span className="template-number">01</span>
                <span className="template-copy">
                  <strong>토끼와 자라 · 땅에서 만난 뒤</strong>
                  <small>자라는 토끼에게 어떤 첫 말을 건넬까요?</small>
                  <em>시작할 곳: 자라의 첫 설득</em>
                </span>
                <b>선택</b>
              </button>
              <button
                type="button"
                className="entry-template-card"
                onClick={onStartRabbitTurtleContinuation2}
                disabled={controlsBusy}
              >
                <span className="template-number">02</span>
                <span className="template-copy">
                  <strong>토끼와 자라 · 용궁에 묶인 토끼</strong>
                  <small>토끼는 위기에서 어떤 말을 꺼낼까요?</small>
                  <em>시작할 곳: 토끼의 첫 대응</em>
                </span>
                <b>선택</b>
              </button>
              <button
                type="button"
                className="entry-template-card"
                onClick={onStartOnggojibContinuation}
                disabled={controlsBusy}
              >
                <span className="template-number">03</span>
                <span className="template-copy">
                  <strong>옹고집전 · 아내의 선택 이후</strong>
                  <small>선택 뒤 가족과 두 옹고집은 어떻게 될까요?</small>
                  <em>시작할 곳: 선택 뒤 첫 컷</em>
                </span>
                <b>선택</b>
              </button>
            </div>
            </details>
          </section>

          <section
            className="entry-choice-card entry-continue-card"
            aria-labelledby="continue-story-title"
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

        <aside className="entry-example-strip" aria-label="독립 예시 작품">
          <div>
            <span className="eyebrow">둘러보기</span>
            <strong>만들기 전에 완성된 예시를 볼 수도 있어요.</strong>
            <small>놀퀴즈가 준비한 예시 작품이에요.</small>
          </div>
          <button type="button" onClick={onPlayExample} disabled={busy}>
            예시 작품 플레이
          </button>
        </aside>

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
