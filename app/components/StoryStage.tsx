"use client";
/* eslint-disable @next/next/no-img-element -- Story assets are local transparent images. */

import { useState } from "react";
import type { resolveStoryStage } from "../story-stage-view";

type CharacterView = ReturnType<typeof resolveStoryStage>["left"];
type BackgroundView = ReturnType<typeof resolveStoryStage>["background"];

export function StoryStageCanvas({ stage, variant, speaker }: {
  stage: ReturnType<typeof resolveStoryStage>;
  variant: "thumbnail" | "editor" | "player";
  speaker?: "left" | "right" | "narration";
}) {
  const loading = variant === "thumbnail" ? "lazy" : "eager";
  return <div className="story-stage-canvas" data-stage-variant={variant} aria-label="이야기 무대">
    <StoryStageBackground background={stage.background} loading={loading} />
    <StoryStageCharacter character={stage.left} side="left" variant={variant} loading={loading} listener={variant === "player" && speaker === "right"} />
    <StoryStageCharacter character={stage.right} side="right" variant={variant} loading={loading} listener={variant === "player" && speaker === "left"} />
  </div>;
}

export function StoryStageBackground({ background, loading = "lazy" }: { background: BackgroundView; loading?: "lazy" | "eager" }) {
  return <StageBackgroundImage key={`${background.id}:${background.src}`} background={background} loading={loading} />;
}

function StageBackgroundImage({ background, loading }: { background: BackgroundView; loading: "lazy" | "eager" }) {
  const [failed, setFailed] = useState(false);
  if (!background.id) return null;
  return <div className="story-stage-background" data-asset-id={background.id}>
    {background.src && !failed ? <img src={background.src} alt="" draggable={false} decoding="async" loading={loading} onError={() => setFailed(true)} />
      : <span className="story-stage-background-error" role="img" aria-label="배경을 표시할 수 없어요">배경을 표시할 수 없어요</span>}
  </div>;
}

type CharacterProps = {
  character: CharacterView;
  side: "left" | "right";
  variant: "thumbnail" | "editor" | "player";
  listener?: boolean;
  loading?: "lazy" | "eager";
};

/** No editing or playback state: the parent owns the selected cut. */
export function StoryStageCharacter(props: CharacterProps) {
  return <StageCharacterImage key={`${props.character.id}:${props.character.src}`} {...props} />;
}

function StageCharacterImage({ character, side, variant, listener = false, loading = "lazy" }: CharacterProps) {
  const [failed, setFailed] = useState(false);
  if (!character.id) return null;
  const variantClass = variant === "thumbnail" ? "scene-thumb-character"
    : variant === "editor" ? "editable-stage-character" : "stage-character";
  const classes = `story-stage-actor ${variantClass} ${side} ${character.placement} ${listener ? "listener" : ""}`;
  if (!character.src || failed) {
    return <span className={`${classes} story-stage-missing`} role="img" aria-label={`${character.label}: 이미지를 표시할 수 없어요`} data-asset-id={character.id}>이미지를 표시할 수 없어요</span>;
  }
  return <img
    className={`${classes} ${character.mirrored ? "mirrored" : ""}`}
    data-asset-id={character.id}
    src={character.src}
    alt={variant === "thumbnail" ? "" : character.label}
    draggable={false}
    loading={loading}
    decoding="async"
    onError={() => setFailed(true)}
  />;
}
