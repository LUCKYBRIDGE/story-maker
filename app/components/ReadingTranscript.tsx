"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { lineSpeakerNames } from "../story-speakers";
import type { StoryLine, StoryProject } from "../story-data";
import {
  clampReadingFontOffset,
  dialogueFontCandidates,
  readingHistoryFontSize,
  READING_FONT_OFFSET_MAX,
  READING_FONT_OFFSET_MIN,
  READING_FONT_OFFSET_STEP,
} from "../story-reading-font";
import { DialogueInline, DialogueText } from "./StoryPlayer";
import { createPortal } from "react-dom";
import { ModalDialog } from "./ModalDialog";
import { resolveStoryStage } from "../story-stage-view";

export type ReadingRecord = { lineId: string; choiceLabel?: string };

const DIALOGUE_SAFE_HEIGHT_RATIO = 0.84;

/** Current speech stays separate from the actual path and chosen options. */
export function ReadingTranscript({ project, lines, history, currentLine, endingChoice }: {
  project: StoryProject;
  lines: StoryLine[];
  history: ReadingRecord[];
  currentLine?: StoryLine;
  endingChoice?: string;
}) {
  const [fontOffset, setFontOffset] = useState(0);
  const [autoFontSize, setAutoFontSize] = useState(() => dialogueFontCandidates(0)[0]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentParagraphRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentLine?.id, fontOffset]);

  useLayoutEffect(() => {
    const transcript = transcriptRef.current;
    const scroll = scrollRef.current;
    const paragraph = currentParagraphRef.current;
    if (!transcript || !scroll || !paragraph || !currentLine) return;

    let active = true;
    let frame = 0;
    const fit = () => {
      if (!active) return;
      const scrollStyle = getComputedStyle(scroll);
      const paddingTop = Number.parseFloat(scrollStyle.paddingTop) || 0;
      const paddingBottom = Number.parseFloat(scrollStyle.paddingBottom) || 0;
      const usableHeight = scroll.clientHeight - paddingTop - paddingBottom;
      if (usableHeight <= 0) return;

      const targetHeight = usableHeight * DIALOGUE_SAFE_HEIGHT_RATIO;
      const candidates = dialogueFontCandidates(fontOffset);
      let chosen = candidates[candidates.length - 1];
      for (const size of candidates) {
        transcript.style.setProperty("--reading-font-size", `${size}px`);
        if (paragraph.getBoundingClientRect().height <= targetHeight + 0.5) {
          chosen = size;
          break;
        }
      }
      transcript.style.setProperty("--reading-font-size", `${chosen}px`);
      setAutoFontSize(previous => previous === chosen ? previous : chosen);
    };
    const scheduleFit = () => {
      if (!active) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    const resizeObserver = new ResizeObserver(scheduleFit);
    resizeObserver.observe(scroll);
    scheduleFit();
    void document.fonts?.ready.then(scheduleFit);

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [currentLine, fontOffset]);

  const currentStyle = { "--reading-font-size": `${autoFontSize}px` } as CSSProperties;
  const historyFontSize = readingHistoryFontSize(fontOffset);
  const historyStyle = { "--reading-font-size": `${historyFontSize}px` } as CSSProperties;
  const records = [...history, ...(currentLine ? [{lineId: currentLine.id, choiceLabel: endingChoice}] : [])];
  const paragraph = (entry: StoryLine, current = false) => {
    const chapter = project.chapters.find(chapter => chapter.id === entry.chapterId);
    return <p ref={current ? currentParagraphRef : undefined} className={`reading-paragraph ${entry.type} ${current ? "current-reading" : ""}`} aria-live={current ? "polite" : undefined}>
      {entry.type === "narration" ? <DialogueText text={entry.text || "이 장에는 아직 글이 없어요."} />
        : <DialogueInline names={lineSpeakerNames(entry)} speakerNames={lines.flatMap(lineSpeakerNames)} paper={!current} speakerName={resolveStoryStage(chapter, entry).speakerName} text={entry.text || "이 장에는 아직 글이 없어요."} />}
    </p>;
  };
  const fontControls = () => <div role="group" aria-label="글씨 크기">
    <button type="button" aria-label="글씨 작게" disabled={fontOffset <= READING_FONT_OFFSET_MIN}
      onClick={() => setFontOffset(offset => clampReadingFontOffset(offset - READING_FONT_OFFSET_STEP))}>가−</button>
    <output aria-live="polite" aria-label="기준 글씨 크기">{historyFontSize}</output>
    <button type="button" aria-label="글씨 크게" disabled={fontOffset >= READING_FONT_OFFSET_MAX}
      onClick={() => setFontOffset(offset => clampReadingFontOffset(offset + READING_FONT_OFFSET_STEP))}>가+</button>
  </div>;
  return <div className="reading-transcript" ref={transcriptRef} style={currentStyle} data-auto-font-size={autoFontSize} data-font-offset={fontOffset}>
    <div className="reading-tools">
      <button type="button" onClick={() => setHistoryOpen(true)}>지난 기록</button>
      {fontControls()}
    </div>
    <div className="reading-scroll" ref={scrollRef} role="region" aria-label="현재 대사" tabIndex={0}>
      {currentLine && paragraph(currentLine, true)}
    </div>
    {historyOpen && createPortal(<div style={historyStyle}><ModalDialog overlayClassName="reader-menu-backdrop reading-history-backdrop" dialogClassName="reader-menu-dialog reading-history-dialog"
      label="지난 기록" onClose={() => setHistoryOpen(false)}>
      <header><h2>지난 기록</h2><button type="button" onClick={() => setHistoryOpen(false)}>닫기</button></header>
      <div className="reading-tools">{fontControls()}</div>
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
