'use client';
import {useEffect,useRef} from 'react';
import type {StoryPresentation} from '../story-presentation';
export function useSceneEffect(presentation: StoryPresentation|undefined, playbackKey?: string|number, paused=false) {
  const frameRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const frame=frameRef.current;
    if(!frame || paused) return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let animations: Animation[]=[];
    const stop=()=>{animations.forEach(a=>a.cancel());animations=[];};
    const start=()=>{
      stop();
      (presentation?.effects??[]).slice(0,3).forEach((e,index)=>{
        const reduced=preference.matches;
        const crack=e.type==='crack'||e.type==='screen-crack';
        if(reduced && !crack && e.type!=='spotlight' && e.type!=='fade-black') return;
        const amount=e.intensity==='strong'?12:e.intensity==='soft'?4:7;
        const alpha=e.intensity==='strong'?.65:e.intensity==='soft'?.25:.4;
        const frames=e.type==='shake' ? [0,-1,.8,-.6,.4,-.2,0].map(n=>({transform:`translate3d(${n*amount}px,${Math.abs(n)*amount/3}px,0)`})) : [{opacity:0},{opacity: reduced?.22:e.type==='fade-black'?1:alpha,offset:.2},{opacity:reduced?.22:alpha,offset:.65},{opacity:0}];
        const targets=frame.querySelectorAll<HTMLElement>(e.type==='shake'?':scope > .story-stage-background, :scope > .story-stage-canvas':`:scope > [data-effect-index="${index}"]`);
        targets.forEach(t=>animations.push(t.animate(frames,{duration:reduced?1800:e.type==='shake'?600:crack?1800:800,delay:e.delayMs??(e.trigger==='after-delay'?1000:0),iterations:1,fill:'none',easing:'ease-in-out'})));
      });
    };
    start();preference.addEventListener('change',start);
    return ()=>{stop();preference.removeEventListener('change',start);};
  },[presentation,playbackKey,paused]);
  return frameRef;
}
