"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Chapter, StoryLine } from "../story-data";
import { STORY_EFFECTS, type StorySceneEffect } from "../story-scene-effect";
import { resolveStoryStage } from "../story-stage-view";
import { ModalDialog } from "./ModalDialog";
import { StorySceneFrame } from "./StoryStage";

export function SceneEffectEditor({ line, chapter, onChange }: {
  line: StoryLine;
  chapter: Chapter;
  onChange: (effect: StorySceneEffect | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="scene-effect-button" onClick={event => {
      event.stopPropagation(); setOpen(true);
    }} aria-haspopup="dialog">
      ✨ 연출 효과{line.effect ? ` · ${STORY_EFFECTS.find(e => e.type === line.effect?.type)?.label ?? "설정됨"}` : ""}
    </button>
    {open && createPortal(<div onClick={event => event.stopPropagation()}>
      <EffectSettings key={line.id} line={line} chapter={chapter} onClose={() => setOpen(false)} onChange={onChange} />
    </div>, document.body)}
  </>;
}

function EffectSettings({ line, chapter, onClose, onChange }: {
  line: StoryLine; chapter: Chapter; onClose: () => void;
  onChange: (effect: StorySceneEffect | undefined) => void;
}) {
  const [effect, setEffect] = useState(line.effect);
  const [preview, setPreview] = useState<{ effect: StorySceneEffect; key: number }>();
  const [delayText, setDelayText] = useState(String((line.effect?.delayMs ?? 1500) / 1000));
  const validDelay = delayText.trim() !== "" && Number.isFinite(Number(delayText)) && Number(delayText) >= 0 && Number(delayText) <= 10;
  const valid = !effect || effect.trigger !== "after-delay" || validDelay;
  function patch(change: Partial<StorySceneEffect>) {
    setPreview(undefined);
    setEffect(current => current ? { ...current, ...change } : current);
  }
  return <ModalDialog overlayClassName="scene-effect-backdrop" dialogClassName="scene-effect-dialog"
    label={`${line.order}컷 연출 효과`} onClose={onClose}>
    <header><div><h2>✨ 연출 효과</h2><p>{line.order}컷에 어떤 순간을 만들까요?</p></div>
      <button type="button" onClick={onClose} aria-label="연출 설정 닫기">닫기</button></header>
    <div className="scene-effect-choices" role="group" aria-label="효과 종류">
      <button type="button" aria-pressed={!effect} onClick={() => { setEffect(undefined); setPreview(undefined); }}>○ 없음<small>글과 그림 그대로</small></button>
      {STORY_EFFECTS.map(item => <button type="button" key={item.type} aria-pressed={effect?.type === item.type}
        onClick={() => { setEffect({ type: item.type, intensity: effect?.intensity ?? "soft", trigger: effect?.trigger ?? "scene-enter", delayMs: effect?.delayMs ?? 1500 }); setPreview(undefined); }}>
        {item.label}<small>{item.hint}</small>
      </button>)}
    </div>
    {effect && <div className="scene-effect-fields">
      <label>강도<select value={effect.intensity} onChange={e => patch({ intensity: e.target.value as StorySceneEffect["intensity"] })}>
        <option value="soft">약하게</option><option value="strong">강하게</option></select></label>
      <label>언제 시작할까요?<select value={effect.trigger} onChange={e => patch({ trigger: e.target.value as StorySceneEffect["trigger"] })}>
        <option value="scene-enter">컷 시작과 동시에</option><option value="with-dialogue">대사·해설과 동시에</option><option value="after-delay">잠시 기다린 뒤</option></select></label>
      {effect.trigger === "after-delay" && <label>기다리는 시간 (초)<input type="number" min="0" max="10" step="0.1" value={delayText}
        aria-invalid={!validDelay} aria-describedby="scene-effect-delay-help" onChange={e => { setDelayText(e.target.value); patch({ delayMs: Number(e.target.value) * 1000 }); }} />
        <small id="scene-effect-delay-help">{validDelay ? "0~10초 사이로 정해요." : "0~10 사이의 숫자를 입력해 주세요."}</small></label>}
    </div>}
    <div className="scene-effect-preview" aria-label="연출 미리보기">
      <StorySceneFrame stage={resolveStoryStage(chapter, line)} variant="editor" speaker={line.speaker}
        effect={preview?.effect} playbackKey={preview?.key}>
        <div className="dialogue-box"><p>{line.text || "여기에 내 이야기가 펼쳐져요."}</p></div>
      </StorySceneFrame>
    </div>
    <p className="scene-effect-help">미리보기를 누르면 설정한 시간에 한 번 실행돼요. 기기의 ‘동작 줄이기’가 켜져 있으면 연출을 쉬어요.</p>
    {effect?.trigger === "with-dialogue" && <p className="scene-effect-help">지금은 컷이 시작될 때 대사도 함께 나타나요.</p>}
    <footer><button type="button" disabled={!effect || !valid} onClick={() => effect && setPreview({ effect: { ...effect }, key: (preview?.key ?? 0) + 1 })}>▶ 미리보기</button>
      <button type="button" onClick={onClose}>취소</button>
      <button type="button" className="primary-button" disabled={!valid} onClick={() => { onChange(effect); onClose(); }}>이 컷에 적용</button></footer>
  </ModalDialog>;
}
