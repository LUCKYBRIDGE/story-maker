"use client";
import {useEffect, useRef, useState, type RefObject, type PointerEvent, type KeyboardEvent} from "react";

type Rect = {left:number;top:number;width:number;height:number};
export function useFloatingMemo(ref: RefObject<HTMLElement | null>) {
  const [rect,setRect]=useState<Rect | null>(null);
  const drag=useRef<{x:number;y:number;rect:Rect;resize:boolean} | null>(null);
  const fit=(r:Rect):Rect=>{
    const width=Math.max(Math.min(260,innerWidth-16),Math.min(r.width,innerWidth-16));
    const height=Math.max(Math.min(240,innerHeight-16),Math.min(r.height,innerHeight-16));
    return {width,height,left:Math.max(8,Math.min(r.left,innerWidth-width-8)),top:Math.max(8,Math.min(r.top,innerHeight-height-8))};
  };
  useEffect(()=>{const resize=()=>setRect(r=>r?fit(r):r);window.addEventListener("resize",resize);return()=>window.removeEventListener("resize",resize);},[]);
  function current(){const r=ref.current!.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};}
  function start(e:PointerEvent<HTMLButtonElement>,resize:boolean){
    e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);
    drag.current={x:e.clientX,y:e.clientY,rect:current(),resize};
  }
  function move(e:PointerEvent<HTMLButtonElement>){
    const start=drag.current;if(!start)return;
    const dx=e.clientX-start.x,dy=e.clientY-start.y;
    setRect(fit(start.resize?{...start.rect,width:start.rect.width+dx,height:start.rect.height+dy}:{...start.rect,left:start.rect.left+dx,top:start.rect.top+dy}));
  }
  function end(){drag.current=null;}
  function key(e:KeyboardEvent<HTMLButtonElement>,resize:boolean){
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key))return;
    e.preventDefault();const r=current(),step=e.shiftKey?40:10,dx=e.key==="ArrowLeft"?-step:e.key==="ArrowRight"?step:0,dy=e.key==="ArrowUp"?-step:e.key==="ArrowDown"?step:0;
    setRect(fit(resize?{...r,width:r.width+dx,height:r.height+dy}:{...r,left:r.left+dx,top:r.top+dy}));
  }
  return {style:rect?{...rect,right:"auto",bottom:"auto",maxHeight:"calc(100dvh - 16px)",maxWidth:"calc(100vw - 16px)"}:undefined,
    move:{onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>start(e,false),onPointerMove:move,onPointerUp:end,onPointerCancel:end,onKeyDown:(e:KeyboardEvent<HTMLButtonElement>)=>key(e,false)},
    resize:{onPointerDown:(e:PointerEvent<HTMLButtonElement>)=>start(e,true),onPointerMove:move,onPointerUp:end,onPointerCancel:end,onKeyDown:(e:KeyboardEvent<HTMLButtonElement>)=>key(e,true)},
    reset:()=>setRect(null)};
}
