"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookCover } from "./BookCover";
import { TheaterCurtain } from "./TheaterCurtain";
import { StoryPlayer, type StoryPlayerProps } from "./StoryPlayer";
import { StorySceneFrame } from "./StoryStage";
import { resolveStoryStage } from "../story-stage-view";
import { selectStoryPlayerPosition } from "../story-studio-selectors";

export function StoryBookPlayback(props: StoryPlayerProps) {
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
  const { chapter, line } = selectStoryPlayerPosition(props.project, phase === "closing" ? props.startIndex : 0);
  if (phase === "play") return <StoryPlayer {...props} onFinish={() => setPhase("closing")} />;
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
      <button ref={openerRef} type="button" className="primary-button" onClick={() => {
        props.onIndexChange(0); setPhase(phase === "back" ? "cover" : "opening");
      }}>{phase === "back" ? "앞표지로" : "이야기 펼치기"}</button></div>
    <small className="book-entry-copyright">© 놀퀴즈</small>
  </main>;
}
