"use client";

/* eslint-disable @next/next/no-img-element -- 동화 책 표지 및 캐릭터 자산 렌더링 */

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { libraryPage, type StoryTheme, type DiscoveryScreen } from "../story-discovery";
import type { NolstorySharedFile } from "../story-file";
import { MAX_EDITABLE_PROJECTS, type ProjectCollection } from "../story-project-collection";
import type { StoryProject } from "../story-data";
import { COVER_THEMES, resolveStoryCover } from "../story-cover";
import { resolveAssetUrl } from "../story-asset-url";

export type StoryHubGroup = "base" | "mine" | "shared";

export interface StoryDiscoveryProps {
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
}

export type SelectedBook =
  | {
      kind: "base";
      id: string;
      theme: StoryTheme;
      title: string;
      subtitle: string;
      description: string;
      coverArt: string;
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

export function StoryDiscovery(props: StoryDiscoveryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogTitleId = useId();

  const [page, setPage] = useState(0);
  const [capacity, setCapacity] = useState(10);
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    const wide = matchMedia("(min-width: 1000px) and (orientation: landscape)");
    const tablet = matchMedia("(min-width: 600px)");
    const update = () => {
      setCapacity(wide.matches ? 10 : tablet.matches ? 9 : 6);
    };
    update();
    wide.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);

  function closeOverlay() {
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
      coverArt: resolveAssetUrl("/story-assets/onggojib.character.real-angry-pixel.webp"),
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
      coverArt: resolveAssetUrl("/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp"),
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
      project: entry.draft.project,
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
  const pagination = libraryPage(booksToDisplay, page, capacity);
  const isFull = props.collection.projects.length >= MAX_EDITABLE_PROJECTS;

  const allSelectableBooks = [...booksToDisplay, newStoryBook];

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

  // Overlay Focus Trap, Escape & Arrow key handling
  useEffect(() => {
    if (!selectedBook) return;
    const dialog = overlayRef.current;
    const previous = document.activeElement as HTMLElement | null;
    previousFocusRef.current = previous;

    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]:not([disabled])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0]?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeOverlay();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = allSelectableBooks.findIndex((b) => b.id === selectedBook.id);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + allSelectableBooks.length) % allSelectableBooks.length;
          const nextBook = allSelectableBooks[prevIndex];
          setSelectedBook(nextBook);
          if (nextBook.kind === "base" && props.onSelectStory) {
            props.onSelectStory(nextBook.theme);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const currentIndex = allSelectableBooks.findIndex((b) => b.id === selectedBook.id);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allSelectableBooks.length;
          const nextBook = allSelectableBooks[nextIndex];
          setSelectedBook(nextBook);
          if (nextBook.kind === "base" && props.onSelectStory) {
            props.onSelectStory(nextBook.theme);
          }
        }
      } else if (e.key === "Tab" && dialog) {
        const items = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex="0"]:not([disabled])'
          )
        ).filter((el) => el.getClientRects().length > 0);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  });

  return (
    <main className="story-discovery">
      {/* 🌟 1. 따뜻한 서재 헤더 및 네비게이션 */}
      <header className="library-theater-header">
        <div className="library-header-bar">
          <button
            type="button"
            className="library-nav-btn library-btn-back"
            onClick={props.onBack}
            disabled={props.busy}
          >
            <span aria-hidden="true">←</span> 메인으로
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
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10M6 10h10M6 14h6" />
            </svg>
            <span className="library-eyebrow-text">나의 이야기 극장</span>
            <h1 ref={headingRef} tabIndex={-1} className="library-main-heading">
              서재
            </h1>
            <p className="library-motto">책을 펼치면 무대가 시작돼요</p>
          </div>

          <div className="library-header-tools">
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

      {/* 🌟 2. 원목 책장 공간 (Wooden Bookshelf Space) */}
      <section
        className={`library-bookcase ${selectedBook ? "is-receded" : ""}`}
        aria-label="서재 책장"
      >
        {/* 우측 상단 덩굴 식물 (Ivy Vine) 장식 */}
        <div className="bookshelf-ivy-decor" aria-hidden="true">
          <svg viewBox="0 0 160 180" fill="none">
            <path
              d="M160 0 C140 30, 110 50, 125 100 C135 130, 95 160, 80 180"
              stroke="#597040"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M160 10 C130 20, 135 70, 150 120"
              stroke="#68834d"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M125 45 C110 40, 105 55, 120 62 C130 65, 135 50, 125 45 Z" fill="#69854e" />
            <path d="M140 30 C150 18, 135 15, 130 25 C125 35, 135 40, 140 30 Z" fill="#7a9a5d" />
            <path d="M115 85 C95 80, 95 105, 112 108 C125 110, 130 90, 115 85 Z" fill="#587340" />
            <path d="M138 100 C152 92, 150 115, 138 120 C128 122, 128 105, 138 100 Z" fill="#749458" />
            <path d="M98 140 C80 135, 80 155, 95 160 C108 162, 112 145, 98 140 Z" fill="#637f48" />
            <path d="M80 170 C68 165, 68 180, 82 185 C90 185, 92 172, 80 170 Z" fill="#7ea060" />
          </svg>
        </div>

        {/* 책장 선반 컨테이너 (tests/browser 호환 data-capacity 유지) */}
        <div
          className="library-shelf"
          data-capacity={capacity}
        >
          {pagination.items.map((book) => {
            const isBase = book.kind === "base";
            const isMine = book.kind === "mine";
            const isShared = book.kind === "shared";
            const themeClass = isBase
              ? book.theme === "onggojib"
                ? "library-book-onggojib"
                : "library-book-rabbit"
              : "library-book-local";
            const accessibleLabel = `${book.title} · ${
              isBase ? "기본 이야기" : isMine ? "내 작품" : isShared ? "공유 작품" : "이야기"
            }`;

            return (
              <article className="library-item" key={book.id}>
                <button
                  type="button"
                  className={`shelf-book library-book ${themeClass}`}
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
                  {/* 양장본 책등(Spine) 효과 */}
                  <span className="shelf-book-spine" aria-hidden="true" />

                  {/* 책 표지면 */}
                  <div className="shelf-book-face">
                    <div className="shelf-book-header">
                      <span className="library-book-kind">
                        {isBase ? "기본 이야기" : isMine ? "내 작품" : "공유 작품"}
                      </span>
                      <span className="library-book-mark" aria-hidden="true">
                        ✦
                      </span>
                    </div>

                    {/* 책 표지 중앙 일러스트 / 표제 */}
                    <div className="shelf-book-body">
                      {isBase && (
                        <div className="shelf-art-wrapper" aria-hidden="true">
                          <img
                            src={book.coverArt}
                            alt=""
                            className="shelf-cover-image"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h2 className="library-book-title">{book.title}</h2>
                      <p className="shelf-book-subtitle">{book.subtitle}</p>
                    </div>

                    <div className="shelf-book-footer">
                      <span className="shelf-filigree" aria-hidden="true">
                        ─ ◇ ─
                      </span>
                    </div>
                  </div>
                </button>

                {/* 선반 바닥 나무 디테일 */}
                <div className="shelf-plank-edge" aria-hidden="true" />
              </article>
            );
          })}

          {/* 🌟 3. '새 작품 만들기' 특수 빈 책 (양장본 빈 도화지 책) */}
          <article className="library-item library-new-item" key="__new_story__">
            <button
              type="button"
              className="shelf-book shelf-book-new"
              onClick={() => setSelectedBook(newStoryBook)}
              disabled={props.busy}
              aria-label="새 이야기 만들기 · 새 작품 시작"
            >
              <span className="shelf-book-spine" aria-hidden="true" />
              <div className="shelf-book-face new-book-face">
                <div className="shelf-book-header">
                  <span className="shelf-new-badge">새 이야기</span>
                  <span className="library-book-mark" aria-hidden="true">
                    ✏️
                  </span>
                </div>
                <div className="shelf-book-body new-book-body">
                  <div className="new-book-plus-circle" aria-hidden="true">
                    <span>＋</span>
                  </div>
                  <h2 className="shelf-new-title">새 이야기 만들기</h2>
                  <p className="shelf-new-desc">나만의 상상을 책으로 적어보세요</p>
                </div>
                <div className="shelf-book-footer">
                  <span className="shelf-new-prompt">펼쳐서 시작하기</span>
                </div>
              </div>
            </button>
            <div className="shelf-plank-edge" aria-hidden="true" />
          </article>
        </div>

        {/* 선반 페이지네이션 (< > chevrons & dots: 책 수가 많을 때만 표시) */}
        {pagination.pages > 1 && (
          <nav className="shelf-paging-bar" aria-label="서재 페이지">
            <button
              type="button"
              className="shelf-arrow-btn prev"
              disabled={pagination.page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
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
              onClick={() => setPage((p) => Math.min(pagination.pages - 1, p + 1))}
              aria-label="다음 선반 책들 보기"
            >
              ›
            </button>
          </nav>
        )}
      </section>

      {/* 🌟 4. 책 꺼내기 Focus Stage */}
      {selectedBook && (
        <div
          className="library-focus-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeOverlay();
          }}
          role="presentation"
        >
          {/* 상단 닫기/돌아가기 버튼 */}
          <button
            type="button"
            className="btn-focus-close"
            onClick={closeOverlay}
            aria-label="돌아가기"
            title="서재로 돌아가기 (Escape)"
          >
            <span className="btn-close-glyph" aria-hidden="true">✕</span>
            <span className="btn-close-label">돌아가기</span>
          </button>

          <section
            ref={overlayRef}
            className="library-focus-stage"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
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
                  {/* 양장본 책등(Spine) 및 세로 표제 */}
                  <div className="focus-book-spine" aria-hidden="true">
                    <span className="focus-spine-title">{selectedBook.title}</span>
                  </div>

                  {/* 책 표지면 */}
                  <div className="focus-book-face">
                    <div className="focus-face-top" aria-hidden="true">
                      <span className="face-diamond">─ ◇ ─</span>
                    </div>

                    <h3 className="focus-cover-title">{selectedBook.title}</h3>

                    <div className="focus-cover-art-box">
                      {selectedBook.kind === "base" && selectedBook.coverArt && (
                        <img
                          src={selectedBook.coverArt}
                          alt=""
                          className="focus-hero-img"
                        />
                      )}
                      {selectedBook.kind === "mine" && (
                        <div className="focus-custom-crest">
                          <span className="crest-symbol">✦</span>
                          <span className="crest-sub">{selectedBook.subtitle}</span>
                        </div>
                      )}
                      {selectedBook.kind === "shared" && (
                        <div className="focus-custom-crest">
                          <span className="crest-symbol">🤝</span>
                          <span className="crest-sub">{selectedBook.subtitle}</span>
                        </div>
                      )}
                      {selectedBook.kind === "new" && (
                        <div className="focus-custom-crest">
                          <span className="crest-symbol">✏️</span>
                          <span className="crest-sub">새 도화지</span>
                        </div>
                      )}
                    </div>

                    <div className="focus-face-bottom" aria-hidden="true">
                      <span className="face-tag">놀스토리 이야기 극장</span>
                    </div>
                  </div>

                  {/* 책 우측 페이지 옆면 (양장본 두께감) */}
                  <div className="focus-book-pages" aria-hidden="true" />
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
                    className="focus-action-card is-disabled"
                    disabled
                    aria-label="원작 전체 · 준비 중"
                  >
                    <div className="action-card-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <div className="action-card-text">
                      <strong className="action-card-title">원작 읽기</strong>
                      <small className="action-card-sub">원래 이야기를 만나보아요 (준비 중)</small>
                    </div>
                  </button>

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
                      closeOverlay();
                      props.onCreation();
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
                      <small className="action-card-sub">다른 공유 작품도 둘러보아요</small>
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
                    disabled={props.busy || isFull}
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
                    disabled={props.busy || isFull}
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
                    disabled={props.busy || isFull}
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
