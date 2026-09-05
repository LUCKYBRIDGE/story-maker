"use client";

import type { ReactNode } from "react";
import type { StoryProjectSaveStatus } from "../story-project-repository";

export type StudioWorkspaceMode = "plan" | "create";

const SAVE_STATUS_LABELS: Record<StoryProjectSaveStatus, string> = {
  idle: "기기 저장 준비",
  saving: "기기에 저장 중",
  saved: "기기에 저장됨",
  failed: "기기 저장 실패 · Excel로 보관해 주세요",
};

export function StudioShell({
  currentLocation,
  saveStatus,
  busy,
  projectToolsOpen,
  onReturnHome,
  onToggleProjectTools,
  children,
}: {
  currentLocation: string;
  saveStatus: StoryProjectSaveStatus;
  busy: boolean;
  projectToolsOpen: boolean;
  onReturnHome: () => void;
  onToggleProjectTools: () => void;
  children: ReactNode;
}) {
  return (
    <main className="creator-shell">
      <header className="creator-header" aria-label="스토리 스튜디오 작업 머리말">
        <div className="creator-brand">
          <span className="brand-mark" aria-hidden="true">
            놀퀴즈
          </span>
          <div>
            <strong>스토리 스튜디오</strong>
            <small title={currentLocation} aria-label={`현재 위치: ${currentLocation}`}>
              {currentLocation}
            </small>
          </div>
        </div>
        <div className="creator-header-actions">
          <button
            type="button"
            className="quiet-button"
            onClick={onReturnHome}
            disabled={busy}
          >
            메인으로
          </button>
          <span
            className={`save-state save-state-${saveStatus}`}
            role="status"
            aria-live="polite"
          >
            {SAVE_STATUS_LABELS[saveStatus]}
          </span>
          <button
            type="button"
            className="quiet-button"
            aria-expanded={projectToolsOpen}
            aria-controls="studio-project-tools"
            onClick={onToggleProjectTools}
          >
            파일·복구
          </button>
        </div>
      </header>
      {children}
    </main>
  );
}

export function StudioPrimaryNav({
  workspaceMode,
  canPlay,
  onWorkspaceModeChange,
  onPlay,
}: {
  workspaceMode: StudioWorkspaceMode;
  canPlay: boolean;
  onWorkspaceModeChange: (mode: StudioWorkspaceMode) => void;
  onPlay: () => void;
}) {
  return (
    <nav className="creator-primary-nav" aria-label="창작 과정">
      <button
        type="button"
        className={workspaceMode === "plan" ? "active" : ""}
        aria-current={workspaceMode === "plan" ? "step" : undefined}
        onClick={() => onWorkspaceModeChange("plan")}
      >
        <span aria-hidden="true">1</span>
        <div>
          <strong>이야기 구성</strong>
          <small>주제·인물·장의 흐름을 정해요</small>
        </div>
      </button>
      <button
        type="button"
        className={workspaceMode === "create" ? "active" : ""}
        aria-current={workspaceMode === "create" ? "step" : undefined}
        onClick={() => onWorkspaceModeChange("create")}
      >
        <span aria-hidden="true">2</span>
        <div>
          <strong>대본·컷 쓰기</strong>
          <small>대사·해설을 쓰고 이미지를 골라요</small>
        </div>
      </button>
      <button type="button" onClick={onPlay} disabled={!canPlay}>
        <span aria-hidden="true">3</span>
        <div>
          <strong>플레이</strong>
          <small>마지막으로 적용한 버전을 확인해요</small>
        </div>
      </button>
    </nav>
  );
}

export function StudioApplyDock({ onApply }: { onApply: () => void }) {
  return (
    <section className="creator-apply-dock" aria-label="플레이 버전 업데이트">
      <div>
        <span className="status-dot" aria-hidden="true" />
        <div>
          <strong>플레이에 아직 적용하지 않은 수정이 있어요.</strong>
          <small>편집 내용과 창작 메모는 기기에 자동 저장됐어요.</small>
        </div>
      </div>
      <button type="button" onClick={onApply}>
        플레이에 적용
      </button>
    </section>
  );
}
