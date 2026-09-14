"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { lineSpeakerNames } from "../story-speakers";
import type { StoryLine, StoryProject } from "../story-data";
import { DialogueInline, DialogueText } from "./StoryPlayer";
import { createPortal } from "react-dom";
import { ModalDialog } from "./ModalDialog";
import { resolveStoryStage } from "../story-stage-view";

import { useStoryDisplaySettings } from "../hooks/useStoryDisplaySettings";

export type ReadingRecord = { lineId: string; choiceLabel?: string };

/** Current speech stays separate from the actual path and chosen options. */
export function ReadingTranscript({ project, lines, history, currentLine, endingChoice }: {
  project: StoryProject;
  lines: StoryLine[];
  history: ReadingRecord[];
  currentLine?: StoryLine;
  endingChoice?: string;
}) {
  const settings = useStoryDisplaySettings();
  const [fontSize, setFontSize] = useState(20);
  const [autoFontSize, setAutoFontSize] = useState(20);
  const [historyOpen, setHistoryOpen] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const transcript = transcriptRef.current;
    if (!scroll || !transcript || !currentLine) return;

    scroll.scrollTop = 0;

    const fit = () => {
      const box = transcript.closest<HTMLElement>(".dialogue-box");
      const p = scroll.querySelector<HTMLElement>(".reading-paragraph");
      if (!box || !p) return;

      const candidates: number[] = [];
      for (let size = fontSize; size >= 10; size -= 2) {
        candidates.push(size);
      }

      const targetWidth = p.clientWidth || scroll.clientWidth || (box.clientWidth - 32) || 268;

      // Temporarily remove data-expanded to measure base dock available height
      box.removeAttribute("data-expanded");
      const sStyle = getComputedStyle(scroll);
      const scrollPadding = (parseFloat(sStyle.paddingTop) || 0) + (parseFloat(sStyle.paddingBottom) || 0);
      const availableBase = Math.max(0, scroll.clientHeight - scrollPadding);

      const measureHeight = (size: number) => {
        const probe = p.cloneNode(true) as HTMLElement;
        probe.style.cssText = `position: absolute; left: 0; top: 0; visibility: hidden; pointer-events: none; z-index: -1; width: ${targetWidth}px; margin: 0; padding: 0; line-height: 1.65; font-size: ${size}px !important;`;
        scroll.appendChild(probe);
        const h = probe.offsetHeight;
        probe.remove();
        return h;
      };

      let chosen = fontSize;
      let fitsInDock = false;

      // If cut has interactive choices, dialogue box expands upward to display choices comfortably
      const hasChoices = box.hasAttribute("data-has-choices") || !!box.querySelector(".player-choices");

      if (!hasChoices) {
        for (const size of candidates) {
          const h = measureHeight(size);
          if (h <= availableBase + 1) {
            chosen = size;
            fitsInDock = true;
            break;
          }
        }
      }

      if (!fitsInDock) {
        // Text overflows standard dock (or has choices): expand dialogue box upward
        box.setAttribute("data-expanded", "true");
        const headingH = document.querySelector<HTMLElement>(".reader-top-actions")?.offsetHeight || 64;
        const toolsH = transcript.querySelector<HTMLElement>(".reading-tools")?.offsetHeight || 44;
        const controlsH = box.querySelector<HTMLElement>(".player-controls")?.offsetHeight || 69;
        const choicesH = box.querySelector<HTMLElement>(".player-choices")?.offsetHeight || 0;
        const maxScrollHeight = Math.max(120, window.innerHeight - headingH - toolsH - controlsH - choicesH - 64);

        for (const size of candidates) {
          const h = measureHeight(size);
          if (h <= maxScrollHeight) {
            chosen = size;
            break;
          }
          chosen = size;
        }
      }

      transcript.style.setProperty("--reading-font-size", `${chosen}px`);
      setAutoFontSize(previous => previous === chosen ? previous : chosen);
    };

    let frameId: number | null = null;
    const scheduleFit = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        fit();
      });
    };

    fit();

    const observer = new ResizeObserver(scheduleFit);
    observer.observe(scroll);
    window.addEventListener("resize", scheduleFit);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", scheduleFit);
    };
  }, [currentLine, fontSize, settings.dialoguePercent]);

  const style = { "--reading-font-size": `${autoFontSize}px` } as CSSProperties;
  const historyStyle = { "--reading-font-size": `${fontSize}px` } as CSSProperties;
  const records = [...history, ...(currentLine ? [{lineId: currentLine.id, choiceLabel: endingChoice}] : [])];
  const paragraph = (entry: StoryLine, current = false) => {
    const chapter = project.chapters.find(chapter => chapter.id === entry.chapterId);
    return <p className={`reading-paragraph ${entry.type} ${current ? "current-reading" : ""}`} aria-live={current ? "polite" : undefined}>
      {entry.type === "narration" ? <DialogueText text={entry.text || "이 장에는 아직 글이 없어요."} />
        : <DialogueInline names={lineSpeakerNames(entry)} speakerNames={lines.flatMap(lineSpeakerNames)} paper={!current} speakerName={resolveStoryStage(chapter, entry).speakerName} text={entry.text || "이 장에는 아직 글이 없어요."} />}
    </p>;
  };
  const fontControls = <div role="group" aria-label="글씨 크기">
    <button type="button" aria-label="글씨 작게" disabled={fontSize <= 16} onClick={() => setFontSize(size => Math.max(16, size - 2))}>가−</button>
    <output aria-live="polite">{fontSize}</output>
    <button type="button" aria-label="글씨 크게" disabled={fontSize >= 32} onClick={() => setFontSize(size => Math.min(32, size + 2))}>가+</button>
  </div>;
  return <div className="reading-transcript" ref={transcriptRef} style={style} data-auto-font-size={autoFontSize}>
    <div className="reading-tools">
      <button type="button" onClick={() => setHistoryOpen(true)}>지난 기록</button>
      {fontControls}
    </div>
    <div className="reading-scroll" ref={scrollRef} role="region" aria-label="현재 대사" tabIndex={0}>
      {currentLine && paragraph(currentLine, true)}
    </div>
    {historyOpen && createPortal(<div style={historyStyle}><ModalDialog overlayClassName="reader-menu-backdrop reading-history-backdrop" dialogClassName="reader-menu-dialog reading-history-dialog"
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
