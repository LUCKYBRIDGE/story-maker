"use client";

import { speakerColor } from "../story-speaker-colors";
import { ModalDialog } from "./ModalDialog";
import { ReadingTranscript, type ReadingRecord } from "./ReadingTranscript";
import { resolveAssetUrl } from "../story-asset-url";
import { StorySceneFrame } from "./StoryStage";

import { useEffectEvent, useEffect, useRef, useState } from "react";
import { storyFlowTargets } from "../story-flow";
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
  paper,
  speakerNames,
  names,
}: {
  speakerName: string;
  text: string;
  paper?: boolean;
  speakerNames?: string[];
  names?: string[];
}) {
  return (
    <>
      {(names?.length ? names : [speakerName || "화자 없음"]).map((name,index) => <span key={name}>
        {index > 0 && " · "}<strong className="dialogue-speaker" style={paper === undefined ? undefined : {color:speakerColor(name, paper, speakerNames)}}>{name}</strong>
      </span>)}:{" "}
      <DialogueText text={text} />
    </>
  );
}

export interface StoryPlayerProps {
  returnLabel?: string;
  project: StoryProject;
  startIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  onHome?: () => void;
  onFinish?: () => void;
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
  returnLabel,
  onHome,
  onEditCut,
  onFinish,
  isExample = false,
  revisionResponses,
  onRevisionResponse,
}: StoryPlayerProps) {
  const [menu, setMenu] = useState<"return" | "chapters" | null>(null);
  const playerRef = useRef<HTMLElement>(null);
  const { lines, index, line, chapter, playableChapters, number, total } =
    selectStoryPlayerPosition(project, startIndex);
  const [history, setHistory] = useState<ReadingRecord[]>([]);
  const [endingChoice, setEndingChoice] = useState<string>();
  const [choiceEnded, setChoiceEnded] = useState(false);
  const pendingMove = useRef(false);
  const branching = project.lines.some(line => line.flow);
  const targets = storyFlowTargets(lines, index);
  const nextTarget = line?.flow?.type === "choice" ? undefined : targets[0];
  const nextIndex = typeof nextTarget === "string" ? lines.findIndex(line => line.id === nextTarget) : -1;
  const canNext = !choiceEnded && nextIndex >= 0 && nextIndex !== index;
  const canPrevious = choiceEnded || history.length > 0 || (!branching && index > 0);
  const atStoryEnd = total > 0 && (choiceEnded || nextTarget === null);
  const brokenLink = line?.flow?.type !== "choice" && nextTarget !== null && !canNext && total > 0;
  useEffect(() => { pendingMove.current = false; }, [index]);
  function goTo(targetId: string | null, choiceLabel?: string) {
    if (pendingMove.current || !line) return;
    if (targetId === null) { setEndingChoice(choiceLabel); setChoiceEnded(true); return; }
    const target = lines.findIndex(line => line.id === targetId);
    if (target < 0 || target === index) return;
    pendingMove.current = true;
    setHistory(previous => [...previous, { lineId: line.id, choiceLabel }]);
    onIndexChange(target);
    playerRef.current?.focus({ preventScroll: true });
  }
  function goPrevious() {
    if (pendingMove.current) return;
    if (choiceEnded) { setChoiceEnded(false); setEndingChoice(undefined); return; }
    const previousId = history.at(-1)?.lineId;
    const target = previousId ? lines.findIndex(line => line.id === previousId) : !branching ? index - 1 : -1;
    if (target < 0) return;
    pendingMove.current = true;
    setHistory(previous => previous.slice(0, -1));
    onIndexChange(target);
    playerRef.current?.focus({ preventScroll: true });
  }
  useEffect(() => {
    playerRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const stage = resolveStoryStage(chapter, line);

  // Warm every immediate choice destination as well as the linear next cut.
  useEffect(() => {
    const upcoming = line?.flow?.type === "choice"
      ? line.flow.options.map(option => lines.find(candidate => candidate.id === option.targetLineId))
      : [lines[nextIndex]];
    const sources = new Set<string>();
    for (const nextLine of upcoming) {
      if (!nextLine) continue;
      const nextChapter = project.chapters.find(candidate => candidate.id === nextLine.chapterId);
      for (const assetId of [nextLine.backgroundId || nextChapter?.backgroundId,
        nextLine.leftAssetId || nextChapter?.leftAssetId, nextLine.rightAssetId || nextChapter?.rightAssetId]) {
        const src = assetId && ASSET_BY_ID.get(assetId)?.src;
        if (src) sources.add(src);
      }
    }
    for (const src of sources) {
      const image = new Image();
      image.src = resolveAssetUrl(src);
    }
  }, [line, lines, nextIndex, project.chapters]);

  // 키보드 조작은 선택지를 건너뛰지 않으며 최신 재생 경로를 사용한다.
  const onPlayerKey = useEffectEvent((event: KeyboardEvent) => {
      if (menu || (event.target instanceof Element && event.target.closest('[role="dialog"]')) || !shouldHandleStoryPlayerKey(event) ||
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
          goTo(nextTarget!);
        }
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (canPrevious) {
          goPrevious();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setMenu("return");
      }
  });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => onPlayerKey(event);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const playChapter = (chapterId: string) => {
    const index = findFirstStoryLineIndexForChapter({ lines, chapterId });
    if (index >= 0) { setHistory([]); setChoiceEnded(false); setEndingChoice(undefined); pendingMove.current = false; onIndexChange(index); }
  };


  return (
    <main className="player-shell" ref={playerRef} tabIndex={-1} aria-label={isExample ? "예시 스토리 플레이" : "스토리 플레이"}>
      <div
        className="story-stage"
      >
        <StorySceneFrame stage={stage} variant="player" effect={line?.effect} playbackKey={line?.id} speaker={line?.speaker} heading={
        <header className="reader-topbar">
          <details className="reader-story-info">
            <summary>이야기 정보</summary>
            <strong>{project.title}</strong>
            <span>{chapter ? `${chapter.order}장. ${chapter.title}` : "플레이할 컷이 없어요"}</span>
            <small>{number} / {total}</small>
          </details>
          <div className="reader-top-actions">
            <button type="button" onClick={() => setMenu("chapters")}>이동</button>
            <button type="button" onClick={() => setMenu("return")}>돌아가기</button>
          </div>
        </header>}>
        <section
          data-has-choices={line?.flow?.type === "choice" && !choiceEnded || undefined}
          className={`dialogue-box ${
            line?.type === "narration" ? "narration" : ""
          }`}
        >
          <ReadingTranscript project={project} lines={lines} history={history} currentLine={line} endingChoice={endingChoice} />
          {line?.flow?.type === "choice" && !choiceEnded && <section className="player-choices" aria-label="이야기 선택지">
            <strong>어떻게 할까요?</strong>
            {line.flow.options.map((option, optionIndex) => <button type="button" key={option.id}
              disabled={option.targetLineId !== null && (!option.targetLineId || !lines.some(line => line.id === option.targetLineId))}
              onClick={() => goTo(option.targetLineId, option.label || `선택 ${optionIndex + 1}`)}><b aria-hidden="true">{optionIndex + 1}</b><span>{option.label || `선택 ${optionIndex + 1}`}</span></button>)}
            <small>선택지를 골라야 이야기가 이어져요.</small>
          </section>}
          {brokenLink && <p role="alert">연결할 컷을 찾지 못했어요. 편집으로 돌아가 도착 컷을 확인해 주세요.</p>}
          <div className="player-controls">
            {atStoryEnd && onFinish && <button type="button" onClick={onFinish}>공연 마치기</button>}
            <button
              type="button"
              className="ghost-button"
              disabled={!canPrevious}
              onClick={() => canPrevious && goPrevious()}
            >
              이전
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!canNext}
              onClick={() =>
                canNext && goTo(nextTarget!)
              }
            >
              다음 컷
            </button>
          </div>
        </section>
        </StorySceneFrame>
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
      {menu && <ModalDialog overlayClassName="reader-menu-backdrop" dialogClassName="reader-menu-dialog"
        label={menu === "return" ? "돌아갈 화면" : "장 처음으로 이동"} onClose={() => setMenu(null)}>
        <header><h2>{menu === "return" ? "어디로 돌아갈까요?" : "어느 장부터 읽을까요?"}</h2>
          <button type="button" onClick={() => setMenu(null)}>닫기</button></header>
        {menu === "return" ? <div className="reader-menu-options">
          {!returnLabel && <button type="button" onClick={onHome ?? onBack}>{isExample ? "메인화면" : "창작 관리"}</button>}
          {(returnLabel || !isExample) && <button type="button" onClick={onBack}>{returnLabel ?? "편집화면"}</button>}
          {!isExample && onEditCut && line && <button type="button" onClick={() => onEditCut({projectId: project.id, lineId: line.id})}>이 컷 고치기</button>}
        </div> : <div className="reader-menu-options">
          <p>고른 장의 처음부터 읽어요. 지난 기록도 그 장부터 새로 시작해요.</p>
          {playableChapters.map(item => <button type="button" key={item.id} aria-current={item.id === chapter?.id ? "location" : undefined}
            onClick={() => { playChapter(item.id); setMenu(null); }}>{item.order}장. {item.title}{item.id === chapter?.id ? " · 현재 장 처음으로" : ""}</button>)}
        </div>}
      </ModalDialog>}
      <footer className="copyright-bar">
        기본 제공 이미지 © 놀퀴즈 · 토끼와 자라·옹고집전 이미지 사용
      </footer>
    </main>
  );
}
