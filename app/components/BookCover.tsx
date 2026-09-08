"use client";
/* eslint-disable @next/next/no-img-element -- Built-in local story artwork. */
import { useState, type CSSProperties } from "react";
import type { StoryProject } from "../story-data";
import { COVER_THEMES, coverTextPanel, coverTitleSize, resolveStoryCover } from "../story-cover";
import { ASSET_BY_ID } from "./AssetPickerButton";

function CoverImage({ id, kind }: { id: string; kind: "background" | "character" }) {
  const [failed, setFailed] = useState(false);
  const asset = ASSET_BY_ID.get(id);
  if (!asset || asset.type !== kind || failed) return null;
  return <img className={`book-art-${kind}`} src={asset.src} alt="" draggable={false} onError={() => setFailed(true)} />;
}
export function BookCover({ project, back = false }: { project: StoryProject; back?: boolean }) {
  const cover = resolveStoryCover(project);
  const theme = COVER_THEMES[cover.theme];
  const ink = cover.titleColor || theme.ink;
  return <div className="student-book" data-layout={cover.layout} data-title-position={cover.titlePosition}
    data-author-position={cover.authorPosition} data-character-position={cover.characterPosition}
    data-font={cover.font} data-back={back || undefined} style={{
      "--book-paper": theme.paper, "--book-ink": theme.ink, "--book-accent": theme.accent,
      "--book-title-ink": ink, "--book-title-panel": cover.titleColor ? coverTextPanel(ink) : theme.paper,
      "--book-title-size": `${coverTitleSize(project.title, cover.titleSize) / 3.6}cqw`, textAlign: cover.align,
    } as CSSProperties}>
    <div className="student-book-face">
      {!back && <div className="book-art" aria-hidden="true">
        <CoverImage key={`bg:${cover.backgroundId}`} id={cover.backgroundId} kind="background" />
        <CoverImage key={`actor:${cover.characterId}`} id={cover.characterId} kind="character" />
      </div>}
      <span className="student-book-edition">나의 이야기 극장</span>
      {back ? <div className="book-back-copy"><strong>{project.title || "제목을 기다리는 이야기"}</strong>
        <p>{project.description || "내가 쓴 이야기를 한 권의 책으로."}</p>
        {cover.authorNote && <><h2>작가의 말</h2><p>{cover.authorNote}</p></>}
        <span>이야기를 읽어 주셔서 고마워요.</span>
      </div> : <div className="book-title-group">
        {cover.subtitle && <p className="book-tagline">{cover.subtitle}</p>}
        <h2 className="student-book-title">{project.title || "제목을 기다리는 이야기"}</h2>
        {cover.authorPosition === "under-title" && <p className="student-book-author">{cover.author ? `${cover.author} 지음` : "나의 이야기"}</p>}
      </div>}
      {(back || cover.authorPosition === "bottom") && <p className="student-book-author book-author-bottom">{cover.author ? `${cover.author} 지음` : "나의 이야기"}</p>}
    </div>
  </div>;
}
