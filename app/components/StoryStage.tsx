"use client";
/* eslint-disable @next/next/no-img-element -- Story assets are local transparent images. */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useStoryDisplaySettings } from "../hooks/useStoryDisplaySettings";
import { useStageImageLayout } from "../hooks/useStageImageLayout";
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
    <StoryStageBackground background={stage.background} loading="eager" decorative />
    {heading && <div className="story-scene-heading">{heading}</div>}
    <StoryStageCanvas stage={stage} variant={variant} speaker={speaker} />
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
  const settings = useStoryDisplaySettings();
  const canvasRef = useStageImageLayout(variant, JSON.stringify([stage.left, stage.right, settings.characterScales]));
  const loading = variant === "thumbnail" ? "lazy" : "eager";
  return <div ref={canvasRef} className="story-stage-canvas" data-stage-variant={variant} aria-label="이야기 무대">
    {showBackground && <StoryStageBackground background={stage.background} loading={loading} />}
    <StoryStageCharacter character={stage.left} side="left" variant={variant} loading={loading} listener={variant !== "thumbnail" && speaker === "right"} />
    <StoryStageCharacter character={stage.right} side="right" variant={variant} loading={loading} listener={variant !== "thumbnail" && speaker === "left"} />
  </div>;
}

export function StoryStageBackground({ background, loading = "lazy", decorative = false }: { background: BackgroundView; loading?: "lazy" | "eager"; decorative?: boolean }) {
  return <StageBackgroundImage key={`${background.id}:${background.src}`} background={background} loading={loading} decorative={decorative} />;
}

function StageBackgroundImage({ background, loading, decorative }: { background: BackgroundView; loading: "lazy" | "eager"; decorative: boolean }) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = imageRef.current;
    const container = image?.parentElement;
    if (!image || !container || decorative) return;
    const fit = () => {
      if (!image.naturalWidth || !container.clientHeight) return;
      const ratio = (container.clientWidth / container.clientHeight) / (image.naturalWidth / image.naturalHeight);
      const retainedArea = Math.min(ratio, 1 / ratio);
      container.dataset.fit = background.meaningful || retainedArea < .6 ? "contain" : "cover";
    };
    fit();
    image.addEventListener("load", fit);
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => { image.removeEventListener("load", fit); observer.disconnect(); };
  }, [background.meaningful, decorative]);
  if (!background.id) return null;
  return <div className={`story-stage-background${decorative ? " story-stage-backdrop" : ""}`} data-asset-id={background.id}
    data-fit={background.meaningful && !decorative ? "contain" : undefined}
    style={background.src && !failed ? { "--scene-image": `url("${resolveAssetUrl(background.src)}")` } as CSSProperties : undefined}>
    {background.src && !failed ? <img ref={imageRef} src={resolveAssetUrl(background.src)} alt="" draggable={false} decoding="async" loading={loading} onError={() => setFailed(true)} />
      : !decorative && <span className="story-stage-background-error" role="img" aria-label="배경을 표시할 수 없어요">배경을 표시할 수 없어요</span>}
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
  const settings = useStoryDisplaySettings();
  const scale = character.scale * (settings.characterScales[character.scaleGroup] ?? 100) / 100;
  const [failed, setFailed] = useState(false);
  if (!character.id) return null;
  const variantClass = variant === "thumbnail" ? "scene-thumb-character"
    : variant === "editor" ? "editable-stage-character" : "stage-character";
  const classes = `story-stage-actor ${variantClass} ${side} ${character.placement} ${listener ? "listener" : ""}`;
  if (!character.src || failed) {
    return <span className={`${classes} story-stage-missing`} role="img" aria-label={`${character.label}: 이미지를 표시할 수 없어요`} data-asset-id={character.id}>이미지를 표시할 수 없어요</span>;
  }
  return <img
    data-scale-group={character.scaleGroup}
    data-stature={character.scale < 1 ? "child" : undefined}
    style={{ "--actor-scale": scale, "--actor-facing": character.mirrored ? -1 : 1 } as CSSProperties}
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
