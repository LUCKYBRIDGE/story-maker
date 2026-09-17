"use client";
import type { StoryTheme } from '../story-discovery';
export function ClassicReadingLibraryEntry({theme,title}:{theme:StoryTheme;title:string}) {
  const basePath=process.env.NEXT_PUBLIC_BASE_PATH??'';
  const href=basePath?`${basePath}/classic/${theme}.html`:`/classic/${theme}`;
  return <button type="button" className="focus-action-card" data-classic-reading-card="classic-reading" data-classic-reading-slug={theme} aria-label={`${title} 원작 읽기`} onClick={()=>window.location.assign(href)}><div className="action-card-icon" aria-hidden="true">▤</div><div className="action-card-text"><strong className="action-card-title">원작 읽기</strong><small className="action-card-sub">전래 이야기의 대표 줄거리를 읽어요</small></div></button>;
}
