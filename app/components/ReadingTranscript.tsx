"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { StoryLine, StoryProject } from "../story-data";
import { DialogueInline, DialogueText } from "./StoryPlayer";
import { createPortal } from "react-dom";
import { ModalDialog } from "./ModalDialog";
import { resolveStoryStage } from "../story-stage-view";

export type ReadingRecord = { lineId: string; choiceLabel?: string };

/** Current speech stays separate from the actual path and chosen options. */
export function ReadingTranscript({ project, lines, history, currentLine, endingChoice }: {
  project: StoryProject;
  lines: StoryLine[];
  history: ReadingRecord[];
  currentLine?: StoryLine;
  endingChoice?: string;
}) {
  const [fontSize, setFontSize] = useState(20);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentLine?.id, fontSize]);
  const style = { "--reading-font-size": `${fontSize}px` } as CSSProperties;
  const records = [...history, ...(currentLine ? [{lineId: currentLine.id, choiceLabel: endingChoice}] : [])];
  const paragraph = (entry: StoryLine, current = false) => {
    const chapter = project.chapters.find(chapter => chapter.id === entry.chapterId);
    return <p className={`reading-paragraph ${entry.type} ${current ? "current-reading" : ""}`} aria-live={current ? "polite" : undefined}>
      {entry.type === "narration" ? <DialogueText text={entry.text || "이 장에는 아직 글이 없어요."} />
        : <DialogueInline speakerName={resolveStoryStage(chapter, entry).speakerName} text={entry.text || "이 장에는 아직 글이 없어요."} />}
    </p>;
  };
  const fontControls = <div role="group" aria-label="글씨 크기">
    <button type="button" aria-label="글씨 작게" disabled={fontSize <= 16} onClick={() => setFontSize(size => Math.max(16, size - 2))}>가−</button>
    <output aria-live="polite">{fontSize}</output>
    <button type="button" aria-label="글씨 크게" disabled={fontSize >= 32} onClick={() => setFontSize(size => Math.min(32, size + 2))}>가+</button>
  </div>;
  return <div className="reading-transcript" style={style}>
    <div className="reading-tools">
      <button type="button" onClick={() => setHistoryOpen(true)}>지난 기록</button>
      {fontControls}
    </div>
    <div className="reading-scroll" ref={scrollRef} role="region" aria-label="현재 대사" tabIndex={0}>
      {currentLine && paragraph(currentLine, true)}
    </div>
    {historyOpen && createPortal(<div style={style}><ModalDialog overlayClassName="reader-menu-backdrop reading-history-backdrop" dialogClassName="reader-menu-dialog reading-history-dialog"
      label="지난 기록" onClose={() => setHistoryOpen(false)}>
      <header><h2>지난 기록</h2><button type="button" onClick={() => setHistoryOpen(false)}>닫기</button></header>
      <div className="reading-tools">{fontControls}</div>
      <div className="reading-history-script" role="region" aria-label="지금까지 읽은 대본" tabIndex={0}>
        {records.map((record, index) => {
          const entry = lines.find(line => line.id === record.lineId);
          if (!entry) return null;
          return <div key={`${record.lineId}:${index}`}>
            {paragraph(entry)}
            {record.choiceLabel && <p className="reading-choice-record">내 선택: {record.choiceLabel}</p>}
          </div>;
        })}
      </div>
    </ModalDialog></div>, document.body)}
  </div>;
}
