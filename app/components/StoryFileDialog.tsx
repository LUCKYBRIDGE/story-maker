"use client";
import { ModalDialog } from "./ModalDialog";
import type { NolstoryFile } from "../story-file";
export function StoryFileDialog({file, exists, error, onCancel, onImport, onRead, onRemix, remixDisabled}: {
  file: NolstoryFile; exists: boolean; error: string; onRemix: () => void; remixDisabled: boolean;
  onCancel: () => void; onImport: (replace: boolean) => void; onRead: () => void;
}) {
  const project = "draft" in file ? file.draft.project : file.story.project;
  const readable = "story" in file ? file.story.project.lines.length > 0 : !!file.playback?.project.lines.length;
  return <ModalDialog overlayClassName="blank-confirm-overlay" dialogClassName="import-dialog story-file-dialog" label="놀스토리 파일 열기" onClose={onCancel}>
    <h2>{project.title || "제목 없는 이야기"}</h2>
    <p>{"draft" in file ? "편집 백업 파일이에요. 편집본과 플레이 버전을 함께 보관해요." : "공유용 읽기 파일이에요. 편집 작품 자리를 사용하지 않아요."}</p>
    {"draft" in file && exists && <p>같은 ID의 작품이 있어요. 날짜로 자동 교체하지 않아요. 바꾸면 현재 편집본을 복구 기록에 남겨요.</p>}
    {error && <p role="alert" className="entry-error">{error}</p>}
    {"story" in file && <p>{file.sharing.allowRemix ? "고쳐 쓰기가 허용된 작품이에요. 빈 작품 자리가 필요해요." : "지은이가 고쳐 쓰기를 허용하지 않아 읽기만 할 수 있어요."}</p>}
    <div className="import-dialog-actions">
      <button className="ghost-button" onClick={onCancel}>{exists && "draft" in file ? "기기에 보관한 작품 유지" : "닫기"}</button>
      {readable && <button className="primary-button" onClick={onRead}>파일의 플레이 버전 읽기</button>}
      {"story" in file && file.sharing.allowRemix && <button className="primary-button" disabled={remixDisabled} onClick={onRemix}>새 작품으로 고쳐 쓰기</button>}
      {"draft" in file && <button className="primary-button" onClick={() => onImport(exists)}>{exists ? "파일 버전으로 교체" : "편집본으로 추가"}</button>}
    </div>
  </ModalDialog>;
}
