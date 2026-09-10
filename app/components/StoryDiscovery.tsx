"use client";

import { useEffect, useRef, useState } from "react";
import { BASE_STORIES, libraryPage, type StoryTheme, type DiscoveryScreen } from "../story-discovery";
import type { NolstorySharedFile } from "../story-file";
import { MAX_EDITABLE_PROJECTS, type ProjectCollection } from "../story-project-collection";

export type StoryHubGroup = "base" | "mine" | "shared";
type Props = {
  onStoryFile: (file?: File) => void;
  sharedFiles: NolstorySharedFile[];
  onReadShared: (file: NolstorySharedFile) => void;
  onRemixShared: (file: NolstorySharedFile) => void;
  screen: Exclude<DiscoveryScreen, "home">;
  theme: StoryTheme;
  group: StoryHubGroup;
  collection: ProjectCollection;
  busy: boolean;
  failed: boolean;
  notice: string;
  onBack: () => void;
  onCreation: () => void;
  onSelectStory: (theme: StoryTheme) => void;
  onGroup: (group: StoryHubGroup) => void;
  onReadBase: () => void;
  onReadLocal: (id: string) => void;
  onEditLocal: (id: string) => void;
  onCopyBase: () => void;
};

export function StoryDiscovery(props: Props) {
  const story = BASE_STORIES.find(story => story.theme === props.theme)!;
  const fileInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [page, setPage] = useState(0);
  const [capacity, setCapacity] = useState(6);
  useEffect(() => { heading.current?.focus(); }, [props.screen]);
  useEffect(() => {
    const wide = matchMedia("(min-width: 1000px) and (orientation: landscape)");
    const tablet = matchMedia("(min-width: 600px)");
    const update = () => { setCapacity(wide.matches ? 10 : tablet.matches ? 9 : 6); };
    update(); wide.addEventListener("change", update); tablet.addEventListener("change", update);
    return () => { wide.removeEventListener("change", update); tablet.removeEventListener("change", update); };
  }, []);
  const books = [
    ...BASE_STORIES.map(base => ({id:base.id, title:base.title, theme:base.theme, label:"기본 이야기", readable:true, select:() => props.onSelectStory(base.theme)})),
    ...props.sharedFiles.map(file => ({id:`shared:${file.story.project.id}`, title:file.story.project.title || "제목 없는 이야기", theme:"local", label:"공유 작품", readable:true, select:() => props.onReadShared(file)})),
    ...props.collection.projects.map(entry => ({id:entry.draft.project.id, title:entry.playback?.project.title || entry.draft.project.title || "제목 없는 이야기", theme:"local", label:"내 작품", readable:!!entry.playback?.project.lines.length, select:() => props.onReadLocal(entry.draft.project.id)})),
  ];
  const pagination = libraryPage(books, page, capacity);
  const full = props.collection.projects.length >= MAX_EDITABLE_PROJECTS;
  const title = props.screen === "library" ? "서재" : props.screen === "reader-entry" ? `${story.title} · 읽기 선택` : `${story.title} · 이야기 목록`;

  return <main className="story-discovery">
    <header className="discovery-header">
      <div><p className="eyebrow">놀스토리</p><h1 ref={heading} tabIndex={-1}>{title}</h1></div>
      <nav aria-label="화면 이동"><button onClick={props.onBack} disabled={props.busy}>{props.screen === "library" ? "메인으로" : "돌아가기"}</button>
        <button onClick={props.onCreation} disabled={props.busy}>창작 관리</button></nav>
    </header>
    <div className="discovery-file-open"><button onClick={() => fileInput.current?.click()} disabled={props.busy}>.nolstory 파일 열기</button>
      <input ref={fileInput} hidden type="file" accept=".nolstory" onChange={event => { const file=event.currentTarget.files?.[0]; event.currentTarget.value=""; if(file) props.onStoryFile(file); }} /></div>
    {props.notice && <p className="entry-error" role="alert">{props.notice}</p>}
    {props.failed && <p role="status">기기의 작품을 읽지 못했어요. 창작 관리에서 다시 확인할 수 있어요. 기본 이야기는 읽을 수 있어요.</p>}
    {props.screen === "library" ? <>
      <p>기본 이야기를 골라 읽거나, 내가 적용한 작품을 펼쳐 보세요.</p>
      <div className="library-shelf" data-capacity={capacity}>
        {pagination.items.map(book => <article className="library-item" key={book.id}>
          <button className={`library-book library-book-${book.theme}`} onClick={book.select} disabled={props.busy || !book.readable} aria-label={`${book.title} · ${book.label}`}>
            <span className="library-book-kind">{book.label}</span><span className="library-book-title">{book.title}</span>
            <span className="library-book-mark" aria-hidden="true">✦</span>
          </button>
          {!book.readable && <p>편집 화면에서 플레이에 적용해 주세요.</p>}
        </article>)}
      </div>
      {pagination.pages > 1 && <nav className="library-pages" aria-label="서재 페이지">
        <button disabled={pagination.page === 0} onClick={() => setPage(pagination.page - 1)}>이전 책</button>
        <span role="status">{pagination.page + 1} / {pagination.pages}</span>
        <button disabled={pagination.page + 1 === pagination.pages} onClick={() => setPage(pagination.page + 1)}>다음 책</button>
      </nav>}
    </> : props.screen === "reader-entry" ? <>
      <p>{story.description} 읽을 작품의 종류를 골라 주세요.</p>
      <div className="discovery-options">
        <section className="discovery-card"><h2>고전 원작</h2><p>고전 원작 전체는 아직 준비 중이에요. 이어쓰기 앞부분과 구분해요.</p><button disabled>원작 전체 · 준비 중</button></section>
        <section className="discovery-card"><h2>놀스토리 작품</h2><p>놀스토리가 만든 기본 작품과 이 기기에서 내가 만든 작품을 볼 수 있어요.</p><button onClick={() => props.onGroup("base")} disabled={props.busy}>놀스토리 작품 보기</button></section>
        <section className="discovery-card"><h2>공유 작품</h2><p>공유 파일을 열어 다른 사람이 만든 이야기를 읽어요. 편집 작품 자리를 사용하지 않아요.</p><button onClick={() => props.onGroup("shared")} disabled={props.busy}>공유 작품 보기</button></section>
      </div>
    </> : <>
      <nav className="discovery-groups" aria-label="작품 종류">
        {([ ["base","기본 작품"], ["mine","내 작품"], ["shared","공유 작품"] ] as const).map(([group,label]) =>
          <button key={group} aria-pressed={props.group === group} onClick={() => props.onGroup(group)}>{label}</button>)}
      </nav>
      {props.group === "base" ? <section className="discovery-card" aria-label="기본 작품">
        <p className="eyebrow">놀스토리 기본 작품 · 읽기 전용</p><h2>{story.title}</h2>
        <p>전래동화를 바탕으로 다시 만든 선택형 이야기예요. 고전 원작 전체와는 달라요.</p>
        <div className="discovery-actions"><button onClick={props.onReadBase} disabled={props.busy}>기본 작품 읽기</button>
          <button onClick={props.onCopyBase} disabled={props.busy || props.failed || full}>복제해서 만들기</button></div>
        <p>창작할 때만 새 작품으로 복제해요. 읽기는 작품 자리를 사용하지 않아요.</p>
        {full && <p role="status">두 작품을 모두 사용하고 있어요. 새로 만들려면 창작 관리에서 기존 작품을 직접 정리해 주세요.</p>}
      </section> : props.group === "mine" ? <section aria-label="내 작품">
        <p>이 기기에 보관한 모든 편집 작품이에요. 읽기는 마지막으로 적용한 버전을 열어요.</p>
        {!props.collection.projects.length && <div className="discovery-card"><h2>아직 내 작품이 없어요</h2><p>창작 관리에서 첫 이야기를 만들어 보세요.</p></div>}
        <div className="discovery-options">{props.collection.projects.map(entry => <article className="discovery-card" key={entry.draft.project.id}>
          <h2>{entry.draft.project.title || "제목 없는 이야기"}</h2>
          <div className="discovery-actions"><button onClick={() => props.onReadLocal(entry.draft.project.id)} disabled={props.busy || !entry.playback?.project.lines.length}>읽기</button>
            <button onClick={() => props.onEditLocal(entry.draft.project.id)} disabled={props.busy}>이어만들기</button></div>
          {!entry.playback?.project.lines.length && <p>글을 쓰고 플레이에 적용하면 읽을 수 있어요.</p>}
        </article>)}</div>
      </section> : <section aria-label="공유 작품">
        <p>이 창에서 연 공유 파일이에요. 다시 접속하면 보관한 파일을 열어 주세요. 온라인 작품 공개 서비스는 준비 중이에요.</p>
        {!props.sharedFiles.length && <div className="discovery-card"><h2>아직 제공되는 공유 작품이 없어요</h2><p>.nolstory 공유 파일을 열어 읽을 수 있어요.</p></div>}
        <div className="discovery-options">{props.sharedFiles.map(file => <article className="discovery-card" key={file.story.project.id}>
          <h2>{file.story.project.title || "제목 없는 이야기"}</h2><p>{file.sharing.authorDisplayName || "지은이 미입력"}</p>
          <div className="discovery-actions"><button onClick={() => props.onReadShared(file)} disabled={props.busy}>읽기</button>
          {file.sharing.allowRemix && <button onClick={() => props.onRemixShared(file)} disabled={props.busy || props.failed || full}>고쳐 쓰기</button>}</div>
          <p>{file.sharing.allowRemix ? (full ? "두 작품을 모두 사용 중이에요. 창작 관리에서 빈 자리를 마련하면 고쳐 쓸 수 있어요." : "지은이가 고쳐 쓰기를 허용했어요. 새 작품으로 복제해요.") : "읽기 전용 공유 작품이에요."}</p>
        </article>)}</div>
      </section>}
    </>}
  </main>;
}
