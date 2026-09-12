"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_EDITABLE_PROJECTS, type ProjectCollection } from "../story-project-collection";

type Props = {
  collection: ProjectCollection;
  busy: boolean;
  failed: boolean;
  notice: string;
  onHome: () => void;
  onRetry: () => void;
  onManage: (id: string) => void;
  onDelete: (id: string) => void;
  onStoryFile: (file?: File) => void;
  onBackup: (id: string) => void;
  onExcel: (file?: File) => void;
  onSheet: (url: string) => void;
};

export function CreationHub(props: Props) {
  const { collection, busy, failed, notice } = props;
  const [sheetUrl, setSheetUrl] = useState("");
  const storyFileInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return <main className="creation-hub">
    <header className="creation-hub-header">
      <div><p className="eyebrow">이 기기의 작품</p><h1 ref={heading} tabIndex={-1}>창작 관리</h1>
        <p>작품을 가져오고, 백업하고, 복구해요. 읽기와 이어 만들기는 서재에서 할 수 있어요.</p></div>
      <button className="ghost-button" onClick={props.onHome} disabled={busy}>서재로</button>
    </header>
    {notice && <p className="entry-error" role="alert">{notice}</p>}
    {failed ? <section className="creation-hub-panel">
      <h2>저장된 작품을 열지 못했어요</h2><p>원본은 그대로 보존했어요. 저장소를 다시 확인해 주세요.</p>
      <button onClick={props.onRetry} disabled={busy}>다시 확인</button>
    </section> : <>
      <section aria-labelledby="creation-projects-title">
        <h2 id="creation-projects-title">이 기기의 보관함 · {collection.projects.length}/{MAX_EDITABLE_PROJECTS}</h2>
        {!collection.projects.length && <p>아직 보관된 작품이 없어요. 파일을 가져오거나 서재에서 새 이야기를 시작해 보세요.</p>}
        <div className="creation-projects">
          {collection.projects.map(({ draft }) => <article className="creation-project-card" key={draft.project.id} aria-label={draft.project.title || "제목 없는 이야기"}>
            <h3>{draft.project.title || "제목 없는 이야기"}</h3>
            <p>{collection.selectedProjectId === draft.project.id ? "최근 선택한 작품 · " : ""}장 {draft.project.chapters.length}개 · 컷 {draft.project.lines.length}개</p>
            <div className="creation-project-actions">
              <button onClick={() => props.onBackup(draft.project.id)} disabled={busy}>파일로 보관</button>
              <button onClick={() => props.onManage(draft.project.id)} disabled={busy}>Excel·복구 도구</button>
              <button className="danger-button" onClick={() => props.onDelete(draft.project.id)} disabled={busy}>삭제</button>
            </div>

          </article>)}
        </div>
      </section>
      <section className="creation-hub-panel" aria-labelledby="creation-import-title">
        <h2 id="creation-import-title">파일·시트 가져오기</h2>
        <p>Excel 파일은 새 작품으로 추가해요. 같은 Google 시트는 확인 후 편집본을 바꿀 수 있어요.</p>
        <button onClick={() => storyFileInput.current?.click()} disabled={busy}>.nolstory 파일 열기</button>
        <input ref={storyFileInput} hidden type="file" accept=".nolstory" onChange={event => { const file=event.currentTarget.files?.[0]; event.currentTarget.value=""; if(file) props.onStoryFile(file); }} />
        <button onClick={() => fileInput.current?.click()} disabled={busy}>Excel 파일 열기</button>
        <input ref={fileInput} hidden type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={event => {
          const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
          if (file) props.onExcel(file);
        }} />
        <label className="field"><span>공개 Google 시트 주소</span><input type="url" value={sheetUrl} onChange={event => setSheetUrl(event.target.value)} disabled={busy} /></label>
        <button onClick={() => props.onSheet(sheetUrl.trim())} disabled={busy || !sheetUrl.trim()}>시트에서 이어만들기</button>
      </section>
    </>}
  </main>;
}
