import { shortStoryFromRows } from './shortstory-workbook';
export function parseShortCsv(text:string) {
  const rows:string[][]=[];let row:string[]=[],cell='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw Error('시트의 따옴표를 확인해 주세요.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
export async function fetchShortSheet(input:string) {
  let url:URL;try{url=new URL(input);}catch{throw Error('공개 Google 시트 주소를 입력해 주세요.');}
  const id=url.pathname.match(/^\/spreadsheets\/d\/([\w-]+)/)?.[1];
  if(url.protocol!=='https:'||url.hostname!=='docs.google.com'||!id)throw Error('공개 Google 시트 주소를 입력해 주세요.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{const rows=await Promise.all(['이야기 정보','장면'].map(async name=>{const response=await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`,{signal:controller.signal,credentials:'omit'});if(!response.ok)throw Error(`‘${name}’ 시트를 읽지 못했어요. 공개 권한과 탭 이름을 확인해 주세요.`);const text=await response.text();if(text.length>10*1024*1024||/^\s*</.test(text))throw Error('공개 시트를 읽지 못했어요. Excel로 내려받아 불러올 수도 있어요.');return parseShortCsv(text);}));return shortStoryFromRows(rows[0],rows[1]);}finally{clearTimeout(timer);}
}
