"use client";
/* eslint-disable @next/next/no-img-element -- Story assets are local transparent images. */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useStoryDisplaySettings } from "../hooks/useStoryDisplaySettings";
import { useStageImageLayout } from "../hooks/useStageImageLayout";
import { useSceneEffect } from "../hooks/useSceneEffect";
import type { StoryPresentation, StoryActorOverride } from "../story-presentation";
import { usePresentationTransition, type PresentationTransitionController } from "../hooks/usePresentationTransition";
import type { resolveStoryStage } from "../story-stage-view";
import { resolveAssetUrl } from "../story-asset-url";

type CharacterView = ReturnType<typeof resolveStoryStage>["left"];
type BackgroundView = ReturnType<typeof resolveStoryStage>["background"];

export function StorySceneFrame({ stage, variant, speaker, heading, children, presentation, playbackKey, navigation, transitionController }: {
  stage: ReturnType<typeof resolveStoryStage>;
  variant: "editor" | "player";
  speaker?: "left" | "right" | "narration";
  heading?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
  presentation?: StoryPresentation;
  transitionController?: PresentationTransitionController;
  playbackKey?: string | number;
}) {
  const previewTransition=usePresentationTransition(transitionController ? undefined : presentation?.transition,playbackKey);
  const transition=transitionController??previewTransition;
  const frameRef = useSceneEffect(presentation, playbackKey, transition.active);
  useEffect(()=>{
    const frame=frameRef.current;
    if(!frame || !transition.active) return;
    const layers=Array.from(frame.children).filter((node): node is HTMLElement => node instanceof HTMLElement && !node.classList.contains('presentation-transition'));
    layers.forEach(node=>{node.inert=true;});
    return ()=>layers.forEach(node=>{node.inert=false;});
  },[transition.active,frameRef]);
  return <div onKeyDownCapture={event=>{if(transition.active && event.key==='Tab'){event.preventDefault();frameRef.current?.querySelector<HTMLButtonElement>('.presentation-transition button')?.focus();}}} ref={frameRef} className="story-scene-frame" data-scene-variant={variant} data-look={presentation?.look?.type} data-look-intensity={presentation?.look?.intensity}>
    <StoryStageBackground background={stage.background} loading="eager" decorative />
    {heading && <div className="story-scene-heading">{heading}</div>}
    <StoryStageCanvas stage={stage} variant={variant} speaker={speaker} actors={presentation?.actors} />
    {presentation?.look?.type==='fractured-reality' && <div className="presentation-fracture-look" aria-hidden="true"><RealityCrack /></div>}
    {presentation?.effects?.map((effect,index)=>effect.type !== 'shake' && <div key={index} className="scene-effect-overlay" data-effect={effect.type} data-effect-index={index} aria-hidden="true">
      {(effect.type==='crack'||effect.type==='screen-crack') && <RealityCrack />}
    </div>)}
    {transition.active && <div className="presentation-transition" data-transition={presentation?.transition?.type} data-phase={transition.phase} data-mode={presentation?.transition?.mode??"auto"} style={{"--transition-duration":`${presentation?.transition?.durationMs??900}ms`} as CSSProperties} role="dialog" aria-modal="true" aria-label={presentation?.transition?.title || '장면 전환'} onClick={event=>event.stopPropagation()}>
      <small>{presentation?.transition?.cue}</small><h2>{presentation?.transition?.title}</h2><p>{presentation?.transition?.description}</p>
      {transition.phase==='waiting-confirm' && <button type="button" autoFocus onClick={transition.confirm}>{presentation?.transition?.actionLabel || '계속'}</button>}
    </div>}
    {navigation}
    {children}
  </div>;
}

