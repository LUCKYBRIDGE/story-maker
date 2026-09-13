"use client";
import { UiIcon } from "./UiIcon";

import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { libraryPage, type StoryTheme, type DiscoveryScreen } from "../story-discovery";
import type { NolstorySharedFile } from "../story-file";
import { MAX_EDITABLE_PROJECTS, type ProjectCollection } from "../story-project-collection";
import type { StoryProject } from "../story-data";
import { COVER_THEMES, resolveStoryCover } from "../story-cover";
import { BookCover } from "./BookCover";
import { getExampleProject } from "../story-examples";
import { resolveAssetUrl } from "../story-asset-url";

export type StoryHubGroup = "base" | "mine" | "shared";

export interface StoryDiscoveryProps {
  initialFilter?: StoryHubGroup;
  onStoryFile: (file?: File) => void;
  sharedFiles: NolstorySharedFile[];
  onReadShared: (file: NolstorySharedFile) => void;
  onRemixShared: (file: NolstorySharedFile) => void;
  screen?: Exclude<DiscoveryScreen, "home">;
  theme?: StoryTheme;
  group?: StoryHubGroup;
  collection: ProjectCollection;
  busy: boolean;
  failed: boolean;
  notice: string;
  onBack: () => void;
  onCreation: () => void;
  onOpenQr?: () => void;
  onSelectStory?: (theme: StoryTheme) => void;
  onGroup?: (group: StoryHubGroup) => void;
  onReadBase: (theme?: StoryTheme) => void;
  onReadLocal: (id: string) => void;
  onEditLocal: (id: string) => void;
  onCopyBase: (theme?: StoryTheme) => void;
  onStartBlank?: () => void;
  onStartRabbit?: () => void;
  onStartOnggojib?: () => void;
  onDeleteLocal?: (id: string) => void;
  onBackupLocal?: (id: string) => void;
  onManageLocal?: (id: string) => void;
}

export type SelectedBook =
  | {
      kind: "base";
      id: string;
      theme: StoryTheme;
      title: string;
      subtitle: string;
      description: string;
      paper: string;
      ink: string;
      accent: string;
    }
  | {
      kind: "mine";
      id: string;
      title: string;
      subtitle: string;
      description: string;
      readable: boolean;
      project: StoryProject;
      paper: string;
      ink: string;
      accent: string;
    }
  | {
      kind: "shared";
      id: string;
      title: string;
      subtitle: string;
      description: string;
      file: NolstorySharedFile;
      paper: string;
      ink: string;
      accent: string;
    }
  | {
      kind: "new";
      id: string;
      title: string;
      subtitle: string;
      description: string;
      paper: string;
      ink: string;
      accent: string;
    };

// Keep the previous finish available for the user's visual comparison.
const LIBRARY_ROOM = { finish: "warm", room: "/library/parquet-room-clear.webp", shelf: "/library/oak-shelf-soft.webp" };
// Previous: { finish: "original", room: "/library/sunlit-room.webp", shelf: "/library/oak-shelf.webp" }
const baseCoverProjects = { rabbit: getExampleProject("rabbit"), onggojib: getExampleProject("onggojib") };
function DiscoveryCover({ book }: { book: SelectedBook }) {
  const project = book.kind === "base" ? baseCoverProjects[book.theme]
    : book.kind === "mine" ? book.project : book.kind === "shared" ? book.file.story.project : null;
  return project ? <BookCover project={project} /> : <div className="blank-book-cover">
    <span>아직 쓰지 않은 책</span><span aria-hidden="true">＋</span>
    <strong>새 이야기</strong><small>여기서 시작해요</small>
  </div>;
}

const EASTER_EGG_NOTES = [
  { main: null, sub: "한 권의 상상, 하나의 무대" },
  { main: "틀려도 괜찮아!", sub: "다시 쓰면 더 재미난 모험이 돼" },
  { main: "작은 상상이 무대가 돼요", sub: "언제든 새 이야기를 펼쳐봐요 ✨" },
  { main: "오늘 너의 책장엔", sub: "어떤 모험이 꽂히게 될까?" },
  { main: "이 서재의 주인공은", sub: "바로 너야! 멋진 작가님" },
];

