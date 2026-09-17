"use client";
import { useState } from 'react';
import type { ShortStoryProject } from '../../shortstory/shortstory-data';
import { downloadFile } from '../../shortstory/shortstory-file';
import { useShortStories } from './ShortStoryProvider';
export function ShortStoryTransfer({project}:{project:ShortStoryProject}) {
  const library=useShortStories(),[url,setUrl]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  async function run(action:()=>Promise<void>){setBusy(true);setNotice('');try{await action();}catch(e){setNotice(e instanceof Error?e.message:'불러오지 못했어요. 기존 작품은 그대로 있어요.');}finally{setBusy(false);}}
  return <div className="short-transfer"><p>숏스토리 전용 양식이에요. 불러온 내용은 새 작품으로 보관해요.</p><button disabled={busy} onClick={()=>void run(async()=>{const {createShortWorkbook}=await import('../../shortstory/shortstory-workbook');const bytes=await createShortWorkbook(project).xlsx.writeBuffer();downloadFile(new Uint8Array(bytes),project.title,'xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');})}>Excel로 저장</button><label>숏스토리 Excel 열기<input disabled={busy} type="file" accept=".xlsx" onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value='';if(f)void run(async()=>{if(f.size>10*1024*1024)throw Error('파일은 10MB 이하로 열 수 있어요.');const {readShortWorkbook}=await import('../../shortstory/shortstory-workbook');library.importProject(await readShortWorkbook(await f.arrayBuffer()));});}}/></label><label>공개 Google 시트 주소<input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/…"/></label><button disabled={busy||!url.trim()} onClick={()=>void run(async()=>{const {fetchShortSheet}=await import('../../shortstory/shortstory-sheet');library.importProject(await fetchShortSheet(url));})}>시트에서 한 번 가져오기</button>{busy&&<p role="status">파일을 준비하고 있어요…</p>}{notice&&<p role="alert">{notice}</p>}</div>;
}
