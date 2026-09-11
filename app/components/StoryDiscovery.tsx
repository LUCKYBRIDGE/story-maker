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
  const [showLocalManagement, setShowLocalManagement] = useState(false);

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

  // Overlay Focus Trap & Escape key handling
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
  }, [selectedBook]);

  function closeOverlay() {
    setSelectedBook(null);
    setShowLocalManagement(false);
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

  // 표준 테스트 및 페이지네이션 대상 책 목록 (기본 + 내 작품 + 공유)
  const booksToDisplay = [...baseBooks, ...localBooks, ...sharedBooks];
  const pagination = libraryPage(booksToDisplay, page, capacity);
  const isFull = props.collection.projects.length >= MAX_EDITABLE_PROJECTS;

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
        className="library-bookcase"
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
              onClick={() =>
                setSelectedBook({
                  kind: "new",
                  id: "__new_story__",
                  title: "새 이야기 만들기",
                  subtitle: "새로운 이야기를 시작해요",
                  description: "빈 도화지에서 자유롭게 시작하거나, 준비된 전래동화의 뒷이야기를 내가 상상해 보세요.",
                  paper: "#fcf8ee",
                  ink: "#382c1e",
                  accent: "#bfa373",
                })
              }
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

      {/* 🌟 4. 책 꺼내기 인터랙션 (Detail Overlay Modal) */}
      {selectedBook && (
        <div
          className="book-detail-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeOverlay();
          }}
          role="presentation"
        >
          <section
            ref={overlayRef}
            className="book-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="btn-overlay-close"
              onClick={closeOverlay}
              aria-label="돌아가기"
              title="서재로 돌아가기 (Escape)"
            >
              ✕
            </button>

            {/* 좌측: 펼쳐진 책 비주얼 디스플레이 */}
            <div className="detail-book-col" aria-hidden="true">
              <div
                className="detail-hardcover-book"
                style={
                  {
                    "--book-paper": selectedBook.paper,
                    "--book-ink": selectedBook.ink,
                    "--book-accent": selectedBook.accent,
                  } as CSSProperties
                }
              >
                <div className="detail-book-spine" />
                <div className="detail-book-cover">
                  <span className="detail-book-filigree-top">─ ◇ ─</span>
                  <div className="detail-cover-center">
                    {selectedBook.kind === "base" && selectedBook.coverArt && (
                      <img
                        src={selectedBook.coverArt}
                        alt=""
                        className="detail-hero-illustration"
                      />
                    )}
                    {selectedBook.kind === "new" && (
                      <div className="detail-new-crest">✦</div>
                    )}
                    <h3 className="detail-cover-title">{selectedBook.title}</h3>
                    <p className="detail-cover-subtitle">{selectedBook.subtitle}</p>
                  </div>
                  <span className="detail-book-edition">놀스토리 이야기 극장</span>
                </div>
              </div>
            </div>

            {/* 우측: 책에 따른 행동 선택 패널 */}
            <div className="detail-action-col">
              <div className="detail-action-header">
                <span className="detail-kind-pill">
                  {selectedBook.kind === "base"
                    ? "놀스토리 기본 전래동화"
                    : selectedBook.kind === "mine"
                    ? "내가 만든 이야기"
                    : selectedBook.kind === "shared"
                    ? "공유받은 이야기"
                    : "새로운 창작 이야기"}
                </span>
                <h2 id={dialogTitleId} className="detail-main-title">
                  {selectedBook.title}
                </h2>
                <p className="detail-main-desc">{selectedBook.description}</p>
              </div>

              {/* 1) 기본 전래동화 선택 시 */}
              {selectedBook.kind === "base" && (
                <div className="detail-choice-block">
                  <h3 className="detail-prompt">어떤 이야기를 펼칠까요?</h3>
                  <div className="detail-btn-stack">
                    {/* 원작 전체 준비 중 (disabled) */}
                    <div className="detail-action-item">
                      <button
                        type="button"
                        className="btn-detail-disabled"
                        disabled
                        aria-label="원작 전체 · 준비 중"
                      >
                        <span className="btn-glyph" aria-hidden="true">📜</span>
                        <div className="btn-text-group">
                          <strong>원작 전체 · 준비 중</strong>
                          <small>고전 원작 전체는 준비 중이에요. 놀스토리 이야기로 읽어보세요.</small>
                        </div>
                      </button>
                    </div>

                    {/* 놀스토리 이야기 읽기 */}
                    <div className="detail-action-item">
                      <button
                        type="button"
                        className="btn-detail-primary"
                        aria-label="기본 작품 읽기"
                        onClick={() => {
                          closeOverlay();
                          props.onReadBase(selectedBook.theme);
                        }}
                        disabled={props.busy}
                      >
                        <span className="btn-glyph" aria-hidden="true">▶</span>
                        <div className="btn-text-group">
                          <strong>기본 작품 읽기</strong>
                          <small>전래동화를 재구성한 놀스토리 선택형 이야기를 감상해요.</small>
                        </div>
                      </button>
                    </div>

                    {/* 이 이야기로 만들기 (복제) */}
                    <div className="detail-action-item">
                      <button
                        type="button"
                        className="btn-detail-secondary"
                        aria-label="복제해서 만들기"
                        onClick={() => {
                          closeOverlay();
                          props.onCopyBase(selectedBook.theme);
                        }}
                        disabled={props.busy || props.failed || isFull}
                      >
                        <span className="btn-glyph" aria-hidden="true">✎</span>
                        <div className="btn-text-group">
                          <strong>복제해서 만들기</strong>
                          <small>이 이야기의 앞부분을 가져와 나만의 새로운 결말로 써보세요.</small>
                        </div>
                      </button>
                      {isFull && (
                        <p className="detail-slot-notice" role="status">
                          두 작품을 모두 사용하고 있어요. 새로 만들려면 창작 관리에서 기존 작품을 정리해 주세요.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2) 내가 만든 이야기 선택 시 */}
              {selectedBook.kind === "mine" && (
                <div className="detail-choice-block">
                  <h3 className="detail-prompt">내 이야기를 어떻게 볼까요?</h3>
                  <div className="detail-btn-stack">
                    {/* 이야기 읽기 */}
                    <button
                      type="button"
                      className="btn-detail-primary"
                      aria-label="읽기"
                      onClick={() => {
                        closeOverlay();
                        props.onReadLocal(selectedBook.id);
                      }}
                      disabled={props.busy || !selectedBook.readable}
                    >
                      <span className="btn-glyph" aria-hidden="true">▶</span>
                      <div className="btn-text-group">
                        <strong>읽기</strong>
                        <small>
                          {selectedBook.readable
                            ? "마지막으로 플레이에 적용한 버전을 펼쳐 읽어요."
                            : "편집 화면에서 글을 쓰고 플레이에 적용하면 읽을 수 있어요."}
                        </small>
                      </div>
                    </button>

                    {/* 이어서 편집 */}
                    <button
                      type="button"
                      className="btn-detail-secondary"
                      aria-label="이어만들기"
                      onClick={() => {
                        closeOverlay();
                        props.onEditLocal(selectedBook.id);
                      }}
                      disabled={props.busy}
                    >
                      <span className="btn-glyph" aria-hidden="true">✎</span>
                      <div className="btn-text-group">
                        <strong>이어만들기</strong>
                        <small>스토리 스튜디오 편집기에서 대본과 장면을 고쳐 써요.</small>
                      </div>
                    </button>

                    {/* 1차 행동 외 관리 기능: 접힘 메뉴 */}
                    <div className="detail-manage-collapsible">
                      <button
                        type="button"
                        className="btn-toggle-manage"
                        onClick={() => setShowLocalManagement((v) => !v)}
                        aria-expanded={showLocalManagement}
                      >
                        <span>··· 작품 관리</span>
                        <span aria-hidden="true">{showLocalManagement ? "▲" : "▼"}</span>
                      </button>

                      {showLocalManagement && (
                        <div className="detail-manage-box">
                          <button
                            type="button"
                            className="btn-sub-action"
                            onClick={() => {
                              props.onBackupLocal?.(selectedBook.id);
                            }}
                            disabled={props.busy}
                          >
                            💾 .nolstory 파일로 보관
                          </button>
                          <button
                            type="button"
                            className="btn-sub-action btn-sub-danger"
                            onClick={() => {
                              if (confirm(`'${selectedBook.title}' 이야기를 정말 삭제할까요?`)) {
                                closeOverlay();
                                props.onDeleteLocal?.(selectedBook.id);
                              }
                            }}
                            disabled={props.busy}
                          >
                            🗑️ 작품 삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3) 공유받은 이야기 선택 시 */}
              {selectedBook.kind === "shared" && (
                <div className="detail-choice-block">
                  <h3 className="detail-prompt">공유 작품을 어떻게 감상할까요?</h3>
                  <div className="detail-btn-stack">
                    <button
                      type="button"
                      className="btn-detail-primary"
                      aria-label="읽기"
                      onClick={() => {
                        closeOverlay();
                        props.onReadShared(selectedBook.file);
                      }}
                      disabled={props.busy}
                    >
                      <span className="btn-glyph" aria-hidden="true">▶</span>
                      <div className="btn-text-group">
                        <strong>읽기</strong>
                        <small>친구나 선생님이 공유한 이야기를 바로 감상해요.</small>
                      </div>
                    </button>

                    {selectedBook.file.sharing.allowRemix && (
                      <button
                        type="button"
                        className="btn-detail-secondary"
                        aria-label="고쳐 쓰기"
                        onClick={() => {
                          closeOverlay();
                          props.onRemixShared(selectedBook.file);
                        }}
                        disabled={props.busy || props.failed || isFull}
                      >
                        <span className="btn-glyph" aria-hidden="true">✎</span>
                        <div className="btn-text-group">
                          <strong>고쳐 쓰기</strong>
                          <small>원작자가 고쳐 쓰기를 허용했어요. 내 작품으로 가져와 수정해요.</small>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 4) '새 이야기 만들기' 선택 시 */}
              {selectedBook.kind === "new" && (
                <div className="detail-choice-block">
                  <h3 className="detail-prompt">어떤 이야기를 시작할까요?</h3>
                  <div className="detail-btn-stack">
                    {/* 빈 이야기 */}
                    <button
                      type="button"
                      className="btn-detail-primary"
                      onClick={() => {
                        closeOverlay();
                        props.onStartBlank?.();
                      }}
                      disabled={props.busy || isFull}
                    >
                      <span className="btn-glyph" aria-hidden="true">✏️</span>
                      <div className="btn-text-group">
                        <strong>빈 이야기부터 만들기</strong>
                        <small>처음부터 끝까지 나만의 대본과 무대로 새 이야기를 써요.</small>
                      </div>
                    </button>

                    {/* 토끼와 자라 이어쓰기 */}
                    <button
                      type="button"
                      className="btn-detail-secondary"
                      onClick={() => {
                        closeOverlay();
                        props.onStartRabbit?.();
                      }}
                      disabled={props.busy || isFull}
                    >
                      <span className="btn-glyph" aria-hidden="true">🐰</span>
                      <div className="btn-text-group">
                        <strong>토끼와 자라 · 이어 쓰기</strong>
                        <small>용궁에서 위기에 빠진 토끼의 다음 대사부터 이어서 써요.</small>
                      </div>
                    </button>

                    {/* 옹고집전 이어쓰기 */}
                    <button
                      type="button"
                      className="btn-detail-secondary"
                      onClick={() => {
                        closeOverlay();
                        props.onStartOnggojib?.();
                      }}
                      disabled={props.busy || isFull}
                    >
                      <span className="btn-glyph" aria-hidden="true">⚖️</span>
                      <div className="btn-text-group">
                        <strong>옹고집전 · 이어 쓰기</strong>
                        <small>처음 재판장에 끌려온 두 옹고집의 말부터 이어서 써요.</small>
                      </div>
                    </button>

                    {/* 파일/시트 관리 바로가기 */}
                    <button
                      type="button"
                      className="btn-link-advance"
                      onClick={() => {
                        closeOverlay();
                        props.onCreation();
                      }}
                    >
                      📁 파일이나 Excel·Google 시트에서 가져오기 ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
