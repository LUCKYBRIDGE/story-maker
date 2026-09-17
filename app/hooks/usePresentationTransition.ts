'use client';
import {useEffect, useState} from 'react';
import type {StoryTransition} from '../story-presentation';
export function usePresentationTransition(transition?: StoryTransition, playbackKey?: string|number) {
  const key=JSON.stringify([playbackKey,transition]);
  const [state,setState]=useState({key:'',phase:'idle'});
  if(state.key!==key) setState({key,phase:transition?'entering':'idle'});
  const phase=!transition ? 'idle' : state.key===key ? state.phase : 'entering';
  const active=phase!=='idle';
  useEffect(()=>{
    if(!transition || phase==='idle' || phase==='waiting-confirm') return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration=phase==='finishing'?180:transition.durationMs??900;
    const timer=setTimeout(()=>setState({key,phase:phase==='finishing' || transition.mode!=='confirm' ? 'idle' : 'waiting-confirm'}),reduced ? 100 : duration);
    return ()=>clearTimeout(timer);
  },[key,transition,phase]);
  return {active,phase,confirm:()=>{if(phase==='waiting-confirm') setState({key,phase:'finishing'});}};
}
export type PresentationTransitionController = ReturnType<typeof usePresentationTransition>;
