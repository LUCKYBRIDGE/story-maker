import { PRESENTATION_PRESETS, type StoryPresentation, type StoryActorOverride } from './story-presentation';
type PinkyBeat = {visualMode?: string; transition?: string; perspectiveCue?: string; perspectiveTitle?: string; perspectiveDescription?: string; perspectiveActionLabel?: string; characters?: {side?: string; stageX?: number|null; scale?: number; facing?: string; active?: boolean; spectral?: boolean}[]};
/** Import boundary only. Runtime never needs to know the source of these cues. */
export function adaptPinkyPresentation(beat: PinkyBeat): StoryPresentation | undefined {
  let p: StoryPresentation={};
  if(beat.visualMode==='flashback') p.look={type:'flashback'};
  if(beat.transition==='reality-crack') p=structuredClone(PRESENTATION_PRESETS.find(p=>p.id==='reality-crack')!.presentation);
  if(beat.transition==='reality-fractured') p.look={type:'fractured-reality'};
  if(beat.transition==='perspective-blackout') p.transition={type:'perspective-blackout',durationMs:900,mode:'confirm',cue:beat.perspectiveCue??'시점 전환',title:beat.perspectiveTitle,description:beat.perspectiveDescription,actionLabel:beat.perspectiveActionLabel};
  for(const c of beat.characters??[]) {
    if(c.side!=='left' && c.side!=='right') continue;
    const a: StoryActorOverride={};
    if(c.stageX!=null && Number.isFinite(c.stageX)) a.xAnchor=Math.max(0,Math.min(100,c.stageX));
    if(c.scale && c.scale!==1) a.scaleMultiplier=Math.max(.8,Math.min(1.25,c.scale));
    if(c.facing==='left' || c.facing==='right') a.facing=c.facing;
    if(c.spectral) a.spectral=true;
    if(c.active===false) a.emphasis='dim';
    if(Object.keys(a).length) p.actors={...p.actors,[c.side]:a};
  }
  return Object.keys(p).length ? p : undefined;
}
