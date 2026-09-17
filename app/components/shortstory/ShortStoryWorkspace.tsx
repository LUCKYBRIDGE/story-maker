"use client";
import { useState } from 'react';
import type { ShortStoryProject } from '../../shortstory/shortstory-data';
import { downloadShortStory } from '../../shortstory/shortstory-file';
import { downloadShareHtml } from '../../share/share-html-export';
import { shortStoryPayload } from '../../share/share-payload';
import { ShortStoryReader } from './ShortStoryReader';
import { ShortStoryEditor } from './ShortStoryEditor';
import { ShortStoryTransfer } from './ShortStoryTransfer';
import { ShortStoryPrint } from './ShortStoryPrint';
type Props={project:ShortStoryProject;editing:boolean;preset:boolean;error:string;onChange:(p:ShortStoryProject)=>void;onEdit:()=>void;onRead:()=>void;onClose:()=>void;onRetry:()=>void};
export function ShortStoryWorkspace(p:Props) {
  const [notice,setNotice]=useState(''),[print,setPrint]=useState<'book'|'worksheet'|'booklet'|null>(null);
  function run(action:()=>void,message:string){try{action();setNotice(message);}catch(e){setNotice(e instanceof Error?e.message:'파일을 만들지 못했어요.');}}
  return <main className="short-workspace"><div className="short-screen"><header className="short-header"><button onClick={p.onClose}>← 서재로</button><div><small>SHORT STORY · 숏스토리</small><h1>{p.editing?'나의 그림책 만들기':p.project.title}</h1></div><button className="short-primary" onClick={p.editing?p.onRead:p.onEdit}>{p.editing?'책으로 읽기':p.preset?'직접 만들어 보기':'이어만들기'}</button></header>
    <div className="short-toolbar"><span role="status">{p.preset?'기본 이야기 · 자유롭게 각색해 보세요':p.error?'저장 확인 필요':'이 기기에 저장됨'}</span><button onClick={()=>run(()=>downloadShortStory(p.project),'숏스토리 작업 파일을 내려받았어요. 다른 기기에서 다시 편집할 수 있어요.')}>작업 파일로 저장</button><button onClick={()=>run(()=>downloadShareHtml(shortStoryPayload(p.project)),'읽기 전용 HTML을 내려받았어요. 그림을 보려면 인터넷 연결이 필요해요.')}>친구에게 공유 · HTML</button><details><summary>Excel·시트·인쇄</summary><ShortStoryTransfer project={p.project}/><div className="short-page-actions"><button onClick={()=>setPrint('worksheet')}>활동지 인쇄</button><button onClick={()=>setPrint('book')}>책 인쇄</button><button onClick={()=>setPrint('booklet')}>소책자 인쇄</button></div></details></div>
    {p.error&&<p className="short-error" role="alert">{p.error} <button onClick={p.onRetry}>저장 다시 시도</button></p>}{notice&&<p role="status">{notice}</p>}
    {p.editing?<ShortStoryEditor project={p.project} onChange={p.onChange}/>:<ShortStoryReader project={p.project}/>}
    <footer className="short-footer">.shortstory는 다시 만드는 작업 원본 · .html은 친구가 읽는 공유본</footer></div>
    {print&&<ShortStoryPrint project={p.project} mode={print} onClose={()=>setPrint(null)}/>}
  </main>;
}