export function StoryDiscovery(props: StoryDiscoveryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [filter, setFilter] = useState<"all" | StoryHubGroup>(props.initialFilter ?? "all");
  const [sharedTheme, setSharedTheme] = useState<StoryTheme | null>(null);
  const dialogTitleId = useId();

  const [page, setPage] = useState(0);
  const [shelfLayout, setShelfLayout] = useState({ columns: 5, rows: 2 });
  const capacity = shelfLayout.columns * shelfLayout.rows;
  const shelfRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLElement>(null);
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);
  const [easterEggIndex, setEasterEggIndex] = useState(0);
  const [isFrameTapping, setIsFrameTapping] = useState(false);

  const cycleEasterEgg = () => {
    setEasterEggIndex((prev) => (prev + 1) % EASTER_EGG_NOTES.length);
    setIsFrameTapping(true);
    setTimeout(() => setIsFrameTapping(false), 360);
  };

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1000px)");
    const tablet = matchMedia("(min-width: 600px)");
    const portrait = matchMedia("(orientation: portrait)");
    const update = () => setShelfLayout({
      columns: wide.matches && !portrait.matches ? 5 : tablet.matches ? 3 : 2,
      rows: portrait.matches ? 3 : 2,
    });
    update();
    const queries = [wide, tablet, portrait];
    queries.forEach(query => query.addEventListener("change", update));
    return () => queries.forEach(query => query.removeEventListener("change", update));
  }, []);

  // Measure layout coordinates, not animated rectangles, so a second resize can
  // interrupt an in-flight movement without accumulating transform offsets.
  useLayoutEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let previous = new Map<string, { x: number; y: number; width: number }>();
    const animations = new Map<HTMLElement, Animation>();
    let frame = 0;
    const measure = () => {
      const next = new Map<string, { x: number; y: number; width: number }>();
      shelf.querySelectorAll<HTMLElement>("[data-book-id]").forEach((element, index) => {
        const id = element.dataset.bookId!;
        const rect = { x: element.offsetLeft, y: element.offsetTop, width: element.offsetWidth };
        const old = previous.get(id);
        next.set(id, rect);
        if (reduced.matches) { animations.get(element)?.cancel(); return; }
        if (old && (Math.abs(old.x - rect.x) > 1 || Math.abs(old.y - rect.y) > 1 || Math.abs(old.width - rect.width) > 1)) {
          const current = getComputedStyle(element).transform;
          const matrix = current === "none" ? new DOMMatrix() : new DOMMatrix(current);
          animations.get(element)?.cancel();
          const animation = element.animate([
            { transform: `translate(${old.x - rect.x + matrix.m41}px, ${old.y - rect.y + matrix.m42}px) scale(${Math.min(1.12, Math.max(.88, old.width / rect.width))})` },
            { transform: "translate(0, 0) scale(1)" },
          ], { duration: 560 + index * 18, easing: "cubic-bezier(.22, 1, .36, 1)" });
          animations.set(element, animation);
        } else if (!old && previous.size) {
          animations.set(element, element.animate([
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 420, delay: index * 24, easing: "ease-out" }));
        }
      });
      for (const [element, animation] of animations) {
        if (!element.isConnected) { animation.cancel(); animations.delete(element); }
      }
      previous = next;
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(schedule);
    const mutation = new MutationObserver(schedule);
    resize.observe(shelf);
    mutation.observe(shelf, { childList: true, attributes: true, attributeFilter: ["style"] });
    const stopMotion = () => { if (reduced.matches) animations.forEach(animation => animation.cancel()); };
    reduced.addEventListener("change", stopMotion);
    measure();
    return () => {
      resize.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame);
      reduced.removeEventListener("change", stopMotion);
      animations.forEach(animation => animation.cancel());
    };
  }, []);

  useLayoutEffect(() => {
    const room = roomRef.current;
    const bookcase = shelfRef.current?.parentElement;
    if (!room || !bookcase || !["soft", "warm"].includes(LIBRARY_ROOM.finish)) return;
    // The generated wall/floor seam is at 80.5%; keep it under the plinth
    // even when a filter notice, another shelf, or pagination changes height.
    const alignFloor = () => {
      const bottom = bookcase.getBoundingClientRect().bottom - room.getBoundingClientRect().top;
      room.style.setProperty("--room-image-height", `${(bottom - 22) / .805}px`);
    };
    const observer = new ResizeObserver(alignFloor);
    observer.observe(room); observer.observe(bookcase);
    alignFloor();
    return () => observer.disconnect();
  }, []);

  function closeOverlay() {
    // A read/edit action may unmount this component before the next layout effect.
    try { sessionStorage.setItem("storygame:library-view:v1", JSON.stringify({version: 1, filter, page, sharedTheme})); } catch { /* optional tab state */ }
    setSelectedBook(null);
  }

  // 1. 기본 작품 데이터
  const baseBooks: SelectedBook[] = [
    {
      kind: "base",
      id: "onggojib",
      theme: "onggojib",
      title: "옹고집전",
      subtitle: "옹고집의 속죄",
      description: "똑같이 생긴 두 옹고집, 진짜는 누구일까요? 욕심쟁이 옹고집의 흥미진진한 재판 이야기.",
      paper: "#1e4635",
      ink: "#fcf8ec",
      accent: "#d4af37",
    },
    {
      kind: "base",
      id: "rabbit-turtle",
      theme: "rabbit",
      title: "토끼와 자라",
      subtitle: "용궁 속 지혜",
      description: "용왕님의 약을 구하러 뭍으로 나온 자라와 꾀를 낸 토끼의 아슬아슬한 모험 이야기.",
      paper: "#f7f1e3",
      ink: "#2e2417",
      accent: "#8b6e46",
    },
  ];

  // 2. 내 작품 데이터
  const localBooks: SelectedBook[] = props.collection.projects.map((entry) => {
    const project = entry.playback?.project || entry.draft.project;
    const cover = resolveStoryCover(project);
    const themeStyle = COVER_THEMES[cover.theme] || COVER_THEMES.forest;
    return {
      kind: "mine",
      id: entry.draft.project.id,
      title: project.title || "제목 없는 이야기",
      subtitle: cover.subtitle || (cover.author ? `${cover.author} 지음` : "내가 만든 이야기"),
      description: project.description || "이 기기에 보관 중인 나의 창작 이야기입니다.",
      readable: Boolean(entry.playback?.project.lines.length),
      project,
      paper: themeStyle.paper,
      ink: themeStyle.ink,
      accent: themeStyle.accent,
    };
  });

  // 3. 공유 작품 데이터
  const sharedBooks: SelectedBook[] = props.sharedFiles.map((file) => ({
    kind: "shared",
    id: `shared:${file.story.project.id}`,
    title: file.story.project.title || "제목 없는 이야기",
    subtitle: file.sharing.authorDisplayName ? `${file.sharing.authorDisplayName} 작가` : "공유 작품",
    description: file.story.project.description || "다른 사람이 공유해 준 이야기입니다.",
    file,
    paper: "#24384d",
    ink: "#f5f0e6",
    accent: "#c7a76c",
  }));

  // 새 이야기 특수 책
  const newStoryBook: SelectedBook = {
    kind: "new",
    id: "__new_story__",
    title: "새 이야기 만들기",
    subtitle: "새로운 이야기를 시작해요",
    description: "빈 도화지에서 자유롭게 시작하거나, 준비된 전래동화의 뒷이야기를 내가 상상해 보세요.",
    paper: "#fcf8ee",
    ink: "#382c1e",
    accent: "#bfa373",
  };

  // 표준 테스트 및 페이지네이션 대상 책 목록 (기본 + 내 작품 + 공유)
  const booksToDisplay = [...baseBooks, ...localBooks, ...sharedBooks];
  const visibleBooks = booksToDisplay.filter(book => filter === "all" || book.kind === filter)
    .filter(book => {
      if (filter !== "shared" || !sharedTheme) return true;
      const source = book.kind === "shared" ? book.file.story.project.source : undefined;
      return source && "baseStoryId" in source &&
        source.baseStoryId === (sharedTheme === "rabbit" ? "rabbit-turtle" : "onggojib");
    });
  const shelfBooks = filter === "all" || filter === "mine" ? [...visibleBooks, newStoryBook] : visibleBooks;
  const pagination = libraryPage(shelfBooks, page, capacity);
  function changeFilter(next: "all" | StoryHubGroup) {
    setFilter(next); setSharedTheme(null); setPage(0);
  }
  const isFull = props.collection.projects.length >= MAX_EDITABLE_PROJECTS;

  const allSelectableBooks = [...visibleBooks, newStoryBook];
  const currentFrameNote = EASTER_EGG_NOTES[easterEggIndex];
  const countLabel = `${visibleBooks.length}권의 이야기`;

  const [libraryRestored, setLibraryRestored] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem("storygame:library-view:v1") ?? "null");
        if (saved?.version === 1 && !props.initialFilter) {
          if (["all", "base", "mine", "shared"].includes(saved.filter)) setFilter(saved.filter);
          if (Number.isSafeInteger(saved.page) && saved.page >= 0) setPage(saved.page);
          if (["rabbit", "onggojib"].includes(saved.sharedTheme)) setSharedTheme(saved.sharedTheme);
          const book = [...booksToDisplay, newStoryBook].find(book => book.id === saved.selectedId);
          if (book) setSelectedBook(book);
        }
      } catch { /* Optional tab state never changes the collection. */ }
      setLibraryRestored(true);
    });
    return () => cancelAnimationFrame(frame);
    // The parent has already loaded the collection before restoring this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (!libraryRestored) return;
    try { sessionStorage.setItem("storygame:library-view:v1", JSON.stringify({version: 1, filter, page, sharedTheme, selectedId: selectedBook?.id})); } catch { /* optional tab state */ }
  }, [libraryRestored, filter, page, sharedTheme, selectedBook?.id]);


  const goToPrevBook = () => {
    if (!selectedBook) return;
    const currentIndex = allSelectableBooks.findIndex((b) => b.id === selectedBook.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + allSelectableBooks.length) % allSelectableBooks.length;
    const nextBook = allSelectableBooks[prevIndex];
    setSelectedBook(nextBook);
    if (nextBook.kind === "base" && props.onSelectStory) {
      props.onSelectStory(nextBook.theme);
    }
  };

  const goToNextBook = () => {
    if (!selectedBook) return;
    const currentIndex = allSelectableBooks.findIndex((b) => b.id === selectedBook.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % allSelectableBooks.length;
    const nextBook = allSelectableBooks[nextIndex];
    setSelectedBook(nextBook);
    if (nextBook.kind === "base" && props.onSelectStory) {
      props.onSelectStory(nextBook.theme);
    }
  };

  // Keep navigation current without tearing down focus on each book change.
  const handleDialogKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); closeOverlay(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goToPrevBook(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goToNextBook(); }
    if (e.key === "Tab") {
      const items = Array.from(overlayRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])
        .filter(el => el.getClientRects().length > 0);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  });
  const dialogOpen = Boolean(selectedBook);
  useEffect(() => {
    if (!dialogOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => handleDialogKey(event);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [dialogOpen]);

  return (
    <main ref={roomRef} className="story-discovery" data-room-finish={LIBRARY_ROOM.finish} style={{ "--library-room": `url("${resolveAssetUrl(LIBRARY_ROOM.room)}")`, "--shelf-wood": `url("${resolveAssetUrl(LIBRARY_ROOM.shelf)}")`, "--library-plant": `url("${resolveAssetUrl("/library/pothos-pot.webp")}")`, "--library-foreground-left": `url("${resolveAssetUrl("/library/foreground-plant-books.webp")}")`, "--library-foreground-right": `url("${resolveAssetUrl("/library/foreground-chair-lamp.webp")}")` } as CSSProperties}>
      <div className="library-foreground library-foreground-left" aria-hidden="true" />
      <div className="library-foreground library-foreground-right" aria-hidden="true" />
      <div className="library-room-content" inert={dialogOpen}>
      {/* 🌟 1. 따뜻한 서재 헤더 및 네비게이션 */}
      <header className="library-theater-header">
        <div className="library-header-bar">
          <button
            type="button"
            className="library-nav-btn library-btn-back"
            onClick={props.onBack}
            disabled={props.busy}
          >
            <UiIcon name="back" /> 놀스토리 소개
          </button>

          <div className="library-center-badge">
            <svg
              className="library-book-emblem"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b58a43"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1Zm0 0v16" />
            </svg>
            <span className="library-eyebrow-text">한 권의 상상, 하나의 무대</span>
            <h1 ref={headingRef} tabIndex={-1} className="library-main-heading">
              나의 이야기 극장
            </h1>
            <p className="library-motto">책을 펼치면 무대가 시작돼요</p>
          </div>

          <div className="library-header-tools">
            {props.onOpenQr && (
              <button
                type="button"
                className="library-nav-btn library-btn-qr"
                onClick={props.onOpenQr}
                disabled={props.busy}
                aria-label="교실 접속 QR 코드 열기"
                title="교실 접속 QR 코드 열기"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="6.5" y="6.5" width="0.1" height="0.1" strokeWidth="3" />
                  <rect x="17.5" y="6.5" width="0.1" height="0.1" strokeWidth="3" />
                  <rect x="6.5" y="17.5" width="0.1" height="0.1" strokeWidth="3" />
                  <path d="M14 14h3v3h-3z" />
                  <path d="M20 14v3" />
                  <path d="M14 20h6" />
                </svg>
                <span>접속 QR</span>
              </button>
            )}
            <button
              type="button"
              className="library-nav-btn library-btn-manage"
              onClick={props.onCreation}
              disabled={props.busy}
            >
              <span aria-hidden="true">📁</span> 창작 관리
            </button>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept=".nolstory"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                e.currentTarget.value = "";
                if (file) props.onStoryFile(file);
              }}
            />
          </div>
        </div>

        {props.notice && (
          <p className="entry-error" role="alert">
            {props.notice}
          </p>
        )}
        {props.failed && (
          <p className="library-warning-box" role="status">
            기기의 작품을 읽지 못했어요. 창작 관리에서 다시 확인할 수 있어요. 기본 이야기는 바로 읽을 수 있어요.
          </p>
        )}
      </header>

      <div className="library-catalog-bar">
        <div className="library-filters" role="group" aria-label="책 종류">
          {([["all", "모든 책"], ["base", "기본 이야기"], ["mine", "내 작품"], ["shared", "모두의 이야기"]] as const).map(([value, label]) =>
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => changeFilter(value)}>{label}</button>)}
        </div>
      </div>
      {filter === "shared" && <div className="library-collection-note">
        <p>{sharedTheme ? `${sharedTheme === "rabbit" ? "토끼와 자라" : "옹고집전"}에서 시작한 공유 이야기` : "친구가 건네준 공유 파일을 이 서재에서 읽어요."}</p>
        <small>불러온 공유 작품은 지금 열린 세션에서만 보여요. 온라인 공개 서재는 준비 중이에요.</small>
        <button type="button" className="library-nav-btn" disabled={props.busy} onClick={() => fileInputRef.current?.click()}>공유 파일 열기</button>
        {sharedTheme && <button type="button" className="library-nav-btn" onClick={() => setSharedTheme(null)}>모든 공유 작품 보기</button>}
      </div>}
      {/* 🌟 2. 원목 책장 공간 (Wooden Bookshelf Space) */}
      <section
        className={`library-bookcase ${selectedBook ? "is-receded" : ""}`}
        aria-label="서재 책장"
      >
        <button
          type="button"
          className={`library-top-frame ${isFrameTapping ? "is-tapping" : ""}`}
          onClick={cycleEasterEgg}
          aria-label={currentFrameNote.main ? `놀스토리 서재: ${currentFrameNote.main} - ${currentFrameNote.sub}` : `서재 안내 액자 · ${countLabel}`}
          title="눌러서 놀스토리 서재 쪽지를 확인해보세요!"
        >
          <span className="library-frame-inner">
            <header className="library-frame-header">
              <span className="library-frame-brand">놀스토리 서재</span>
            </header>
            <div className="library-frame-body">
              <strong className="library-frame-main" role={currentFrameNote.main ? undefined : "status"}>
                {currentFrameNote.main ?? countLabel}
              </strong>
              <span className="library-frame-sub">{currentFrameNote.sub}</span>
            </div>
          </span>
        </button>
        <div className="library-top-plant" aria-hidden="true" />
        <div className="library-upright library-upright-left" aria-hidden="true" />
        <div className="library-upright library-upright-right" aria-hidden="true" />
        {/* 책장 선반 컨테이너 (tests/browser 호환 data-capacity 유지) */}
        <div
          ref={shelfRef}
          className="library-shelf"
          style={{ "--shelf-rows": shelfLayout.rows, "--shelf-columns": shelfLayout.columns } as CSSProperties}
          data-capacity={capacity}
          data-rows={shelfLayout.rows}
        >
          {pagination.items.length === 0 && <div className="library-empty"><span aria-hidden="true">◇</span><h2>{filter === "mine" ? "첫 이야기를 기다리는 자리" : "아직 제공되는 공유 작품이 없어요"}</h2><p>{filter === "mine" ? "새 이야기를 만들면 여기에 한 권씩 꽂혀요." : "친구의 공유 파일을 열어 함께 읽어 보세요."}</p></div>}
          {pagination.items.map((book) => {
            const isBase = book.kind === "base";
            const isMine = book.kind === "mine";
            const isShared = book.kind === "shared";
            const themeClass = isBase
              ? book.theme === "onggojib"
                ? "library-book-onggojib"
                : "library-book-rabbit"
              : "library-book-local";
            const accessibleLabel = book.kind === "new" ? "빈 책 · 새 이야기 만들기" : `${book.title} · ${
              isBase ? "기본 이야기" : isMine ? "내 작품" : isShared ? "공유 작품" : "이야기"
            }`;

            return (
              <article className={`library-item ${book.kind === "new" ? "library-item-new" : ""}`} key={book.id} data-book-id={book.id}>
                <button
                  type="button"
                  className={`shelf-book library-book ${themeClass} ${book.kind === "new" ? "library-book-new" : ""}`}
                  onClick={() => {
                    setSelectedBook(book);
                    if (isBase && props.onSelectStory) {
                      props.onSelectStory(book.theme);
                    }
                  }}
                  disabled={props.busy}
                  aria-label={accessibleLabel}
                  style={
                    {
                      "--book-paper": book.paper,
                      "--book-ink": book.ink,
                      "--book-accent": book.accent,
                    } as CSSProperties
                  }
                >
                  <DiscoveryCover book={book} />
                  <span className="library-book-kind">{isBase ? "기본 이야기" : isMine ? "내 작품" : isShared ? "공유 작품" : "새 이야기 만들기"}</span>
                </button>

                {/* 선반 바닥 나무 디테일 */}
                <div className="shelf-plank-edge" aria-hidden="true" />
              </article>
            );
          })}


        </div>

        {/* 선반 페이지네이션 (< > chevrons & dots: 책 수가 많을 때만 표시) */}
        {pagination.pages > 1 && (
          <nav className="shelf-paging-bar" aria-label="서재 페이지">
            <button
              type="button"
              className="shelf-arrow-btn prev"
              disabled={pagination.page === 0}
              onClick={() => setPage(Math.max(0, pagination.page - 1))}
              aria-label="이전 선반 책들 보기"
            >
              ‹
            </button>
            <div className="shelf-dots" role="status" aria-label={`현재 ${pagination.page + 1}번째 선반`}>
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <span
                  key={i}
                  className={`shelf-dot ${i === pagination.page ? "active" : ""}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="shelf-arrow-btn next"
              disabled={pagination.page + 1 === pagination.pages}
              onClick={() => setPage(Math.min(pagination.pages - 1, pagination.page + 1))}
              aria-label="다음 선반 책들 보기"
            >
              ›
            </button>
          </nav>
        )}
      </section>

      <footer className="library-footer">
        <span aria-hidden="true">─ ◇ ─</span><p>오늘도, 새로운 이야기가 기다리고 있어요.</p><small>© 놀퀴즈</small>
      </footer>
      </div>
      {/* 🌟 4. 책 꺼내기 Focus Stage */}
      {selectedBook && (
        <div
          className="library-focus-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeOverlay();
          }}
          role="presentation"
        >
          <section
            ref={overlayRef}
            className="library-focus-stage"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
          {/* 상단 닫기/돌아가기 버튼 */}
          <button
            type="button"
            className="btn-focus-close"
            onClick={closeOverlay}
            aria-label="돌아가기"
            title="서재로 돌아가기 (Escape)"
          >
            <UiIcon name="close" />
            <span className="btn-close-label">돌아가기</span>
          </button>

            {/* 상단 엠블럼 및 서재 타이틀 */}
            <div className="focus-header">
              <div className="focus-emblem-wrap" aria-hidden="true">
                <svg
                  className="focus-book-emblem"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c99239"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10M6 10h10M6 14h6" />
                </svg>
              </div>
              <span className="focus-eyebrow">나의 이야기 극장</span>
              <p className="focus-motto">책을 펼치면 무대가 시작돼요</p>
              <div className="focus-divider-ornament" aria-hidden="true">
                ─ ◇ ─
              </div>
            </div>

            {/* 중앙 책 쇼케이스 & 좌우 탐색 네비게이션 */}
            <div className="focus-showcase-row">
              <button
                type="button"
                className="focus-nav-arrow focus-arrow-prev"
                onClick={goToPrevBook}
                aria-label="이전 이야기"
                title="이전 이야기 (← 키)"
              >
                <span aria-hidden="true">‹</span>
              </button>

              <div className="focus-book-stage-center" key={selectedBook.id}>
                {/* 은은한 금빛 반짝임 효과 */}
                <div className="focus-sparkles" aria-hidden="true">
                  <span className="sparkle s1">✦</span>
                  <span className="sparkle s2">✧</span>
                  <span className="sparkle s3">✦</span>
                  <span className="sparkle s4">✧</span>
                </div>

                {/* 3D 하드커버 양장본 책 */}
                <div
                  className="focus-hardcover-book"
                  style={
                    {
                      "--book-paper": selectedBook.paper,
                      "--book-ink": selectedBook.ink,
                      "--book-accent": selectedBook.accent,
                    } as CSSProperties
                  }
                >
                  <DiscoveryCover book={selectedBook} />
                </div>

                {/* 책 하단 원목 받침대 (Wooden Pedestal) */}
                <div className="focus-pedestal" aria-hidden="true">
                  <div className="pedestal-disc" />
                  <div className="pedestal-rim" />
                  <div className="pedestal-shadow" />
                </div>
              </div>

              <button
                type="button"
                className="focus-nav-arrow focus-arrow-next"
                onClick={goToNextBook}
                aria-label="다음 이야기"
                title="다음 이야기 (→ 키)"
              >
                <span aria-hidden="true">›</span>
              </button>
            </div>

            {/* 책 메타 텍스트 (제목, 한두 줄 소개, 오너먼트) */}
            <div className="focus-meta-block">
              <h2 id={dialogTitleId} className="focus-meta-title">
                {selectedBook.title}
              </h2>
              <p className="focus-meta-desc">{selectedBook.description}</p>
              {selectedBook.kind === "base" && <small className="focus-availability">원작 읽기 · 준비 중</small>}
              <div className="focus-meta-filigree" aria-hidden="true">
                ─ ◇ ─
              </div>
            </div>

            {/* 하단 4개 액션 카드 그리드 */}
            <div className="focus-action-grid">
              {/* 1) 기본 전래동화 선택 시 */}
              {selectedBook.kind === "base" && (
                <>
                  <button
                    type="button"
                    className="focus-action-card is-primary"
                    aria-label="기본 작품 읽기"
                    onClick={() => {
                      closeOverlay();
                      props.onReadBase(selectedBook.theme);
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                        <polygon points="12 4 13.5 7.5 17 8 14.5 10.5 15 14 12 12.5 9 14 9.5 10.5 7 8 10.5 7.5 12 4" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">놀스토리 읽기</strong>
                      <small className="action-card-sub">새롭게 각색한 이야기를 읽어요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card"
                    aria-label="공유 작품 보기"
                    onClick={() => {
                      closeOverlay(); setFilter("shared"); setSharedTheme(selectedBook.theme); setPage(0);
                      requestAnimationFrame(() => headingRef.current?.focus());
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">모두의 이야기 읽기</strong>
                      <small className="action-card-sub">친구들이 만든 이야기를 읽어요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card is-accent"
                    aria-label="복제해서 만들기"
                    onClick={() => {
                      closeOverlay();
                      props.onCopyBase(selectedBook.theme);
                    }}
                    disabled={props.busy || props.failed || isFull}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">편집하기</strong>
                      <small className="action-card-sub">나만의 이야기를 만들어봐요</small>
                    </div>
                  </button>
                </>
              )}

              {/* 2) 내가 만든 이야기 선택 시 */}
              {selectedBook.kind === "mine" && (
                <>
                  <button
                    type="button"
                    className="focus-action-card is-primary"
                    aria-label="읽기"
                    onClick={() => {
                      closeOverlay();
                      props.onReadLocal(selectedBook.id);
                    }}
                    disabled={props.busy || !selectedBook.readable}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">이야기 읽기</strong>
                      <small className="action-card-sub">
                        {selectedBook.readable
                          ? "완성된 플레이 버전을 펼쳐 읽어요"
                          : "플레이에 적용한 뒤 읽을 수 있어요"}
                      </small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card is-accent"
                    aria-label="이어만들기"
                    onClick={() => {
                      closeOverlay();
                      props.onEditLocal(selectedBook.id);
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">이어만들기</strong>
                      <small className="action-card-sub">스튜디오에서 대본과 무대를 고쳐 써요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card"
                    aria-label="파일로 보관"
                    onClick={() => {
                      props.onBackupLocal?.(selectedBook.id);
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">파일로 보관</strong>
                      <small className="action-card-sub">.nolstory 파일로 내 기기에 저장해요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card"
                    aria-label="Excel·복구 도구"
                    onClick={() => {
                      closeOverlay();
                      props.onManageLocal?.(selectedBook.id);
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">Excel·복구 도구</strong>
                      <small className="action-card-sub">스프레드시트로 저장하거나 이전 작업본으로 복구해요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card is-danger"
                    aria-label="작품 삭제"
                    onClick={() => {
                      if (confirm(`'${selectedBook.title}' 이야기를 정말 삭제할까요?`)) {
                        closeOverlay();
                        props.onDeleteLocal?.(selectedBook.id);
                      }
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">작품 삭제</strong>
                      <small className="action-card-sub">이 작품을 기기에서 정리해요</small>
                    </div>
                  </button>
                </>
              )}

              {/* 3) 공유받은 이야기 선택 시 */}
              {selectedBook.kind === "shared" && (
                <>
                  <button
                    type="button"
                    className="focus-action-card is-primary"
                    aria-label="읽기"
                    onClick={() => {
                      closeOverlay();
                      props.onReadShared(selectedBook.file);
                    }}
                    disabled={props.busy}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">공유 이야기 읽기</strong>
                      <small className="action-card-sub">친구가 공유한 이야기를 감상해요</small>
                    </div>
                  </button>

                  {selectedBook.file.sharing.allowRemix ? (
                    <button
                      type="button"
                      className="focus-action-card is-accent"
                      aria-label="고쳐 쓰기"
                      onClick={() => {
                        closeOverlay();
                        props.onRemixShared(selectedBook.file);
                      }}
                      disabled={props.busy || props.failed || isFull}
                    >
                      <div className="action-card-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </div>
                      <div className="action-card-text">
                        <strong className="action-card-title">고쳐 쓰기</strong>
                        <small className="action-card-sub">내 작품으로 가져와 새롭게 바꿔요</small>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="focus-action-card is-disabled"
                      disabled
                      aria-label="고쳐 쓰기 불가"
                    >
                      <div className="action-card-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <div className="action-card-text">
                        <strong className="action-card-title">읽기 전용</strong>
                        <small className="action-card-sub">원작자가 감상용으로 공유했어요</small>
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    className="focus-action-card"
                    onClick={() => {
                      closeOverlay();
                      props.onCreation();
                    }}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">창작 관리</strong>
                      <small className="action-card-sub">내가 쓰는 작품을 관리해요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card"
                    onClick={closeOverlay}
                    aria-label="서재로 돌아가기"
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">서재로 돌아가기</strong>
                      <small className="action-card-sub">다른 책을 다시 살펴봐요</small>
                    </div>
                  </button>
                </>
              )}

              {/* 4) 새 이야기 만들기 선택 시 */}
              {selectedBook.kind === "new" && (
                <>
                  <button
                    type="button"
                    className="focus-action-card is-primary"
                    onClick={() => {
                      closeOverlay();
                      props.onStartBlank?.();
                    }}
                    disabled={props.busy || props.failed || isFull}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">빈 이야기부터 만들기</strong>
                      <small className="action-card-sub">처음부터 나만의 무대로 시작해요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card is-accent"
                    onClick={() => {
                      closeOverlay();
                      props.onStartRabbit?.();
                    }}
                    disabled={props.busy || props.failed || isFull}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <span>🐰</span>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">토끼와 자라 이어 쓰기</strong>
                      <small className="action-card-sub">용궁 위기에서 다음 대사부터 써요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card is-accent"
                    onClick={() => {
                      closeOverlay();
                      props.onStartOnggojib?.();
                    }}
                    disabled={props.busy || props.failed || isFull}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <span>⚖️</span>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">옹고집전 이어 쓰기</strong>
                      <small className="action-card-sub">두 옹고집의 첫 재판부터 써요</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="focus-action-card"
                    onClick={() => {
                      closeOverlay();
                      props.onCreation();
                    }}
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">외부 파일 가져오기</strong>
                      <small className="action-card-sub">Excel이나 파일에서 불러와요</small>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* 슬롯 꽉 참 안내 */}
            {isFull && (selectedBook.kind === "base" || selectedBook.kind === "new") && (
              <p className="focus-slot-notice" role="status">
                두 작품을 모두 사용하고 있어요. 새로 만들려면 창작 관리에서 기존 작품을 정리해 주세요.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
