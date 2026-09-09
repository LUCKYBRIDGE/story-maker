"use client";
import { useEffect, useRef, useState } from "react";
import { useFloatingMemo } from "./useFloatingMemo";
import type { StoryProject } from "../story-data";
import { createCreativeMemoField, type CreativeMemo } from "../creative-memos";
import { setCreativeMemoChapterLink } from "../creative-memo-commands";

export function StickyMemoCard({ memo, chapters, onChange, onDelete }: {
  memo: CreativeMemo; chapters: StoryProject["chapters"];
  onChange: (memo: CreativeMemo) => void; onDelete: () => void;
}) {
  const chapter = chapters.find(chapter => chapter.id === memo.linkedChapterId);
  return <article className="sticky-memo-card">
    <div className="sticky-memo-paper">
      {memo.fields.map(field => <label key={field.id}>
        {memo.fields.length > 1 && <span>{field.label || "메모"}</span>}
        <textarea aria-label={memo.fields.length === 1 ? "메모 내용" : `메모 내용 · ${field.label}`}
          rows={6} value={field.value} placeholder="잊지 않고 참고할 생각을 적어 두세요."
          onChange={event => onChange({...memo, fields: memo.fields.map(item => item.id === field.id ? {...item, value: event.target.value} : item)})} />
      </label>)}
      {!memo.fields.length && <button type="button" onClick={() => onChange({...memo, fields: [createCreativeMemoField("내용", "default", 1)]})}>내용 쓰기</button>}
    </div>
    <details className="sticky-memo-info">
      <summary>{memo.linkedChapterId ? chapter ? `${chapter.order}장 메모` : "연결한 장 확인" : "작품 전체 메모"} · 추가 정보</summary>
      <label>제목 (선택)<input value={memo.title} onChange={event => onChange({...memo, title: event.target.value})} /></label>
      <label>메모 범위<select aria-label="메모 범위" value={memo.linkedChapterId ?? ""} onChange={event => onChange(setCreativeMemoChapterLink(memo, event.target.value))}>
        <option value="">작품 전체</option>
        {memo.linkedChapterId && !chapter && <option value={memo.linkedChapterId}>삭제된 장 · 다시 골라 주세요</option>}
        {chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.order}장 · {chapter.title || "제목 없음"}</option>)}
      </select></label>
      {memo.linkedLineId && <small>이전에 연결한 컷 정보는 보관 중이에요. 범위를 바꾸면 장 메모로 전환돼요.</small>}
      <button type="button" className="danger-text-button" onClick={onDelete}>메모 삭제</button>
    </details>
  </article>;
}

export function StickyMemoBoard({ project, onAdd, onChange, onDelete, onClose, onReference }: {
  project: StoryProject; onAdd: () => void; onChange: (memo: CreativeMemo) => void;
  onDelete: (id: string) => void; onClose: () => void; onReference: () => void;
}) {
  const boardRef = useRef<HTMLElement>(null);
  useEffect(() => { boardRef.current?.querySelector<HTMLSelectElement>("select")?.focus(); }, []);
  const [scope, setScope] = useState("all");
  const floating = useFloatingMemo(boardRef);
  const memos = project.creativeMemos.filter(memo => scope === "all" || (scope === "story" ? !memo.linkedChapterId : memo.linkedChapterId === scope));
  return <aside ref={boardRef} className="sticky-memo-board" style={floating.style} aria-label="창작 메모" role="region">
    <header><strong>창작 메모</strong><div><button type="button" className="memo-move-handle" aria-label="메모 이동 (드래그 또는 방향키)" {...floating.move}>이동</button><button type="button" aria-label="창작 메모 닫기" onClick={onClose}>닫기</button></div></header>
    <div className="sticky-memo-tools"><select aria-label="보여줄 메모" value={scope} onChange={event => setScope(event.target.value)}>
      <option value="all">모든 메모</option><option value="story">작품 전체 메모</option>
      {project.chapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.order}장 · {chapter.title || "제목 없음"}</option>)}
    </select><button type="button" onClick={() => { setScope("all"); onAdd(); }}>+ 메모</button></div>
    <div className="sticky-memo-scroll">
      {!memos.length && <p>참고할 생각을 적고, 글쓰는 동안 펼쳐 두세요.</p>}
      {memos.slice().sort((a,b) => b.order-a.order).map(memo => <StickyMemoCard key={memo.id} memo={memo} chapters={project.chapters} onChange={onChange} onDelete={() => onDelete(memo.id)} />)}
    </div>
    <footer><button type="button" onClick={floating.reset}>위치 초기화</button><button type="button" className="memo-resize-handle" aria-label="메모 크기 조절 (드래그 또는 방향키)" {...floating.resize}>크기 ↘</button><button type="button" onClick={onReference}>구성표 참고</button></footer>
  </aside>;
}
