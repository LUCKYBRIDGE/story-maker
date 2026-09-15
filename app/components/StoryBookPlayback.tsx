"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookCover } from "./BookCover";
import { TheaterCurtain } from "./TheaterCurtain";
import { StoryPlayer, type StoryPlayerProps } from "./StoryPlayer";
import { StorySceneFrame } from "./StoryStage";
import { resolveStoryStage } from "../story-stage-view";
import { selectStoryPlayerPosition } from "../story-studio-selectors";
import {
  loadProjectReadingProgress,
  getLatestReadingSaveSlot,
  deleteReadingProgressSlot,
  findSafeTargetIndex,
  type ProjectReadingProgress,
  type ReadingSaveSlot,
  type ReadingSaveSlotId,
} from "../story-reading-progress";
import { StoryBookmarkDialog } from "./StoryBookmarkDialog";

export function StoryBookPlayback(props: StoryPlayerProps) {
  const [readingProgress, setReadingProgress] = useState<ProjectReadingProgress | null>(() =>
    loadProjectReadingProgress(props.project.id),
  );
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [resumedSlot, setResumedSlot] = useState<ReadingSaveSlot | null>(null);

  const latestSlot = getLatestReadingSaveSlot(readingProgress);
  const hasResumableProgress = Boolean(
    latestSlot &&
      (latestSlot.cutNumber > 1 ||
        latestSlot.index > 0 ||
        (latestSlot.history && latestSlot.history.length > 0)),
  );

  const [phase, setPhase] = useState<"cover" | "opening" | "play" | "closing" | "back">(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("storygame:book-phase:v1") ?? "null");
      if (saved?.projectId === props.project.id && ["cover", "play", "back"].includes(saved.phase)) return saved.phase;
    } catch { /* A missing tab session opens the normal cover. */ }
    return props.startIndex === 0 && props.project.lines.length > 0 ? "cover" : "play";
  });
  useLayoutEffect(() => {
    try { sessionStorage.setItem("storygame:book-phase:v1", JSON.stringify({projectId: props.project.id, phase: phase === "opening" ? "play" : phase === "closing" ? "back" : phase})); } catch { /* optional session */ }
  }, [phase, props.project.id]);
  useEffect(() => () => { try { sessionStorage.removeItem("storygame:book-phase:v1"); sessionStorage.removeItem("storygame:reading-path:v1"); } catch { /* optional session */ } }, []);
  const openerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (phase === "cover" || phase === "back") openerRef.current?.focus(); }, [phase]);

  const handleOpenStory = () => {
    if (phase === "back") {
      props.onIndexChange(0);
      setResumedSlot(null);
      setPhase("cover");
      return;
    }
    // 이전에 읽던 기록이 있으면 이어읽기 팝업 띄우기
    if (hasResumableProgress && latestSlot) {
      setResumePromptOpen(true);
      return;
    }
    props.onIndexChange(0);
    setResumedSlot(null);
    setPhase("opening");
  };

  const handleResume = (slot: ReadingSaveSlot) => {
    const targetIndex = findSafeTargetIndex(props.project.lines, slot);
    setResumedSlot(slot);
    props.onIndexChange(targetIndex);
    setResumePromptOpen(false);
    setPhase("opening");
  };

  const handleStartFresh = () => {
    setResumedSlot(null);
    props.onIndexChange(0);
    setResumePromptOpen(false);
    setPhase("opening");
  };

  const handleDeleteSlot = (slotId: ReadingSaveSlotId) => {
    deleteReadingProgressSlot(props.project.id, slotId);
    setReadingProgress(loadProjectReadingProgress(props.project.id));
  };

  const activeIndex = phase === "closing" ? props.startIndex : (resumedSlot?.index ?? props.startIndex);
  const { chapter, line } = selectStoryPlayerPosition(props.project, activeIndex);

  if (phase === "play") {
    return (
      <StoryPlayer
        {...props}
        initialHistory={resumedSlot?.history}
        initialEndingChoice={resumedSlot?.endingChoice}
        initialChoiceEnded={resumedSlot?.choiceEnded}
        onFinish={() => setPhase("closing")}
      />
    );
  }

  if (phase === "opening" || phase === "closing") return <div className="book-opening-stage">
    <div aria-hidden="true"><StorySceneFrame stage={resolveStoryStage(chapter,line)} variant="player" speaker={line?.speaker}>
      <div className="dialogue-box"><p>{line?.text}</p></div>
    </StorySceneFrame></div>
    <TheaterCurtain closing={phase === "closing"} onComplete={() => setPhase(phase === "closing" ? "back" : "play")} />
  </div>;

  return <main className="book-play-entry" aria-label={phase === "back" ? "이야기 뒤표지" : "이야기 앞표지"}>
    <span className="book-entry-label">{phase === "back" ? "나의 이야기, 한 권을 마치며" : "책을 펼치면 무대가 시작돼요"}</span>
    <BookCover project={props.project} back={phase === "back"} />
    <div className="book-entry-actions"><button type="button" onClick={props.onBack}>{props.returnLabel ?? (props.isExample ? "예시 닫기" : "편집으로 돌아가기")}</button>
      <button ref={openerRef} type="button" className="primary-button" onClick={handleOpenStory}>
        {phase === "back" ? "앞표지로" : "이야기 펼치기"}
      </button></div>
    <small className="book-entry-copyright">© 놀퀴즈</small>

    {resumePromptOpen && (
      <StoryBookmarkDialog
        mode="resume-prompt"
        projectTitle={props.project.title}
        currentCutNumber={0}
        totalCuts={props.project.lines.length}
        progress={readingProgress}
        latestSlot={latestSlot}
        onClose={() => setResumePromptOpen(false)}
        onResume={handleResume}
        onStartFresh={handleStartFresh}
        onDeleteSlot={handleDeleteSlot}
      />
    )}
  </main>;
}
