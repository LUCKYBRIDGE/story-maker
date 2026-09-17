"use client";
import { useEffect, useRef, useState } from 'react';
import { ShortStoryArt } from './ShortStoryReader';
import type { ShortStoryProject } from '../../shortstory/shortstory-data';
export function bookletOrder(length:number) { const order:number[]=[];for(let i=0;i<length/4;i++)order.push(length-1-i*2,i*2,i*2+1,length-2-i*2);return order; }
export function ShortStoryPrint({project:p,mode,onClose}:{project:ShortStoryProject;mode:'book'|'worksheet'|'booklet';onClose:()=>void}) {
  const root=useRef<HTMLElement>(null),[overflow,setOverflow]=useState(false);
  useEffect(()=>{const node=root.current;if(!node||mode!=='booklet')return;const measure=()=>setOverflow([...node.querySelectorAll<HTMLElement>('.short-print-page')].some(page=>page.scrollHeight>page.clientHeight+1));const observer=new ResizeObserver(measure);node.querySelectorAll('.short-print-page').forEach(page=>observer.observe(page));return ()=>observer.disconnect();},[mode,p]);
  const sheets=[<div className="short-print-page" key="cover"><ShortStoryArt page={{backgroundId:p.cover.backgroundId,leftAssetId:p.cover.characterId,rightAssetId:''}}/><h1>{p.title}</h1><p>{p.authorDisplayName}</p><p>{p.description}</p></div>,...p.pages.map((page,i)=><div className="short-print-page" key={page.id}><ShortStoryArt page={page}/><h2>{page.title}</h2>{mode==='worksheet'?<div className="short-writing-lines"/>:<p>{page.text}</p>}<small>{i+1}</small></div>)];
  if(mode==='booklet')while((sheets.length+1)%4)sheets.push(<div className="short-print-page" key={`blank-${sheets.length}`} aria-label="인쇄용 빈 면"/>);
  sheets.push(<div className="short-print-page" key="back"><h2>{p.title}</h2><p>{p.cover.authorNote}</p><small>끝</small></div>);
  return <section ref={root} className={`short-print-preview ${mode==='booklet'?'short-booklet':''}`} aria-label="인쇄 미리보기"><header className="short-print-controls"><h2>{mode==='worksheet'?'활동지':mode==='booklet'?'소책자':'책'} 인쇄</h2><p>{mode==='booklet'?'A4 가로 · 양면 · 짧은 쪽 넘김으로 인쇄한 뒤 가운데를 접으세요. 인쇄 창의 별도 소책자 기능은 끄세요.':'인쇄 창에서 PDF로 저장할 수도 있어요.'}</p><button disabled={overflow} onClick={()=>window.print()}>인쇄 / PDF 저장</button><button onClick={onClose}>닫기</button></header>{overflow&&<p role="alert">한 면보다 긴 글이 있어요. 글을 여러 장면으로 나누거나 일반 책 인쇄를 사용해 주세요.</p>}<div className="short-print-sheets">{mode==='booklet'?bookletOrder(sheets.length).map(i=>sheets[i]):sheets}</div>{mode==='booklet'&&<style>{'@media print { @page { size: A4 landscape; margin: 10mm; } }'}</style>}</section>;
}
