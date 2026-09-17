import { STORY_ASSETS } from '../story-assets';
import { stageShouldMirror } from '../story-stage-view';
import { downloadFile } from '../shortstory/shortstory-file';
import type { SharePayload } from './share-payload';
// Permanent production asset address; never inherit a localhost/preview origin.
export const SHARE_ASSET_BASE = 'https://luckybridge.github.io/story-maker';
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export function createShareHtml(payload: SharePayload): string {
  const ids = new Set([payload.cover.backgroundId,payload.cover.characterId,...payload.pages.flatMap(p=>[p.backgroundId,p.leftAssetId,p.rightAssetId])].filter(Boolean));
  const assets = Object.fromEntries([...ids].map(id => {
    const asset = STORY_ASSETS.find(a=>a.id===id);
    if (!asset) throw Error(`공유할 그림을 찾지 못했어요: ${id}`);
    return [id,{src:SHARE_ASSET_BASE+asset.src,label:asset.label,mirrorLeft:stageShouldMirror(id,'left'),mirrorRight:stageShouldMirror(id,'right')}];
  }));
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>스토리메이커 · 공유 작품</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eee8db;color:#302c25;font-family:system-ui,sans-serif}main{max-width:960px;margin:auto;padding:24px}header,nav{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:space-between}button{font:inherit;min-height:44px;padding:10px 18px;border:1px solid #a69a84;border-radius:24px;background:#fffaf0;color:#302c25;cursor:pointer}button:focus-visible{outline:3px solid #25796a;outline-offset:3px}button:disabled{opacity:.45}article{background:#fffdf6;border-radius:14px;overflow:hidden;margin:20px 0;box-shadow:0 8px 30px #302c2515}.art{aspect-ratio:16/9;position:relative;background:#e3ded0;overflow:hidden}.art img{position:absolute;object-fit:contain;height:90%;width:42%;bottom:0}.art .bg{width:100%;height:100%;object-fit:cover}.left{left:4%}.right{right:4%}.words{padding:24px}h1,h2{font-family:Georgia,serif}p{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.9;font-size:20px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}.grid article{margin:0}.grid .words{padding:16px}.grid p{font-size:16px}#network{padding:12px;background:#fff1cb}small{line-height:1.7}@media(max-width:600px){main{padding:14px}.words{padding:18px}p{font-size:18px}}@media print{nav,header,#network{display:none}article{break-after:page;box-shadow:none}}
</style></head><body><main><header><strong id="brand"></strong><small>친구에게 받은 읽기 전용 작품</small></header><p id="network" hidden role="status">이 작품의 그림을 읽으려면 인터넷 연결이 필요해요. 연결 후 파일을 다시 열어 주세요.</p><noscript>이 작품은 JavaScript를 사용할 수 있는 브라우저에서 열어 주세요.</noscript><div id="book" aria-live="polite"></div><nav id="controls" aria-label="책 넘기기"></nav><p><small>이 파일은 감상용이에요. 작품은 서버에 저장하지 않아요. 다시 편집하려면 원래 작업 파일을 보관해 주세요.</small></p></main>
<script id="story-data" type="application/json">${safeJson({payload,assets})}</script>
<script>
'use strict';
const {payload:p,assets}=JSON.parse(document.getElementById('story-data').textContent);
document.title=p.title+' · 스토리메이커';document.getElementById('brand').textContent=p.kind==='shortstory'?'숏스토리':'놀스토리';
const book=document.getElementById('book'),nav=document.getElementById('controls');let index=-1,history=[],overview=false;
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function image(id,cls){if(!id||!assets[id])return null;const n=el('img',undefined,cls);n.src=assets[id].src;n.alt=assets[id].label;if(cls==='left'&&assets[id].mirrorLeft||cls==='right'&&assets[id].mirrorRight)n.style.transform='scaleX(-1)';n.addEventListener('error',()=>document.getElementById('network').hidden=false);return n;}
function art(page){const n=el('div',undefined,'art');for(const [id,cls]of [[page.backgroundId,'bg'],[page.leftAssetId,'left'],[page.rightAssetId,'right']]){const img=image(id,cls);if(img)n.append(img);}return n;}
function card(page){const a=el('article');a.append(art(page));const w=el('div',undefined,'words');if(page.title)w.append(el('h2',page.title));if(page.speakerName)w.append(el('strong',page.speakerName));w.append(el('p',page.text));a.append(w);return a;}
function button(label,fn,disabled=false){const b=el('button',label);b.type='button';b.disabled=disabled;b.addEventListener('click',fn);nav.append(b);}
function go(next){history.push(index);index=next;overview=false;render();window.scrollTo(0,0);}
function target(id){return id===null?p.pages.length:p.pages.findIndex(page=>page.id===id);}
function render(){book.replaceChildren();nav.replaceChildren();book.className=overview?'grid':'';
if(overview){p.pages.forEach((page,i)=>{const a=card(page),b=el('button',(i+1)+'쪽 읽기');b.addEventListener('click',()=>{index=i;overview=false;render();});a.append(b);book.append(a);});}
else if(index<0){book.append(card({title:p.title,text:[p.author,p.description].filter(Boolean).join('\\n'),backgroundId:p.cover.backgroundId,leftAssetId:p.cover.characterId}));}
else if(index>=p.pages.length){book.append(card({title:'이야기 끝',text:p.authorNote||'끝까지 읽어 주셔서 고마워요.'}));}
else{book.append(card(p.pages[index]));}
button('이전',()=>{index=history.pop();overview=false;render();},!history.length);
if(!overview){const page=p.pages[index];if(page?.flow?.type==='choice'){page.flow.options.forEach(o=>button(o.label,()=>go(target(o.targetLineId))));}
else if(index<p.pages.length)button(index<0?'책 펼치기':'다음',()=>go(page?.flow?.type==='goto'?target(page.flow.targetLineId):index+1));else button('처음부터',()=>{index=-1;history=[];render();});}
if(p.kind==='shortstory')button(overview?'책으로 읽기':'한눈에 보기',()=>{overview=!overview;render();});
nav.append(el('small',index<0?'앞표지':index>=p.pages.length?'뒤표지':(index+1)+' / '+p.pages.length));}
render();
</script></body></html>`;
}
export function downloadShareHtml(payload: SharePayload) { downloadFile(createShareHtml(payload),payload.title,'html','text/html;charset=utf-8'); }
