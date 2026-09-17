"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { newShortStory, type ShortStoryProject } from '../../shortstory/shortstory-data';
import { readShortStories, saveShortStory, removeShortStory, SHORTSTORY_KEY } from '../../shortstory/shortstory-repository';
import { decodeShortStory, MAX_SHORTSTORY_BYTES } from '../../shortstory/shortstory-file';
import { classicShortStory } from '../../shortstory/shortstory-classic-presets';
import { rabbitShortStory } from '../../shortstory/shortstory-presets';
import { ShortStoryWorkspace } from './ShortStoryWorkspace';
type Session = { project: ShortStoryProject; editing: boolean; preset: boolean };
type Library = { projects: ShortStoryProject[]; error: string; open: (project: ShortStoryProject, editing?: boolean, preset?: boolean) => void; start: () => void; preset: (theme?: 'rabbit' | 'onggojib' | 'seonnyeo') => void; importFile: (file: File) => Promise<string | null>; importProject: (project: ShortStoryProject) => void; remove: (project: ShortStoryProject) => void };
const Context = createContext<Library | null>(null);
export function useShortStories() { const value=useContext(Context); if(!value) throw Error('숏스토리 보관함 연결이 없어요.'); return value; }
export function ShortStoryProvider({children}: {children: ReactNode}) {
  const [projects,setProjects]=useState<ShortStoryProject[]>([]), [error,setError]=useState('');
  const [session,setSession]=useState<Session|null>(null);
  const expected=useRef<string|undefined>(undefined), unsaved=useRef(false);
  function refresh() { try { setProjects(readShortStories(localStorage)); if(!unsaved.current)setError(''); } catch { setError('숏스토리 보관함을 읽지 못했어요. 기존 원본은 보존했어요.'); } }
  useEffect(()=>{ let mounted=true; queueMicrotask(()=>{if(mounted)refresh();}); const listener=(e:StorageEvent)=>{if(e.key===SHORTSTORY_KEY)refresh();}; window.addEventListener('storage',listener); const leave=(e:BeforeUnloadEvent)=>{if(unsaved.current)e.preventDefault();}; window.addEventListener('beforeunload',leave); return ()=>{mounted=false;window.removeEventListener('storage',listener);window.removeEventListener('beforeunload',leave);}; },[]);
  function open(project:ShortStoryProject, editing=false, preset=false) { expected.current=preset?undefined:JSON.stringify(project);unsaved.current=false;setError('');setSession({project:structuredClone(project),editing,preset}); }
  function persist(project:ShortStoryProject) {
    try {setProjects(saveShortStory(localStorage,project,expected.current));expected.current=JSON.stringify(project);unsaved.current=false;setError('');return true;} catch(e) {unsaved.current=true;setError(`${e instanceof Error?e.message:'기기에 저장하지 못했어요.'} 현재 내용은 작업 파일로 보관해 주세요.`);return false;}
  }
  function importProject(project:ShortStoryProject) {
    if(unsaved.current&&!confirm("지금 작품을 저장하지 못했어요. 작업 파일로 보관한 뒤 새 작품을 열까요?"))return;
    const copy={...structuredClone(project),id:crypto.randomUUID(),updatedAt:new Date().toISOString()};
    expected.current=undefined;setSession({project:copy,editing:true,preset:false});persist(copy);
  }
  async function importFile(file:File) {
    try {if(file.size>MAX_SHORTSTORY_BYTES)throw Error('파일은 10MB 이하로 열 수 있어요.');const project=decodeShortStory(await file.text());importProject(project);return null;} catch(e){const message=e instanceof Error?e.message:'파일을 읽지 못했어요.';setError(message);return message;}
  }
  function remove(project:ShortStoryProject) { if(!confirm(`‘${project.title}’ 숏스토리를 이 기기에서 삭제할까요? 작업 파일이 있으면 다시 열 수 있어요.`))return;try{setProjects(removeShortStory(localStorage,project));setError('');}catch(e){setError(e instanceof Error?e.message:'삭제하지 못했어요.');} }
  return <Context.Provider value={{projects,error,open,start:()=>importProject(newShortStory()),preset:(theme='rabbit')=>open(theme==='rabbit'?rabbitShortStory():classicShortStory(theme),false,true),importFile,importProject,remove}}>
    <div hidden={!!session}>{children}</div>
    {session&&<ShortStoryWorkspace key={session.project.id} project={session.project} editing={session.editing} preset={session.preset} error={error}
      onChange={project=>{setSession({...session,project});persist(project);}}
      onEdit={()=>{if(session.preset)importProject({...session.project,title:`나의 ${session.project.title}`,authorDisplayName:''});else setSession({...session,editing:true});}}
      onRead={()=>setSession({...session,editing:false})}
      onRetry={()=>persist(session.project)}
      onClose={()=>{if(unsaved.current&&!confirm('기기에 저장하지 못한 내용이 있어요. 작업 파일을 내려받았나요? 서재로 돌아가면 저장하지 못한 내용은 사라질 수 있어요.'))return;unsaved.current=false;setSession(null);refresh();}} />}
  </Context.Provider>;
}
