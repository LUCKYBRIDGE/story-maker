"use client";
import { STORY_ASSETS } from '../../story-assets';
import { newPage, normalizePages, type ShortStoryPage, type ShortStoryProject } from '../../shortstory/shortstory-data';
import { ShortStoryArt } from './ShortStoryReader';
export function AssetSelect({label,type,value,onChange}:{label:string;type:'background'|'character';value:string;onChange:(value:string)=>void}) {
  return <label>{label}<select value={value} onChange={e=>onChange(e.target.value)}><option value="">그림 없음</option>{STORY_ASSETS.filter(a=>a.type===type).map(a=><option key={a.id} value={a.id}>{a.story} · {a.label}</option>)}</select></label>;
}
export function ShortStoryEditor({project,onChange}:{project:ShortStoryProject;onChange:(p:ShortStoryProject)=>void}) {
  const update=(patch:Partial<ShortStoryProject>)=>onChange({...project,...patch,updatedAt:new Date().toISOString()});
  const pages=(next:ShortStoryPage[])=>update({pages:normalizePages(next)});
  const page=(id:string,patch:Partial<ShortStoryPage>)=>pages(project.pages.map(p=>p.id===id?{...p,...patch}:p));
  const move=(i:number,direction:number)=>{const next=[...project.pages];[next[i],next[i+direction]]=[next[i+direction],next[i]];pages(next);};
  return <>
    <section className="short-info" aria-label="이야기 정보"><label>책 제목<input value={project.title} onChange={e=>update({title:e.target.value})}/></label><label>지은이<input value={project.authorDisplayName} onChange={e=>update({authorDisplayName:e.target.value})}/></label><label>한 줄 소개<input value={project.description} onChange={e=>update({description:e.target.value})}/></label>
      <details><summary>앞표지와 뒤표지 꾸미기</summary><AssetSelect label="표지 배경" type="background" value={project.cover.backgroundId} onChange={backgroundId=>update({cover:{...project.cover,backgroundId}})}/><AssetSelect label="표지 인물" type="character" value={project.cover.characterId} onChange={characterId=>update({cover:{...project.cover,characterId}})}/><label>작가의 말<textarea aria-label="작가의 말" value={project.cover.authorNote} onChange={e=>update({cover:{...project.cover,authorNote:e.target.value}})}/></label></details>
    </section>
    <div className="short-section-heading"><h2>장면을 모아 한 권의 책으로</h2><span>{project.pages.length}쪽 · 순서대로 읽어요</span></div>
    <div className="short-grid short-editor-grid">{project.pages.map((p,i)=><article className="short-page" key={p.id} aria-label={`${i+1}쪽 편집`}><ShortStoryArt page={p}/><div className="short-words"><small>장면 {i+1}</small><label>장면 제목<input value={p.title} onChange={e=>page(p.id,{title:e.target.value})}/></label><label>글<textarea aria-label="글" rows={6} placeholder="이 장면에서는 어떤 일이 일어나나요?" value={p.text} onChange={e=>page(p.id,{text:e.target.value})}/></label><details><summary>그림 바꾸기</summary><AssetSelect label="배경" type="background" value={p.backgroundId} onChange={backgroundId=>page(p.id,{backgroundId})}/><AssetSelect label="왼쪽 인물" type="character" value={p.leftAssetId} onChange={leftAssetId=>page(p.id,{leftAssetId})}/><AssetSelect label="오른쪽 인물" type="character" value={p.rightAssetId} onChange={rightAssetId=>page(p.id,{rightAssetId})}/></details>
      <div className="short-page-actions"><button aria-label={`${i+1}쪽 앞으로`} disabled={i===0} onClick={()=>move(i,-1)}>←</button><button aria-label={`${i+1}쪽 뒤로`} disabled={i===project.pages.length-1} onClick={()=>move(i,1)}>→</button><button onClick={()=>pages([...project.pages.slice(0,i+1),{...p,id:crypto.randomUUID()},...project.pages.slice(i+1)])}>복제</button><button disabled={project.pages.length===1} onClick={()=>{if(confirm(`${i+1}쪽을 삭제할까요?`))pages(project.pages.filter(x=>x.id!==p.id));}}>삭제</button></div>
    </div></article>)}<button className="short-add" onClick={()=>pages([...project.pages,newPage()])}><span>＋</span>장면 추가</button></div>
  </>;
}