export function StoryStageCanvas({ stage, variant, speaker, showBackground = true, actors }: {
  stage: ReturnType<typeof resolveStoryStage>;
  variant: "thumbnail" | "editor" | "player";
  speaker?: "left" | "right" | "narration";
  showBackground?: boolean;
  actors?: StoryPresentation["actors"];
}) {
  const settings = useStoryDisplaySettings();
  const canvasRef = useStageImageLayout(variant, JSON.stringify([stage.left, stage.right, actors, settings.characterScales, settings.dialoguePercent]));
  const loading = variant === "thumbnail" ? "lazy" : "eager";
  return <div ref={canvasRef} className="story-stage-canvas" data-stage-variant={variant} aria-label="이야기 무대">
    {showBackground && <StoryStageBackground background={stage.background} loading={loading} />}
    <StoryStageCharacter override={actors?.left} character={stage.left} side="left" variant={variant} loading={loading} listener={variant !== "thumbnail" && speaker === "right" && !stage.left.sharedActor} />
    <StoryStageCharacter override={actors?.right} character={stage.right} side="right" variant={variant} loading={loading} listener={variant !== "thumbnail" && speaker === "left" && !stage.right.sharedActor} />
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
  override?: StoryActorOverride;
  side: "left" | "right";
  variant: "thumbnail" | "editor" | "player";
  listener?: boolean;
  loading?: "lazy" | "eager";
};

/** No editing or playback state: the parent owns the selected cut. */
export function StoryStageCharacter(props: CharacterProps) {
  return <StageCharacterImage key={`${props.character.id}:${props.character.src}`} {...props} />;
}

function StageCharacterImage({ character, side, variant, listener = false, loading = "lazy", override }: CharacterProps) {
  const settings = useStoryDisplaySettings();
  const scale = (override?.scaleMultiplier??1) * character.scale * (settings.characterScales[character.scaleGroup] ?? 100) / 100;
  const [failed, setFailed] = useState(false);
  if (!character.id) return null;
  const variantClass = variant === "thumbnail" ? "scene-thumb-character"
    : variant === "editor" ? "editable-stage-character" : "stage-character";
  const classes = `story-stage-actor ${variantClass} ${side} ${character.placement} ${listener ? "listener" : ""}`;
  if (!character.src || failed) {
    return <span className={`${classes} story-stage-missing`} role="img" aria-label={`${character.label}: 이미지를 표시할 수 없어요`} data-asset-id={character.id}>이미지를 표시할 수 없어요</span>;
  }
  return <img
    data-actor-side={side}
    data-x-anchor={override?.xAnchor}
    data-spectral={override?.spectral || undefined}
    data-emphasis={override?.emphasis}
    data-shared-actor={character.sharedActor || undefined}
    data-scale-group={character.scaleGroup}
    data-stature={character.scale < 1 ? "child" : undefined}
    style={{ "--actor-scale": scale, "--actor-facing": override?.facing ? ((character.mirrored !== (override.facing !== (side === "left" ? "right" : "left"))) ? -1 : 1) : character.mirrored ? -1 : 1, opacity: override?.opacity } as CSSProperties}
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

function RealityCrack() {
  const crackLines = "M49 43 L45 32 L48 24 L38 12 L30 0 M45 32 L35 26 L22 18 M49 43 L56 32 L53 20 L66 10 L75 0 M56 32 L68 25 L82 14 M49 43 L64 42 L74 38 L88 40 L100 36 M74 38 L83 48 L100 52 M49 43 L55 56 L67 68 L71 82 L82 100 M67 68 L80 76 L94 86 M49 43 L42 55 L45 70 L34 84 L24 100 M42 55 L30 66 L15 78 M49 43 L36 45 L25 41 L14 47 L0 43 M25 41 L17 31 L0 24";
  const shardGaps = "M49 43 L45 32 L56 32 Z M49 43 L64 42 L55 56 Z M49 43 L42 55 L36 45 Z M55 56 L67 68 L71 82 L58 74 Z M42 55 L45 70 L34 84 L28 72 Z M45 32 L35 26 L48 24 Z M56 32 L68 25 L53 20 Z";
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path className="crack-gap" d={shardGaps}/><path className="crack-glow" d={crackLines}/><path className="crack-core" d={crackLines}/></svg>;
}
