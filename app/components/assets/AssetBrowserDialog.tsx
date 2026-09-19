"use client";
/* eslint-disable @next/next/no-img-element -- local asset thumbnails */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AssetPickerButtonProps, AssetView } from "../AssetPickerButton";
import { ASSET_REGISTRY } from "../../assets/asset-registry";
import type { AssetBrowserConstraints, AssetQuery, NormalizedAsset } from "../../assets/asset-types";
import { FACETS, facetLabel, facetValues, filterAssets, KIND_LABELS, type FacetKey } from "../../assets/asset-query";
import { rankAssets } from "../../assets/asset-ranking";
import { STORY_CHARACTERS } from "../../assets/manifests/characters";
import { resolveAssetUrl } from "../../story-asset-url";
import { formatAssetDisplayName } from "../../story-asset-picker-utils";

type BrowseBy = "kind" | "character" | "storyPack";
export function AssetBrowserDialog({
  type, label, value = "", currentValue, defaultValue, currentLabel = "현재 선택", allowDefault = false,
  defaultLabel = "장의 기본 이미지", applyButtonText = "이 이미지 사용", chapterAssetIds = [],
  favoriteIds, recentIds, onSelect, onToggleFavorite, onClose,
}: AssetPickerButtonProps & { onClose: () => void }) {
  const [query, setQuery] = useState<AssetQuery>({});
  const [view, setView] = useState<AssetView>("all");
  const [browseBy, setBrowseBy] = useState<BrowseBy>(type === "character" ? "character" : "kind");
  const [more, setMore] = useState(false);
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const [propsOnly, setPropsOnly] = useState(false);
  const [pending, setPending] = useState(value);
  const [lastCondition, setLastCondition] = useState<{key: FacetKey; value: string} | null>(null);
  const dialog = useRef<HTMLElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    search.current?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopPropagation(); closeRef.current(); }
      if (event.key !== "Tab") return;
      const elements = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, [tabindex="0"]') ?? [])].filter(e => e.getClientRects().length > 0);
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handle);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handle); };
  }, []);
  const selected = ASSET_REGISTRY.resolve(currentValue || value);
  const preview = ASSET_REGISTRY.resolve(pending || (allowDefault ? defaultValue ?? "" : ""));
  const reference = selected ?? ASSET_REGISTRY.resolve(chapterAssetIds[0]);
  const context = useMemo(() => ({
    currentAssetId: selected?.assetId, currentCharacterIds: selected?.characterIds,
    currentStoryPackId: reference?.storyPackIds[0], currentChapterAssetIds: chapterAssetIds,
    preferredArtFamily: reference?.artFamily, favoriteIds, recentIds,
  }), [selected, reference, chapterAssetIds, favoriteIds, recentIds]);
  const constraints: AssetBrowserConstraints = useMemo(() => propsOnly ? { kinds: ["prop"] } : {
    placementRoles: [type === "character" ? "character-slot" : "background-slot"],
  }, [propsOnly, type]);
  const effectiveQuery = useMemo(() => ({ ...query, favoriteOnly: view === "favorites", recentOnly: view === "recent" }), [query, view]);
  const filtered = useMemo(() => rankAssets(filterAssets(ASSET_REGISTRY.assets, effectiveQuery, constraints, context, { includeSecondary: !primaryOnly }), context, view === "recent"), [effectiveQuery, constraints, context, primaryOnly, view]);
  const chips = FACETS.flatMap(f => (query[f.key] ?? []).map(value => ({ key: f.key, value })));
  const toggle = (key: FacetKey, value: string) => {
    const existing = query[key] ?? [];
    if (!existing.includes(value)) setLastCondition({ key, value });
    setQuery(current => ({ ...current, [key]: existing.includes(value) ? existing.filter(v => v !== value) : [...existing, value] }));
  };
  const clear = () => { setQuery({}); setView("all"); setPrimaryOnly(false); setLastCondition(null); };
  const characterHome = browseBy === "character" && type === "character" && !propsOnly && !chips.length && !query.search && view === "all";
  const characters = STORY_CHARACTERS.filter(c => filtered.some(a => a.characterIds?.includes(c.id)))
    .sort((a, b) => filtered.findIndex(asset => asset.characterIds?.includes(a.id)) - filtered.findIndex(asset => asset.characterIds?.includes(b.id)));
  const groups = useMemo(() => {
    if (view === "recent") return [{ key: "recent", label: "최근 사용", assets: filtered }];
    const grouped = new Map<string, NormalizedAsset[]>();
    for (const asset of filtered) {
      const keys = browseBy === "character" ? (asset.characterIds?.length ? asset.characterIds : ["__other"])
        : browseBy === "storyPack" ? asset.storyPackIds : [asset.kind];
      for (const key of keys) grouped.set(key, [...(grouped.get(key) ?? []), asset]);
    }
    return [...grouped].map(([key, assets]) => ({ key, label: key === "__other" ? "다른 자료" : facetLabel(browseBy === "character" ? "characterIds" : browseBy === "storyPack" ? "storyPackIds" : "kinds", key), assets }));
  }, [filtered, browseBy, view]);
  const canApply = !propsOnly && (pending ? preview?.placementRole === (type === "character" ? "character-slot" : "background-slot") : allowDefault) && pending !== value;
  const thumb = (asset: NormalizedAsset, className = "asset-picker-current-thumb") => <span className={`${className} ${asset.legacy.type}`}><img src={resolveAssetUrl(asset.src)} data-background-role={asset.legacy.backgroundRole} alt="" loading="lazy" decoding="async" /></span>;
  return createPortal(<div className="asset-picker-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialog} className="asset-picker-dialog asset-browser-v2" role="dialog" aria-modal="true" aria-label={`${label} 이미지 선택`}>
      <header><div><span className="eyebrow">이야기 그림 자료실</span><h2>{label}</h2><p>그림을 고르고 미리 본 뒤 ‘{applyButtonText}’을 눌러요.</p></div><button type="button" className="asset-picker-close" aria-label="이미지 선택 닫기" onClick={onClose}>×</button></header>
      {selected && <div className="asset-picker-current">{thumb(selected)}<span><small>{currentLabel}{selected.pickerVisibility === "hidden" ? " · 이전 이미지" : ""}</small><strong>{formatAssetDisplayName(selected.displayName)}</strong></span></div>}
      <div className="asset-picker-findbar"><input ref={search} className="asset-picker-search" type="search" value={query.search ?? ""} onChange={event => setQuery(current => ({...current, search:event.target.value}))} placeholder="흥부 일하기, 겨울 집처럼 찾아보세요" aria-label="이미지 검색" /><button type="button" className="asset-picker-filter-toggle" aria-expanded={more} onClick={() => setMore(!more)}>{more ? "더 찾기 닫기" : "더 찾기"}</button></div>
      <div className="asset-browser-tabs" aria-label="자료 탐색 방식">{([ ["kind", "종류별"], ["character", "캐릭터별"], ["storyPack", "작품별"] ] as const).map(([mode, text]) => <button key={mode} type="button" aria-pressed={browseBy === mode} onClick={() => setBrowseBy(mode)}>{text}</button>)}<button type="button" aria-pressed={propsOnly} onClick={() => { setPropsOnly(!propsOnly); setPending(value); }}>소품 둘러보기</button></div>
      <p className="asset-browser-context">{propsOnly ? "소품은 살펴볼 수 있어요. 컷에 자유롭게 놓는 기능은 아직 지원하지 않아요." : `${type === "character" ? "인물 칸" : "배경 칸"}에 넣을 수 있는 그림이에요. 현재 캐릭터·장의 자료·작품 순으로 먼저 보여줘요.`}</p>
      {!propsOnly && selected?.characterIds?.length ? <div className="asset-browser-nearby">{selected.characterIds.map(id => <button type="button" key={id} onClick={() => { setQuery(current => ({ ...current, characterIds: [id] })); setLastCondition({key:"characterIds",value:id}); }}>{facetLabel("characterIds", id)}의 다른 모습</button>)}</div> : null}
      <div className="asset-picker-browsebar"><div className="asset-picker-view" aria-label="이미지 보기">{([["all","전체"],["favorites","즐겨찾기"],["recent","최근 사용"]] as const).map(([mode,text]) => <button type="button" key={mode} aria-pressed={view === mode} className={view === mode ? "active" : ""} onClick={() => setView(mode)}>{text}</button>)}</div><div className="asset-picker-scope" aria-label="이미지 범위"><button type="button" aria-pressed={!primaryOnly} onClick={() => setPrimaryOnly(false)}>모든 이미지</button><button type="button" aria-pressed={primaryOnly} onClick={() => setPrimaryOnly(true)}>기본 추천만</button></div></div>
      <section className="asset-browser-facets" aria-label="찾는 조건 고르기">
        {FACETS.filter(f => more || f.basic).map(facet => {
          // Disjunctive counts: omit only this facet so another value stays selectable.
          const base = filterAssets(ASSET_REGISTRY.assets, {...effectiveQuery, [facet.key]: []}, constraints, context, {includeSecondary: !primaryOnly});
          const values = [...new Set([...base.flatMap(a => facetValues(a, facet.key)), ...(query[facet.key] ?? [])])];
          if (!values.length) return null;
          return <details key={facet.key} className="asset-browser-facet"><summary>{facet.label}{query[facet.key]?.length ? ` (${query[facet.key]!.length})` : ""}</summary><div role="group" aria-label={`${facet.label} 조건`}>
            {values.map(value => <button type="button" key={value} aria-pressed={(query[facet.key] as string[] | undefined)?.includes(value) ?? false} onClick={() => toggle(facet.key,value)}>{facetLabel(facet.key,value)} <small>{base.filter(a => facetValues(a,facet.key).includes(value)).length}</small></button>)}
            {!!query[facet.key]?.length && <button type="button" onClick={() => setQuery(current => ({...current,[facet.key]:[]}))}>{facet.label} 해제</button>}
          </div></details>;
        })}
      </section>
      {(chips.length > 0 || query.search || primaryOnly || view !== "all") && <div className="asset-browser-chips" aria-label="현재 찾는 조건">
        {chips.map(chip => <button key={`${chip.key}:${chip.value}`} type="button" aria-label={`${facetLabel(chip.key,chip.value)} 조건 해제`} onClick={() => toggle(chip.key,chip.value)}>{facetLabel(chip.key,chip.value)} ×</button>)}
        {query.search && <button type="button" onClick={() => setQuery(current => ({...current,search:""}))}>검색: {query.search} ×</button>}
        {primaryOnly && <button type="button" onClick={() => setPrimaryOnly(false)}>기본 추천만 ×</button>}
        {view !== "all" && <button type="button" onClick={() => setView("all")}>{view === "favorites" ? "즐겨찾기" : "최근 사용"} ×</button>}
        <button type="button" onClick={clear}>모두 지우기</button>
      </div>}
      <div className="asset-picker-result-summary" aria-live="polite"><p><strong>{filtered.length}개</strong>의 이미지를 찾았어요.</p></div>
      <div className="asset-picker-results">
        {characterHome ? <div className="asset-browser-characters" aria-label="캐릭터 고르기">{characters.map(character => {
          const asset = ASSET_REGISTRY.resolve(character.representativeAssetId)!;
          return <button type="button" key={character.id} onClick={() => toggle("characterIds", character.id)}>{thumb(asset)}<strong>{character.name}</strong><small>{facetLabel("storyPackIds",character.storyPackIds[0])} · {filtered.filter(a => a.characterIds?.includes(character.id)).length}개</small></button>;
        })}</div> : groups.map(group => <section className="asset-picker-result-group" key={group.key}><header><strong>{group.label}</strong><span>{group.assets.length}개</span></header><div className="asset-picker-grid">{group.assets.map(asset => <article key={asset.assetId} className={`asset-picker-card ${pending === asset.assetId ? "selected" : ""} ${value === asset.assetId ? "current" : ""}`}>
          <button type="button" className={`asset-picker-favorite ${favoriteIds.includes(asset.assetId) ? "active" : ""}`} aria-label={`${formatAssetDisplayName(asset.displayName)} 즐겨찾기${favoriteIds.includes(asset.assetId) ? " 해제" : ""}`} onClick={() => onToggleFavorite(asset.assetId)}>{favoriteIds.includes(asset.assetId) ? "★" : "☆"}</button>
          <button type="button" className="asset-picker-option" aria-pressed={pending === asset.assetId} onClick={() => setPending(asset.assetId)}>{thumb(asset,"asset-picker-thumb")}<strong>{formatAssetDisplayName(asset.displayName)}</strong><small>{asset.label}</small><span className="asset-tag-summary">{KIND_LABELS[asset.kind]} · {asset.legacy.story}{pending === asset.assetId ? " · 선택 미리보기" : ""}</span></button>
        </article>)}</div></section>)}
        {!filtered.length && <div className="asset-picker-empty"><strong>찾은 이미지가 없어요.</strong><small>조건 하나를 빼거나 모두 지워 보세요.</small>{lastCondition && (query[lastCondition.key] as string[] | undefined)?.includes(lastCondition.value) && <button type="button" onClick={() => toggle(lastCondition.key,lastCondition.value)}>마지막 조건 해제</button>}<button type="button" onClick={clear}>모두 지우기</button></div>}
      </div>
      <footer className="asset-browser-footer">
        {preview && <div className="asset-picker-preview" aria-live="polite">{thumb(preview)}<span><small>선택 미리보기 · {KIND_LABELS[preview.kind]}</small><strong>{formatAssetDisplayName(preview.displayName)}</strong></span></div>}
        <div className="asset-picker-actions">{allowDefault && !propsOnly && <button type="button" aria-pressed={pending === ""} onClick={() => setPending("")}>{defaultLabel}</button>}<button type="button" onClick={onClose}>취소</button><button type="button" className="primary-button" disabled={!canApply} onClick={() => { if (canApply) { onSelect(pending); onClose(); } }}>{applyButtonText}</button></div>
      </footer>
    </section>
  </div>, document.body);
}
