import ExcelJS from 'exceljs';
import { STORY_ASSETS } from '../story-assets.ts';
import { newShortStory, parseShortStory, normalizePages, type ShortStoryProject } from './shortstory-data.ts';
export const SHORT_COLUMNS=['순서','장면 제목','글','배경','왼쪽 인물','오른쪽 인물'];
export function createShortWorkbook(project:ShortStoryProject) {
  const p=parseShortStory(project), workbook=new ExcelJS.Workbook();
  const rows:Record<string,unknown[][]>={
    '시작하기':[['숏스토리 만들기'],['이야기 정보와 장면을 고쳐 쓰고, 숏스토리 편집 화면에서 불러오세요.'],['장면은 한 줄에 한 쪽이에요. 리소스의 ID 또는 정확한 그림 이름을 사용해요.'],['파일을 불러오면 기존 작품을 덮어쓰지 않고 새 작품으로 보관해요.']],
    '이야기 정보':[['항목','내용'],['제목',p.title],['소개',p.description],['지은이',p.authorDisplayName],['표지 배경',p.cover.backgroundId],['표지 인물',p.cover.characterId],['작가의 말',p.cover.authorNote],['출처 종류',p.source?.kind??'original'],['기본 작품',p.source?.presetId??'']],
    '장면':[SHORT_COLUMNS,...p.pages.map(page=>[page.order,page.title,page.text,page.backgroundId,page.leftAssetId,page.rightAssetId])],
    '리소스':[['그림 ID','종류','그림 이름','이야기'],...STORY_ASSETS.map(a=>[a.id,a.type==='background'?'배경':'인물',a.label,a.story])],
  };
  for(const [name,data]of Object.entries(rows)){const sheet=workbook.addWorksheet(name,{views:[{state:'frozen',ySplit:1}]});data.forEach(row=>sheet.addRow(row));sheet.columns.forEach((column,i)=>{column.width=name==='장면'?(i===2?65:i===0?9:30):i===0?35:60;});sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF245D51'}};sheet.eachRow(row=>{row.alignment={vertical:'top',wrapText:true};});}
  return workbook;
}
function resolveImage(value:string,type:'background'|'character',row:string) {
  if(!value)return '';
  const matches=STORY_ASSETS.filter(a=>a.type===type&&(a.id===value||a.label===value||a.displayName===value));
  if(matches.length!==1)throw Error(`${row}: 그림 ‘${value}’를 찾지 못했거나 이름이 겹쳐요. 리소스 시트의 그림 ID를 사용해 주세요.`);
  return matches[0].id;
}
export function shortStoryFromRows(info:string[][],rows:string[][]) {
  if(info[0]?.[0]!=='항목'||info[0]?.[1]!=='내용'||SHORT_COLUMNS.some((c,i)=>rows[0]?.[i]!==c))throw Error('숏스토리 양식의 ‘이야기 정보’와 ‘장면’ 열 이름을 확인해 주세요.');
  const values=Object.fromEntries(info.slice(1).map(r=>[r[0],r[1]??''])),p=newShortStory();
  const seen=new Set<number>();
  const pages=rows.slice(1).flatMap((r,i)=>{if(!r.some(v=>v.trim()))return [];const order=Number(r[0]);if(!Number.isSafeInteger(order)||order<1||seen.has(order))throw Error(`장면 ${i+2}행: 순서는 겹치지 않는 양의 정수로 써 주세요.`);seen.add(order);return [{id:crypto.randomUUID(),order,title:r[1]??'',text:r[2]??'',backgroundId:resolveImage(r[3]??'','background',`장면 ${i+2}행 배경`),leftAssetId:resolveImage(r[4]??'','character',`장면 ${i+2}행 왼쪽 인물`),rightAssetId:resolveImage(r[5]??'','character',`장면 ${i+2}행 오른쪽 인물`)}];});
  return parseShortStory({...p,title:values['제목']??'',description:values['소개']??'',authorDisplayName:values['지은이']??'',source:{kind:values['출처 종류']||'original',...(values['기본 작품']?{presetId:values['기본 작품']}:{})},cover:{backgroundId:resolveImage(values['표지 배경']??'','background','표지 배경'),characterId:resolveImage(values['표지 인물']??'','character','표지 인물'),authorNote:values['작가의 말']??''},pages:normalizePages(pages.sort((a,b)=>a.order-b.order))});
}
export async function readShortWorkbook(buffer:ArrayBuffer) {
  if(buffer.byteLength>10*1024*1024)throw Error('Excel 파일은 10MB 이하로 열 수 있어요.');
  const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(buffer);
  const rows=(name:string)=>{const sheet=workbook.getWorksheet(name);if(!sheet)throw Error(`‘${name}’ 시트를 찾지 못했어요. 숏스토리 Excel 양식을 사용해 주세요.`);const data:string[][]=[];sheet.eachRow({includeEmpty:true},row=>{const values:string[]=[];for(let i=1;i<=Math.max(row.cellCount,name==='장면'?6:2);i++){const cell=row.getCell(i);if(cell.type===ExcelJS.ValueType.Formula)throw Error(`${name} ${row.number}행: 수식 대신 글이나 숫자를 입력해 주세요.`);values.push(cell.text);}data.push(values);});return data;};
  return shortStoryFromRows(rows('이야기 정보'),rows('장면'));
}
