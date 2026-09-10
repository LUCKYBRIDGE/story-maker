"use client";
/* eslint-disable @next/next/no-img-element -- Story assets are local transparent images. */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useSceneEffect } from "../hooks/useSceneEffect";
import type { StorySceneEffect } from "../story-scene-effect";
import type { resolveStoryStage } from "../story-stage-view";
import { resolveAssetUrl } from "../story-asset-url";

type CharacterView = ReturnType<typeof resolveStoryStage>["left"];
type BackgroundView = ReturnType<typeof resolveStoryStage>["background"];

export function StorySceneFrame({ stage, variant, speaker, heading, children, effect, playbackKey, navigation }: {
  stage: ReturnType<typeof resolveStoryStage>;
  variant: "editor" | "player";
  speaker?: "left" | "right" | "narration";
  heading?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
  effect?: StorySceneEffect;
  playbackKey?: string | number;
}) {
  const frameRef = useSceneEffect(effect, playbackKey);
  return <div ref={frameRef} className="story-scene-frame" data-scene-variant={variant}>
    <StoryStageBackground background={stage.background} loading="eager" />
    {heading && <div className="story-scene-heading">{heading}</div>}
    <StoryStageCanvas stage={stage} variant={variant} speaker={speaker} showBackground={false} />
    {effect && effect.type !== "shake" && <div className="scene-effect-overlay" data-effect={effect.type} aria-hidden="true">
      {effect.type === "crack" && <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M48 42 L30 0 M48 42 L80 0 M48 42 L100 35 M48 42 L85 100 M48 42 L20 100 M48 42 L0 48 M30 0 L35 24 L48 42 L62 64 L85 100 M62 64 L100 68 M35 24 L12 16" /></svg>}
    </div>}
    {navigation}
    {children}
  </div>;
}

export function StoryStageCanvas({ stage, variant, speaker, showBackground = true }: {
  stage: ReturnType<typeof resolveStoryStage>;
  variant: "thumbnail" | "editor" | "player";
  speaker?: "left" | "right" | "narration";
  showBackground?: boolean;
}) {
  const loading = variant === "thumbnail" ? "lazy" : "eager";
  return <div className="story-stage-canvas" data-stage-variant={variant} aria-label="이야기 무대">
    {showBackground && <StoryStageBackground background={stage.background} loading={loading} />}
    <StoryStageCharacter character={stage.left} side="left" variant={variant} loading={loading} listener={variant !== "thumbnail" && speaker === "right"} />
    <StoryStageCharacter character={stage.right} side="right" variant={variant} loading={loading} listener={variant !== "thumbnail" && speaker === "left"} />
  </div>;
}

export function StoryStageBackground({ background, loading = "lazy" }: { background: BackgroundView; loading?: "lazy" | "eager" }) {
  return <StageBackgroundImage key={`${background.id}:${background.src}`} background={background} loading={loading} />;
}

function StageBackgroundImage({ background, loading }: { background: BackgroundView; loading: "lazy" | "eager" }) {
  const [failed, setFailed] = useState(false);
  if (!background.id) return null;
  return <div className="story-stage-background" data-asset-id={background.id}>
    {background.src && !failed ? <img src={resolveAssetUrl(background.src)} alt="" draggable={false} decoding="async" loading={loading} onError={() => setFailed(true)} />
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
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = imageRef.current;
    if (!image || character.scale === 1) return;
    const anchorFeet = () => {
      if (!image.naturalWidth) return;
      const renderedHeight = Math.min(image.clientHeight, image.clientWidth * image.naturalHeight / image.naturalWidth);
      // object-fit: contain + bottom alignment: pin the 800×1200 canvas foot line, not its transparent padding.
      image.style.transformOrigin = `50% ${image.clientHeight - renderedHeight * (51 / 1200)}px`;
    };
    anchorFeet();
    image.addEventListener("load", anchorFeet);
    const observer = new ResizeObserver(anchorFeet);
    observer.observe(image);
    return () => { image.removeEventListener("load", anchorFeet); observer.disconnect(); };
  }, [character.scale]);
  if (!character.id) return null;
  const variantClass = variant === "thumbnail" ? "scene-thumb-character"
    : variant === "editor" ? "editable-stage-character" : "stage-character";
  const classes = `story-stage-actor ${variantClass} ${side} ${character.placement} ${listener ? "listener" : ""}`;
  if (!character.src || failed) {
    return <span className={`${classes} story-stage-missing`} role="img" aria-label={`${character.label}: 이미지를 표시할 수 없어요`} data-asset-id={character.id}>이미지를 표시할 수 없어요</span>;
  }
  return <img
    ref={imageRef}
    data-stature={character.scale < 1 ? "child" : undefined}
    style={{ "--actor-scale": character.scale, "--actor-facing": character.mirrored ? -1 : 1 } as CSSProperties}
    className={`${classes} ${character.mirrored ? "mirrored" : ""}`}
    data-asset-id={character.id}
    src={resolveAssetUrl(character.src)}
    alt={variant === "thumbnail" ? "" : character.label}
    draggable={false}
    loading={loading}
    decoding="async"
    onError={() => setFailed(true)}
  />;
}
