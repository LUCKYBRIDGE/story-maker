"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { StoryProject } from "../story-data";
import { COVER_THEMES, coverPreset, resolveStoryCover, type StoryCover } from "../story-cover";
import { STORY_ASSETS } from "../story-assets";
import { ModalDialog } from "./ModalDialog";
import { BookCover } from "./BookCover";

export function BookCoverEditor({ project, onApply }: {
  project: StoryProject; onApply: (title: string, cover: StoryCover) => void;
}) {
  const [open, setOpen] = useState(false);
  return <><button type="button" className="book-design-button" onClick={() => setOpen(true)} aria-haspopup="dialog">📖 내 책 표지 꾸미기</button>
    {open && createPortal(<CoverEditorForm project={project} onClose={() => setOpen(false)} onApply={onApply} />, document.body)}</>;
}
function CoverEditorForm({ project, onClose, onApply }: {
  project: StoryProject; onClose: () => void; onApply: (title: string, cover: StoryCover) => void;
}) {
  const [cover, setCover] = useState(() => resolveStoryCover(project));
  const [title, setTitle] = useState(project.title);
  const [back, setBack] = useState(false);
  const preview = { ...project, title, cover };
  const patch = (changes: Partial<StoryCover>) => setCover(current => ({ ...current, ...changes }));
  return <ModalDialog overlayClassName="book-editor-backdrop" dialogClassName="book-editor-dialog" label="내 책 표지 꾸미기" onClose={onClose}>
    <header className="book-editor-heading"><div><span>한 권의 이야기, 나의 무대</span><h2>내 책 표지 꾸미기</h2></div><button type="button" onClick={onClose}>닫기</button></header>
    <div className="book-editor-body">
      <div className="book-editor-preview"><BookCover project={preview} back={back} />
        <button type="button" aria-pressed={back} onClick={() => setBack(value => !value)}>{back ? "앞표지 보기" : "뒤표지 보기"}</button>
        <small>긴 제목은 표지에 맞춰 글자 크기가 줄어들어요.</small>
      </div>
      <div className="book-editor-fields">
        <label>작품 제목<input value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label>지은이<input placeholder="나만의 필명" value={cover.author} onChange={e => patch({ author: e.target.value })} /></label>
        <label>표지 소개 문장<input placeholder="어떤 일이 기다리고 있을까요?" value={cover.subtitle} onChange={e => patch({ subtitle: e.target.value })} /></label>
        <fieldset><legend>표지 기본 배치</legend><div className="cover-preset-options">
          {([["classic", "정통 동화책"], ["picture", "그림 중심"], ["bold", "큰 제목"]] as const).map(([value,label]) =>
            <button key={value} type="button" aria-pressed={cover.layout === value} onClick={() => patch(coverPreset(value))}>{label}</button>)}
        </div></fieldset>
        <div className="cover-form-pair"><label>표지 색감<select aria-label="표지 색감" value={cover.theme} onChange={e => patch({theme:e.target.value as StoryCover["theme"]})}>
          {Object.entries(COVER_THEMES).map(([value,theme]) => <option value={value} key={value}>{theme.label}</option>)}
        </select></label><label>제목 글꼴<select aria-label="제목 글꼴" value={cover.font} onChange={e => patch({font:e.target.value as StoryCover["font"]})}><option value="serif">책 느낌 명조</option><option value="sans">또렷한 고딕</option></select></label></div>
        <div className="cover-form-pair"><label>제목 위치<select aria-label="제목 위치" value={cover.titlePosition} onChange={e => patch({titlePosition:e.target.value as StoryCover["titlePosition"]})}>
          <option value="top">위쪽</option><option value="middle">가운데</option><option value="bottom">아래쪽</option></select></label>
          <label>지은이 위치<select aria-label="지은이 위치" value={cover.authorPosition} onChange={e => patch({authorPosition:e.target.value as StoryCover["authorPosition"]})}><option value="bottom">표지 맨 아래</option><option value="under-title">제목 바로 아래</option></select></label></div>
        <div className="cover-form-pair"><label>글 정렬<select aria-label="글 정렬" value={cover.align} onChange={e => patch({align:e.target.value as StoryCover["align"]})}><option value="center">가운데</option><option value="left">왼쪽</option></select></label>
          <label>제목 크기 · {cover.titleSize}<input aria-label="제목 크기" type="range" min="24" max="52" value={cover.titleSize} onChange={e => patch({titleSize:Number(e.target.value)})} /></label></div>
        <div className="cover-form-pair"><label>제목 글자색<input type="color" value={cover.titleColor || COVER_THEMES[cover.theme].ink} onChange={e => patch({titleColor:e.target.value})} /></label><button type="button" onClick={() => patch({titleColor:""})}>기본 글자색</button></div>
        <details><summary>표지 그림 고르기</summary>
          {([["backgroundId", "배경 그림", "background"], ["characterId", "표지 인물", "character"]] as const).map(([field,label,type]) =>
            <label key={field}>{label}<select aria-label={label} value={cover[field]} onChange={e => patch({[field]:e.target.value})}><option value="">그림 없이</option>
              {cover[field] && !STORY_ASSETS.some(a => a.id === cover[field] && a.type === type) && <option value={cover[field]}>현재 자료 (미리보기 불가)</option>}
              {STORY_ASSETS.filter(a=>a.type === type).map(a=><option key={a.id} value={a.id}>{a.displayName}</option>)}</select></label>)}
          <label>인물 위치<select aria-label="인물 위치" value={cover.characterPosition} onChange={e=>patch({characterPosition:e.target.value as StoryCover["characterPosition"]})}><option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option></select></label>
        </details>
        <details><summary>뒤표지 · 작가의 말</summary><label>독자에게 하고 싶은 말<textarea value={cover.authorNote} onChange={e => { patch({authorNote:e.target.value}); setBack(true); }} placeholder="이 이야기를 쓰며 어떤 생각을 했나요?" /></label><p>작품 소개와 함께 뒤표지에 실려요. 나중에 써도 괜찮아요.</p></details>
      </div>
    </div>
    <footer className="book-editor-footer"><span>적용하면 기기에 저장돼요. 플레이에는 ‘플레이에 적용’ 후 보여요.</span><button type="button" onClick={onClose}>취소</button><button type="button" className="primary-button" onClick={() => { onApply(title,cover); onClose(); }}>표지 적용</button></footer>
  </ModalDialog>;
}
