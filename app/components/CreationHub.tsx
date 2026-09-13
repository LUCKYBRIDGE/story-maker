"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { MAX_EDITABLE_PROJECTS, type ProjectCollection } from "../story-project-collection";
import { BookCover } from "./BookCover";
import { resolveAssetUrl } from "../story-asset-url";
import { ModalDialog } from "./ModalDialog";

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

function formatSavedDate(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${m}월 ${date}일 ${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export function CreationHub(props: Props) {
  const { collection, busy, failed, notice } = props;
  const [sheetUrl, setSheetUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const storyFileInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (busy) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.name.endsWith(".nolstory")) {
      props.onStoryFile(file);
    } else if (file.name.endsWith(".xlsx") || file.type.includes("spreadsheet") || file.type.includes("excel")) {
      props.onExcel(file);
    }
  }

  return (
    <ModalDialog
      overlayClassName="creation-hub-modal-overlay"
      dialogClassName="creation-hub-modal-dialog"
      label="창작 관리"
      onClose={props.onHome}
      initialFocusRef={heading}
    >
      <div className="creation-hub" role="region" aria-label="창작 관리">
        <header className="creation-hub-header">
        <div className="creation-hub-header-content">
          <div className="creation-hub-badge-row">
            <span className="creation-hub-badge">
              <span className="badge-icon" aria-hidden="true">📂</span>
              이 기기의 작품 보관소
            </span>
          </div>
          <h1 ref={heading} tabIndex={-1}>창작 관리</h1>
          <p className="creation-hub-desc">
            작품을 가져오고, 백업하고, 복구해요. 읽기와 이어 만들기는 서재에서 할 수 있어요.
          </p>
        </div>
        <button
          type="button"
          className="ghost-button creation-back-btn"
          onClick={props.onHome}
          disabled={busy}
        >
          서재로
        </button>
      </header>

      {notice && <p className="entry-error" role="alert">{notice}</p>}

      {failed ? (
        <section className="creation-hub-panel creation-hub-failed">
          <h2>저장된 작품을 열지 못했어요</h2>
          <p>원본은 그대로 보존했어요. 저장소를 다시 확인해 주세요.</p>
          <button type="button" onClick={props.onRetry} disabled={busy}>다시 확인</button>
        </section>
      ) : (
        <>
          <section className="creation-storage-section" aria-labelledby="creation-projects-title">
            <div className="creation-section-header">
              <div className="creation-section-title-wrap">
                <h2 id="creation-projects-title">
                  이 기기의 보관함 · {collection.projects.length}/{MAX_EDITABLE_PROJECTS}
                </h2>
                <p className="creation-section-sub">
                  이 기기 브라우저에 안전하게 보관 중인 작품이에요. 최대 {MAX_EDITABLE_PROJECTS}권까지 보관할 수 있어요.
                </p>
              </div>
              <div className="creation-slot-meter" aria-hidden="true">
                <div className="slot-indicators">
                  {Array.from({ length: MAX_EDITABLE_PROJECTS }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`slot-pip ${idx < collection.projects.length ? "filled" : "empty"}`}
                      title={idx < collection.projects.length ? "작품 보관 중" : "빈 슬롯"}
                    />
                  ))}
                </div>
                <span className="slot-meter-label">{collection.projects.length} / {MAX_EDITABLE_PROJECTS} 슬롯</span>
              </div>
            </div>

            {!collection.projects.length && (
              <div className="creation-empty-notice">
                <p>아직 보관된 작품이 없어요. 파일을 가져오거나 서재에서 새 이야기를 시작해 보세요.</p>
              </div>
            )}

            <div className="creation-projects">
              {collection.projects.map(({ draft }) => {
                const isSelected = collection.selectedProjectId === draft.project.id;
                const savedText = formatSavedDate(draft.savedAt);
                return (
                  <article
                    className={`creation-project-card ${isSelected ? "selected-project" : ""}`}
                    key={draft.project.id}
                    aria-label={draft.project.title || "제목 없는 이야기"}
                  >
                    <div className="creation-card-cover" aria-hidden="true">
                      <BookCover project={draft.project} />
                    </div>
                    <div className="creation-card-body">
                      <div className="creation-card-header">
                        {isSelected && (
                          <span className="creation-active-badge">✨ 최근 작업 중</span>
                        )}
                        <h3 className="creation-card-title">{draft.project.title || "제목 없는 이야기"}</h3>
                        <p className="creation-card-meta-text">
                          {isSelected ? "최근 선택한 작품 · " : ""}장 {draft.project.chapters.length}개 · 컷 {draft.project.lines.length}개
                        </p>
                      </div>

                      <div className="creation-card-tags">
                        <span className="card-tag">📖 장 {draft.project.chapters.length}개</span>
                        <span className="card-tag">🎬 컷 {draft.project.lines.length}개</span>
                        {savedText && (
                          <span className="card-tag card-tag-date">🕒 {savedText} 저장</span>
                        )}
                      </div>

                      <div className="creation-project-actions">
                        <button
                          type="button"
                          className="creation-btn-action"
                          onClick={() => props.onBackup(draft.project.id)}
                          disabled={busy}
                        >
                          파일로 보관
                        </button>
                        <button
                          type="button"
                          className="creation-btn-action creation-btn-manage"
                          onClick={() => props.onManage(draft.project.id)}
                          disabled={busy}
                        >
                          Excel·복구 도구
                        </button>
                        <button
                          type="button"
                          className="danger-button creation-btn-delete"
                          onClick={() => props.onDelete(draft.project.id)}
                          disabled={busy}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {collection.projects.length < MAX_EDITABLE_PROJECTS && (
                <div className="creation-empty-slot-card">
                  <div className="empty-slot-cover-wrap" aria-hidden="true">
                    <div className="empty-slot-cover">
                      <span className="empty-plus">＋</span>
                      <small>빈 슬롯</small>
                    </div>
                  </div>
                  <div className="empty-slot-body">
                    <h3>새 작품을 위한 빈 자리</h3>
                    <p>서재에서 새 이야기를 시작하거나, 아래에서 파일이나 시트를 가져오면 이 자리에 보관돼요.</p>
                    <span className="empty-slot-note">최대 {MAX_EDITABLE_PROJECTS}개 작품까지 동시 보관</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="creation-hub-panel creation-import-section" aria-labelledby="creation-import-title">
            <div className="creation-import-header">
              <h2 id="creation-import-title">파일·시트 가져오기</h2>
              <p className="creation-import-desc">
                Excel 파일은 새 작품으로 추가해요. 같은 Google 시트는 확인 후 편집본을 바꿀 수 있어요.
              </p>
            </div>

            <div className="creation-import-grid">
              {/* File Import Card with Drag & Drop */}
              <div
                className={`creation-import-box creation-file-box ${isDragOver ? "dragover" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="import-box-header">
                  <span className="import-box-icon" aria-hidden="true">📁</span>
                  <div>
                    <h3 className="import-box-title">파일로 가져오기</h3>
                    <p className="import-box-sub">.nolstory 백업 파일이나 Excel 스프레드시트 대본을 불러옵니다.</p>
                  </div>
                </div>

                <div className="creation-drop-zone-indicator" aria-hidden="true">
                  <span className="drop-icon">☁️</span>
                  <span className="drop-text">
                    {isDragOver ? "여기에 파일을 놓으세요!" : "파일을 끌어다 놓거나 아래 버튼으로 열기"}
                  </span>
                </div>

                <div className="creation-file-actions">
                  <button
                    type="button"
                    className="creation-file-btn"
                    onClick={() => storyFileInput.current?.click()}
                    disabled={busy}
                  >
                    .nolstory 파일 열기
                  </button>
                  <input
                    ref={storyFileInput}
                    hidden
                    type="file"
                    accept=".nolstory"
                    onChange={event => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (file) props.onStoryFile(file);
                    }}
                  />

                  <button
                    type="button"
                    className="creation-file-btn"
                    onClick={() => fileInput.current?.click()}
                    disabled={busy}
                  >
                    Excel 파일 열기
                  </button>
                  <input
                    ref={fileInput}
                    hidden
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={event => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      if (file) props.onExcel(file);
                    }}
                  />
                </div>

                <div className="creation-template-row">
                  <a
                    href={resolveAssetUrl("/templates/놀퀴즈_스토리_템플릿.xlsx")}
                    download
                    className="creation-template-link"
                    title="공식 놀스토리 Excel 양식 다운로드"
                  >
                    <span aria-hidden="true">📥 </span>빈 Excel 양식 받기
                  </a>
                  <span className="creation-template-tip">스프레드시트로 대본을 미리 작성할 때 사용하세요.</span>
                </div>
              </div>

              {/* Google Sheet Card */}
              <div className="creation-import-box creation-sheet-box">
                <div className="import-box-header">
                  <span className="import-box-icon" aria-hidden="true">🌐</span>
                  <div>
                    <h3 className="import-box-title">Google 시트 연동</h3>
                    <p className="import-box-sub">웹에 공개된 Google 스프레드시트 주소를 입력하여 바로 불러옵니다.</p>
                  </div>
                </div>

                <div className="creation-sheet-tip">
                  <span className="tip-badge">💡 시트 공유 설정 팁</span>
                  <p>
                    Google 시트 우측 상단 <strong>[공유]</strong>에서 일반 액세스를 <strong>&apos;링크가 있는 모든 사용자&apos;</strong>(뷰어)로 설정해야 원활히 불러올 수 있어요.
                  </p>
                </div>

                <div className="creation-sheet-field">
                  <label htmlFor="creation-sheet-url" className="field-label">
                    공개 Google 시트 주소
                  </label>
                  <div className="sheet-input-group">
                    <input
                      id="creation-sheet-url"
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetUrl}
                      onChange={event => setSheetUrl(event.target.value)}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="creation-sheet-btn"
                      onClick={() => props.onSheet(sheetUrl.trim())}
                      disabled={busy || !sheetUrl.trim()}
                    >
                      시트에서 이어만들기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      </div>
    </ModalDialog>
  );
}
