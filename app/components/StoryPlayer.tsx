"use client";

import { StoryStageCanvas } from "./StoryStage";

import { useEffect, useRef } from "react";
import type { StoryProject } from "../story-data";
import { resolveStoryStage } from "../story-stage-view";
import { findFirstStoryLineIndexForChapter, selectStoryPlayerPosition } from "../story-studio-selectors";
import { shouldHandleStoryPlayerKey } from "../story-studio-player-state";
import type { PlayedStoryCut } from "../story-editor-location";
import { ASSET_BY_ID } from "./AssetPickerButton";
import { StoryRevisionCheck } from "./StoryRevisionCheck";
import type {
  StoryRevisionResponse,
  StoryRevisionResponses,
} from "../story-revision-cycle";

export function DialogueText({ text }: { text: string }) {
  const parts = text.split(/(\([^()]*\)|（[^（）]*）)/g);

  return (
    <>
      {parts.map((part, index) =>
        /^\([^()]*\)$|^（[^（）]*）$/.test(part) ? (
          <span className="parenthetical-direction" key={`${part}-${index}`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function DialogueInline({
  speakerName,
  text,
}: {
  speakerName: string;
  text: string;
}) {
  return (
    <>
      <strong className="dialogue-speaker">
        {speakerName || "화자 없음"}:
      </strong>{" "}
      <DialogueText text={text} />
    </>
  );
}

export interface StoryPlayerProps {
  project: StoryProject;
  startIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  onEditCut?: (cut: PlayedStoryCut) => void;
  isExample?: boolean;
  revisionResponses: StoryRevisionResponses;
  onRevisionResponse: (promptId: string, response: StoryRevisionResponse) => void;
}

export function StoryPlayer({
  project,
  startIndex,
  onIndexChange,
  onBack,
  onEditCut,
  isExample = false,
  revisionResponses,
  onRevisionResponse,
}: StoryPlayerProps) {
  const playerRef = useRef<HTMLElement>(null);
  const { lines, index, line, chapter, playableChapters, number, total, canPrevious, canNext } =
    selectStoryPlayerPosition(project, startIndex);
  useEffect(() => {
    playerRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const stage = resolveStoryStage(chapter, line);

  // 다음 컷 자산 선로딩 (끊김 없는 플레이 보장)
  useEffect(() => {
    const nextLine = lines[index + 1];
    if (!nextLine) return;
    const nextChapter = project.chapters.find(
      (candidate) => candidate.id === nextLine.chapterId,
    );
    const nextBgId = nextLine.backgroundId || nextChapter?.backgroundId || "";
    const nextLeftId = nextLine.leftAssetId || nextChapter?.leftAssetId || "";
    const nextRightId = nextLine.rightAssetId || nextChapter?.rightAssetId || "";

    const bgSrc = ASSET_BY_ID.get(nextBgId)?.src;
    const leftSrc = ASSET_BY_ID.get(nextLeftId)?.src;
    const rightSrc = ASSET_BY_ID.get(nextRightId)?.src;

    if (bgSrc && typeof Image !== "undefined") {
      const img = new Image();
      img.src = bgSrc;
    }
    if (leftSrc && typeof Image !== "undefined") {
      const img = new Image();
      img.src = leftSrc;
    }
    if (rightSrc && typeof Image !== "undefined") {
      const img = new Image();
      img.src = rightSrc;
    }
  }, [lines, index, project.chapters]);

  // 키보드 조작 (다음/이전 컷, 편집 복귀)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandleStoryPlayerKey(event) ||
        !(event.target instanceof Node) || !playerRef.current?.contains(event.target)) {
        return;
      }

      if (
        event.key === "ArrowRight" ||
        event.key === " " ||
        event.key === "Enter"
      ) {
        event.preventDefault();
        if (canNext) {
          onIndexChange(index + 1);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (canPrevious) {
          onIndexChange(index - 1);
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canNext, canPrevious, onBack, onIndexChange, index]);

  const playChapter = (chapterId: string) => {
    const index = findFirstStoryLineIndexForChapter({ lines, chapterId });
    if (index >= 0) onIndexChange(index);
  };
  const atStoryEnd = total > 0 && !canNext;

  return (
    <main className="player-shell" ref={playerRef} tabIndex={-1} aria-label={isExample ? "예시 스토리 플레이" : "스토리 플레이"}>
      <div
        className="story-stage"
      >
        <header className="player-topbar">
          <div>
            <span className="eyebrow">스토리 플레이</span>
            <strong>{project.title}</strong>
          </div>
          <div className="player-top-actions" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            <label className="chapter-jump">
              <span className="sr-only">장 골라 시작</span>
              <select
                value={chapter?.id ?? ""}
                disabled={playableChapters.length === 0}
                onChange={(event) => playChapter(event.target.value)}
              >
                {playableChapters.length > 0 ? (
                  playableChapters.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.order}장. {item.title}
                    </option>
                  ))
                ) : (
                  <option value="">플레이할 컷이 없어요</option>
                )}
              </select>
            </label>
            <button
              type="button"
              className="ghost-button light"
              onClick={onBack}
            >
              {isExample ? "예시 닫기" : "편집으로 돌아가기"}
            </button>
          </div>
        </header>
        <StoryStageCanvas stage={stage} variant="player" speaker={line?.speaker} />
        <section
          className={`dialogue-box ${
            line?.type === "narration" ? "narration" : ""
          }`}
          aria-live="polite"
        >
          <div className="dialogue-meta">
            <span>
              {chapter ? `${chapter.order}장. ${chapter.title}` : "플레이할 컷이 없어요"}
            </span>
            <span>
              {number} / {total}
            </span>
          </div>
          {line?.type === "narration" ? (
            <>
              <div className="narration-heading">
                <span>해설</span>
              </div>
              <p className="narration-copy">
                {line.text || "이 장에는 아직 글이 없어요."}
              </p>
            </>
          ) : (
            <p className="dialogue-copy" aria-live="polite">
              <DialogueInline
                speakerName={stage.speakerName}
                text={line?.text || "이 장에는 아직 글이 없어요."}
              />
            </p>
          )}
          <div className="player-controls">
            {!isExample && onEditCut && (
              <button type="button" className="ghost-button" disabled={!line}
                onClick={() => line && onEditCut({ projectId: project.id, lineId: line.id })}>
                이 컷 고치기
              </button>
            )}
            <button
              type="button"
              className="ghost-button"
              disabled={!canPrevious}
              onClick={() => canPrevious && onIndexChange(index - 1)}
            >
              이전
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!canNext}
              onClick={() =>
                canNext && onIndexChange(index + 1)
              }
            >
              다음 컷
            </button>
          </div>
        </section>
      </div>
      {atStoryEnd && !isExample && (
        <section className="player-revision-surface">
          <StoryRevisionCheck
            project={project}
            responses={revisionResponses}
            onResponse={onRevisionResponse}
            title="끝까지 읽고, 고칠 곳을 찾아보세요"
            description="아래 질문은 평가가 아니에요. 지금 확인하거나 나중에 다시 볼 수 있어요."
            onEdit={onBack}
          />
        </section>
      )}
      <footer className="copyright-bar">
        기본 제공 이미지 © 놀퀴즈 · 토끼와 자라·옹고집전 이미지 사용
      </footer>
    </main>
  );
}
