"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { STORY_ASSETS } from '../../story-assets';
import { resolveAssetUrl } from '../../story-asset-url';
import { stageShouldMirror } from '../../story-stage-view';
import type { ShortStoryPage, ShortStoryProject } from '../../shortstory/shortstory-data';
export function ShortStoryArt({page}: {page:Pick<ShortStoryPage,'backgroundId'|'leftAssetId'|'rightAssetId'>}) {
  const [failed,setFailed]=useState(false);
  return <div className="short-art">{(['backgroundId','leftAssetId','rightAssetId'] as const).map(key=>{
    const asset=STORY_ASSETS.find(a=>a.id===page[key]);
    return asset&&<img key={key+asset.id} src={resolveAssetUrl(asset.src)} alt={asset.label} className={key} onError={()=>setFailed(true)} style={key!=='backgroundId'&&stageShouldMirror(asset.id,key==='leftAssetId'?'left':'right')?{transform:'scaleX(-1)'}:undefined}/>;
  })}{failed&&<small role="status">그림을 불러오지 못했어요. 연결 상태를 확인해 주세요.</small>}</div>;
}
export function ShortStoryReader({project}: {project:ShortStoryProject}) {
  const [index,setIndex]=useState(-1),[overview,setOverview]=useState(false);
  const page=project.pages[index];
  return <section aria-label="숏스토리 읽기">
    <div className="short-reader-tools"><button onClick={()=>setOverview(!overview)}>{overview?'책으로 읽기':'한눈에 보기'}</button><span>{project.pages.length}쪽의 이야기</span></div>
    {overview?<div className="short-grid">{project.pages.map((p,i)=><article className="short-page" key={p.id}><ShortStoryArt page={p}/><div className="short-words"><small>{i+1}쪽</small><h2>{p.title}</h2><p>{p.text}</p><button onClick={()=>{setIndex(i);setOverview(false);}}>{i+1}쪽 읽기</button></div></article>)}</div>:
    <><article className={`short-page short-book ${index<0?'short-cover':''}`} aria-live="polite">
      {index<0?<><ShortStoryArt page={{backgroundId:project.cover.backgroundId,leftAssetId:project.cover.characterId,rightAssetId:''}}/><div className="short-words"><small>SHORT STORY · 숏스토리</small><h1>{project.title}</h1><p>{project.description}</p><span>{project.authorDisplayName&&`${project.authorDisplayName} 지음`}</span></div></>:
      page?<><ShortStoryArt page={page}/><div className="short-words"><small>{index+1}쪽</small><h2>{page.title}</h2><p>{page.text||'아직 글이 없는 장면이에요.'}</p></div></>:
      <div className="short-words short-ending"><small>끝</small><h2>{project.title}</h2><p>{project.cover.authorNote||'끝까지 읽어 주셔서 고마워요.'}</p><button onClick={()=>setIndex(-1)}>처음부터 읽기</button></div>}
    </article><nav className="short-paging" aria-label="숏스토리 책 넘기기"><button disabled={index<0} onClick={()=>setIndex(index-1)}>이전</button><span>{index<0?'앞표지':page?`${index+1} / ${project.pages.length}`:'뒤표지'}</span><button disabled={index>=project.pages.length} onClick={()=>setIndex(index+1)}>{index<0?'책 펼치기':'다음'}</button></nav></>}
  </section>;
}
