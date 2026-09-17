'use client';
import {useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import type {Chapter,StoryLine} from '../story-data';
import {PRESENTATION_PRESETS,PRESENTATION_EFFECTS,PRESENTATION_LOOKS,PRESENTATION_TRANSITIONS,isStoryPresentation,presentationLabel,presentationRange,type StoryPresentation,type StoryEffectCue,type StoryActorOverride} from '../story-presentation';
import {resolveStoryStage} from '../story-stage-view';
import {ModalDialog} from './ModalDialog';
import {StorySceneFrame} from './StoryStage';
export type ApplyPresentation = (lineId:string,presentation:StoryPresentation|undefined,lookLineIds:string[])=>void;
type Props={line:StoryLine;chapter:Chapter;lines?:StoryLine[];onChange:(p:StoryPresentation|undefined)=>void;onApplyPresentation?:ApplyPresentation};
export function SceneEffectEditor(props:Props) {
 const [open,setOpen]=useState(false);
 return <><button type="button" className="scene-effect-button" aria-haspopup="dialog" onClick={e=>{e.stopPropagation();setOpen(true);}}>✨ 연출 · {presentationLabel(props.line.presentation)}</button>
 {open&&createPortal(<div onClick={e=>e.stopPropagation()}><Settings {...props} onClose={()=>setOpen(false)}/></div>,document.body)}</>;
}
function Settings({line,chapter,lines=[line],onChange,onApplyPresentation,onClose}:Props&{onClose:()=>void}) {
 const [p,setP]=useState<StoryPresentation|undefined>(()=>structuredClone(line.presentation));
 const [preview,setPreview]=useState(0);
 const [range,setRange]=useState('1');
 const [selected,setSelected]=useState<string[]>([line.id]);
 const dragging=useRef<'left'|'right'|null>(null);
 const [actorSide,setActorSide]=useState<'left'|'right'>('left');
 const patch=(change:Partial<StoryPresentation>)=>setP(current=>({...current,...change,presetOrigin:undefined}));
 const cue=(index:number,change:Partial<StoryEffectCue>)=>patch({effects:p?.effects?.map((e,i)=>i===index?{...e,...change}:e)});
 const actor=p?.actors?.[actorSide]??{};
 const patchActor=(change:Partial<StoryActorOverride>)=>patch({actors:{...p?.actors,[actorSide]:{...actor,...change}}});
 const ids=range==='selected'?selected:presentationRange(lines,line.id,Number(range));
 const valid=(!p||isStoryPresentation(p))&&(!p?.look||!!ids);
 const apply=()=>{if(onApplyPresentation) onApplyPresentation(line.id,p,p?.look?ids??[]:[]);else onChange(p);onClose();};
 return <ModalDialog overlayClassName="scene-effect-backdrop" dialogClassName="scene-effect-dialog" label={`${line.order}컷 연출`} onClose={onClose}>
 <header><div><h2>✨ 연출</h2><p>빠른 연출을 고르고 내 장면에 맞춰 보세요.</p></div><button type="button" className="scene-effect-close-btn" onClick={onClose}>닫기</button></header>
 <div className="scene-effect-choices" aria-label="빠른 연출"><button type="button" aria-pressed={!p} onClick={()=>setP(undefined)}>없음</button>{PRESENTATION_PRESETS.map(item=><button type="button" key={item.id} aria-pressed={p?.presetOrigin===item.id} onClick={()=>setP({...structuredClone(item.presentation),presetOrigin:item.id})}>{item.label}</button>)}</div>
 {p&&<div className="scene-effect-fields">
 {(p.effects?.length||p.look)&&<label>강도<select value={p.effects?.[0]?.intensity??p.look?.intensity??'normal'} onChange={e=>{const intensity=e.target.value as StoryEffectCue['intensity'];patch({effects:p.effects?.map(c=>({...c,intensity})),look:p.look?{...p.look,intensity}:undefined});}}><option value="soft">약하게</option><option value="normal">보통</option><option value="strong">강하게</option></select></label>}
 {!!p.effects?.length&&<label>시작<select value={p.effects[0].trigger??'scene-enter'} onChange={e=>patch({effects:p.effects?.map(c=>({...c,trigger:e.target.value as StoryEffectCue['trigger'],delayMs:e.target.value==='after-delay'?1000:0}))})}><option value="scene-enter">컷 시작</option><option value="with-dialogue">대사와 함께</option><option value="after-delay">잠시 뒤</option></select></label>}
 {p.look&&onApplyPresentation&&<label>분위기 적용 범위<select value={range} onChange={e=>setRange(e.target.value)}><option value="1">이 컷만</option><option value="2">이 컷부터 2컷</option><option value="3">이 컷부터 3컷</option><option value="selected">적용할 컷 직접 선택</option></select></label>}
 </div>}
 {p?.look&&!ids&&<p role="alert" className="scene-effect-branch-alert">여기서 이야기가 갈라집니다. <button type="button" className="presentation-btn-sm" onClick={()=>setRange('selected')}>적용할 컷 직접 선택</button><button type="button" className="presentation-btn-sm" onClick={()=>setRange('1')}>현재 컷까지만 적용</button></p>}
 {p?.look&&range==='selected'&&<div className="presentation-cut-selection" aria-label="분위기를 적용할 컷">{lines.map(l=><label key={l.id}><input type="checkbox" checked={selected.includes(l.id)} onChange={e=>setSelected(s=>e.target.checked?[...s,l.id]:s.filter(id=>id!==l.id))}/>{l.order}컷 · {l.text.slice(0,40)||'빈 컷'}</label>)}</div>}
 <details className="presentation-advanced"><summary>고급 설정</summary>
 <div className="presentation-section-card">
 <h4>💥 순간 효과</h4>
 {p?.effects?.map((e,i)=><div className="scene-effect-fields" key={i}>
 <label>효과 {i+1}<select value={e.type} onChange={event=>cue(i,{type:event.target.value as StoryEffectCue['type']})}>{PRESENTATION_EFFECTS.map(item=><option key={item.type} value={item.type}>{item.label}</option>)}</select></label>
 <label>강도<select value={e.intensity??'normal'} onChange={event=>cue(i,{intensity:event.target.value as StoryEffectCue['intensity']})}><option value="soft">약하게</option><option value="normal">보통</option><option value="strong">강하게</option></select></label>
 <label>지연 (초)<input type="number" min="0" max="10" step="0.1" value={Number.isFinite(e.delayMs??0) ? (e.delayMs??0)/1000 : ""} onChange={event=>cue(i,{delayMs:event.target.valueAsNumber*1000})}/></label>
 <button type="button" className="presentation-btn-sm presentation-btn-danger" onClick={()=>patch({effects:p.effects?.filter((_,n)=>n!==i)})}>효과 삭제</button>
 </div>)}
 <button type="button" className="presentation-btn-sm" disabled={(p?.effects?.length??0)>=3} onClick={()=>patch({effects:[...(p?.effects??[]),{type:'shake',intensity:'normal'}]})}>+ 효과 추가</button>
 </div>
 <div className="presentation-section-card">
 <h4>🌫 장면 분위기 및 전환</h4>
 <div className="scene-effect-fields">
 <label>장면 분위기<select value={p?.look?.type??''} onChange={e=>patch({look:e.target.value?{type:e.target.value as NonNullable<StoryPresentation['look']>['type']}:undefined})}><option value="">없음</option>{PRESENTATION_LOOKS.map(l=><option key={l.type} value={l.type}>{l.label}</option>)}</select></label>
 <label>전환<select value={p?.transition?.type??''} onChange={e=>patch({transition:e.target.value?{type:e.target.value as NonNullable<StoryPresentation['transition']>['type'],durationMs:900,mode:'auto'}:undefined})}><option value="">없음</option>{PRESENTATION_TRANSITIONS.map(t=><option key={t.type} value={t.type}>{t.label}</option>)}</select></label>
 </div>
 {p?.transition&&<div className="scene-effect-fields">
 <label>전환 진행<select value={p.transition.mode??'auto'} onChange={e=>patch({transition:{...p.transition!,mode:e.target.value as 'auto'|'confirm'}})}><option value="auto">자동으로 이어 보기</option><option value="confirm">계속 버튼으로 이어 보기</option></select></label>
 <label>전환 시간 (초)<input type="number" min="0" max="10" step="0.1" value={Number.isFinite(p.transition.durationMs??900) ? (p.transition.durationMs??900)/1000 : ""} onChange={e=>patch({transition:{...p.transition!,durationMs:e.target.valueAsNumber*1000}})}/></label>
 <label>제목<input type="text" value={p.transition.title??''} onChange={e=>patch({transition:{...p.transition!,title:e.target.value}})}/></label>
 <label>설명<input type="text" value={p.transition.description??''} onChange={e=>patch({transition:{...p.transition!,description:e.target.value}})}/></label>
 </div>}
 </div>
 <div className="presentation-section-card">
 <h4>👤 인물 연출</h4>
 <div className="scene-actor-tabs" role="tablist" aria-label="연출할 인물 선택">
   <button type="button" role="tab" aria-selected={actorSide==='left'} className={`scene-actor-tab ${actorSide==='left'?'active':''}`} onClick={()=>setActorSide('left')}>👈 왼쪽 인물</button>
   <button type="button" role="tab" aria-selected={actorSide==='right'} className={`scene-actor-tab ${actorSide==='right'?'active':''}`} onClick={()=>setActorSide('right')}>👉 오른쪽 인물</button>
 </div>
 <div className="scene-effect-fields">
 <label>좌우 위치 ({Math.round(actor.xAnchor??(actorSide==='left'?24:76))}%)<input type="range" min="0" max="100" value={actor.xAnchor??(actorSide==='left'?24:76)} onChange={e=>patchActor({xAnchor:Number(e.target.value)})}/></label>
 <label>크기<select value={actor.scaleMultiplier??1} onChange={e=>patchActor({scaleMultiplier:Number(e.target.value)})}><option value="0.8">작게</option><option value="1">보통</option><option value="1.25">크게</option>{actor.scaleMultiplier&&![.8,1,1.25].includes(actor.scaleMultiplier)&&<option value={actor.scaleMultiplier}>원본 크기</option>}</select></label>
 <label>보는 방향<select value={actor.facing??''} onChange={e=>patchActor({facing:(e.target.value||undefined) as StoryActorOverride['facing']})}><option value="">자동</option><option value="left">왼쪽</option><option value="right">오른쪽</option></select></label>
 <label>투명도 ({Math.round((actor.opacity??1)*100)}%)<input type="range" min="0.1" max="1" step="0.05" value={actor.opacity??1} onChange={e=>patchActor({opacity:Number(e.target.value)})}/></label>
 <label>강조<select value={actor.emphasis??'normal'} onChange={e=>patchActor({emphasis:e.target.value as 'normal'|'dim'})}><option value="normal">보통</option><option value="dim">어둡게</option></select></label>
 <label className="scene-effect-checkbox-label"><input type="checkbox" checked={actor.spectral??false} onChange={e=>patchActor({spectral:e.target.checked})}/><span>환영처럼 보이기</span></label>
 <button type="button" className="presentation-btn-sm" onClick={()=>patch({actors:{...p?.actors,[actorSide]:undefined}})}>인물 연출 초기화</button>
 </div>
 </div>
 </details>
 <div className="scene-effect-drag-hint">
 <span>💡 아래 미리보기에서 인물을 좌우로 직접 끌어 위치를 옮길 수 있어요.</span>
 <small>{actorSide === 'left' ? '👈 왼쪽 인물 선택 중' : '👉 오른쪽 인물 선택 중'}</small>
 </div>
 <div className="scene-effect-preview" data-selected-actor={actorSide} onPointerDown={event=>{
   const target=event.target as HTMLElement;
   const side=target.dataset.actorSide;
   if(side!=='left'&&side!=='right') return;
   dragging.current=side;setActorSide(side);event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault();
 }} onPointerMove={event=>{
   const side=dragging.current;if(!side)return;
   const bounds=event.currentTarget.querySelector('.story-stage-canvas')?.getBoundingClientRect();if(!bounds?.width)return;
   patch({actors:{...p?.actors,[side]:{...p?.actors?.[side],xAnchor:Math.max(0,Math.min(100,(event.clientX-bounds.left)/bounds.width*100))}}});
 }} onPointerUp={()=>{dragging.current=null;}} onPointerCancel={()=>{dragging.current=null;}}><StorySceneFrame key={preview} stage={resolveStoryStage(chapter,line)} variant="editor" speaker={line.speaker} presentation={p && isStoryPresentation(p) ? p : undefined} playbackKey={preview}><div className="dialogue-box"><p>{line.text||'여기에 내 이야기가 펼쳐져요.'}</p></div></StorySceneFrame></div>
 <p className="scene-effect-help">분위기는 선택한 컷마다 저장해요. 동작 줄이기에서는 흔들림과 섬광을 줄이고 분위기와 전환 안내는 유지해요.</p>
 {!valid&&ids&&<p role="alert">지연과 전환 시간은 0~10초 사이로 입력해 주세요.</p>}
 <footer><button type="button" disabled={!valid} onClick={()=>setPreview(n=>n+1)}>▶ 미리보기</button><button type="button" onClick={onClose}>취소</button><button type="button" className="primary-button" disabled={!valid} onClick={apply}>적용</button></footer>
 </ModalDialog>;
}
