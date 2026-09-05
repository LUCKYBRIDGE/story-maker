"use client";

import { useState } from "react";
import { AssetPickerButton, ASSET_BY_ID } from "./AssetPickerButton";
import type { StoryAsset } from "../story-assets";

export function assetName(assetId: string) {
  return ASSET_BY_ID.get(assetId)?.displayName ?? assetId;
}

export function ResourcePool({
  title,
  type,
  ids,
  favoriteIds,
  recentIds,
  onAdd,
  onRemove,
  onToggleFavorite,
}: {
  title: string;
  type: StoryAsset["type"];
  ids: string[];
  favoriteIds: string[];
  recentIds: string[];
  onAdd: (assetId: string) => void;
  onRemove: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}) {
  return (
    <section className="resource-pool">
      <div className="resource-pool-heading">
        <strong>{title}</strong>
        <span>{ids.length}개</span>
      </div>
      <div className="resource-chip-list">
        {ids.map((id) => (
          <span className="resource-chip" key={id}>
            {assetName(id)}
            <button
              type="button"
              onClick={() => onRemove(id)}
              aria-label={`${assetName(id)} 장의 자료에서 빼기`}
            >
              ×
            </button>
          </span>
        ))}
        {ids.length === 0 && (
          <span className="empty-resource-copy">아직 고른 자료가 없어요.</span>
        )}
      </div>
      <AssetPickerButton
        type={type}
        label={title}
        buttonText={
          type === "character"
            ? "사용할 캐릭터 고르기"
            : "사용할 배경 고르기"
        }
        favoriteIds={favoriteIds}
        recentIds={recentIds}
        onSelect={onAdd}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}

export function AddSpeaker({
  onAdd,
}: {
  onAdd: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const submit = () => {
    const next = name.trim();
    if (!next) return;
    onAdd(next);
    setName("");
    setOpen(false);
  };
  return (
    <div className="add-speaker">
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? "닫기" : "+ 화자 추가"}
      </button>
      {open && (
        <div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="새 화자 이름"
            aria-label="새 화자 이름"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
          />
          <button type="button" onClick={submit} disabled={!name.trim()}>
            추가
          </button>
        </div>
      )}
    </div>
  );
}
