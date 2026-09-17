import { isStoryPresentation, PRESENTATION_EFFECTS, PRESENTATION_LOOKS, PRESENTATION_TRANSITIONS, type StoryPresentation } from './story-presentation';
export const PRESENTATION_COLUMNS = ['연출 효과','연출 강도','연출 시점','연출 지연(초)','장면 분위기','전환','연출 데이터'];
const projectionKeys = ['effect','intensity','trigger','delaySeconds','look','transition'] as const;
const labels: Record<string,string> = {'없음':'','약하게':'soft','보통':'normal','강하게':'strong','컷 시작':'scene-enter','대사와 함께':'with-dialogue','잠시 뒤':'after-delay','회상':'flashback','균열된 현실':'fractured-reality','암전':'fade-black','하얀 전환':'white-fade','시점 전환':'perspective-blackout'};
export function presentationCells(p?: StoryPresentation): string[] {
  const e=p?.effects?.[0];
  const cells=[e?.type??'',e ? e.intensity??'normal' : '',e ? e.trigger??'scene-enter' : '',e ? String((e.delayMs??0)/1000) : '',p?.look?.type??'',p?.transition?.type??''];
  return [...cells,p ? JSON.stringify({version:1,presentation:p,exportedProjection:Object.fromEntries(projectionKeys.map((k,i)=>[k,cells[i]]))}) : ''];
}
export function parsePresentationCells(cells: string[]): StoryPresentation | undefined {
  const raw=cells.slice(0,6).map(s=>s.trim());
  const values=raw.map((s,i)=>i===0 ? PRESENTATION_EFFECTS.find(e=>e.label===s)?.type??s : labels[s]??s);
  let p: StoryPresentation={}; let baseline: Record<string,string>|undefined;
  if(cells[6]?.trim()) {
    const envelope=JSON.parse(cells[6]);
    if(envelope.version!==1 || !isStoryPresentation(envelope.presentation) || !envelope.exportedProjection || !projectionKeys.every(k=>typeof envelope.exportedProjection[k]==='string')) throw new Error('연출 보존 데이터를 읽을 수 없어요. 웹에서 다시 내보낸 파일을 사용해 주세요.');
    p=structuredClone(envelope.presentation); baseline=envelope.exportedProjection;
  }
  const changed=(i:number)=>!baseline || raw[i]!==baseline[projectionKeys[i]];
  if(changed(0)) {
    if(!values[0]) delete p.effects;
    else {
      if(!PRESENTATION_EFFECTS.some(e=>e.type===values[0])) throw new Error('연출 효과 이름을 확인해 주세요.');
      const first={...p.effects?.[0],type:values[0]} as NonNullable<StoryPresentation['effects']>[number];
      p.effects=[first,...(p.effects?.slice(1)??[])];
    }
  }
  if(p.effects?.[0]) {
    const e=p.effects[0];
    if(changed(1)) e.intensity=(values[1]||'normal') as typeof e.intensity;
    if(changed(2)) e.trigger=(values[2]||'scene-enter') as typeof e.trigger;
    if(changed(3)) e.delayMs=Number(values[3]||0)*1000;
  } else if(!baseline && values.slice(1,4).some(Boolean)) throw new Error('강도와 시점을 지정하려면 연출 효과도 선택해 주세요.');
  if(changed(4)) {
    if(!values[4]) delete p.look;
    else { const look=PRESENTATION_LOOKS.find(l=>l.type===values[4]); if(!look) throw new Error('장면 분위기 이름을 확인해 주세요.'); p.look={...p.look,type:look.type}; }
  }
  if(changed(5)) {
    if(!values[5]) delete p.transition;
    else { const t=PRESENTATION_TRANSITIONS.find(t=>t.type===values[5]); if(!t) throw new Error('전환 이름을 확인해 주세요.'); p.transition={...p.transition,type:t.type}; }
  }
  if(!isStoryPresentation(p)) throw new Error('연출 강도·시점·지연 값을 확인해 주세요. 지연은 0~10초예요.');
  return Object.keys(p).length ? p : undefined;
}
