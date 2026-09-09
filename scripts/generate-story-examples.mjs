// Run with Node's TS loader as documented in the example-source decision.
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {DEFAULT_PROJECT,cloneProject} from '../app/story-data.ts';
import {STORY_ASSETS} from '../app/story-assets.ts';
const root=process.env.STORY_SOURCE_ROOT || '/Volumes/WAN2/apps/pinky-ne-site-publish';
const {stories}=await import(pathToFileURL(`${root}/worker/story-data/stories.js`));
const commit=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const missing=new Set();
const assetId=path=>{if(!path)return '';const normalized=path.replace(/^\.\//,'games/ifstory/');const asset=STORY_ASSETS.find(asset=>asset.sourcePath===normalized);if(!asset)missing.add(path);return asset?.id??'';};
const projects=stories.slice(0,2).map(story=>{
 const project=cloneProject(DEFAULT_PROJECT);project.id=`pinky-${story.id}`;project.title=story.title;project.description=story.description;project.creativeMemos=[];project.sheetUrl='';project.updatedAt='pinky-ne-site '+commit.slice(0,7);
 project.planning=Object.fromEntries(Object.keys(project.planning).map(key=>[key,key==='structureMode'?'five':'']));
 project.planning.premise=story.description;project.planning.material=story.originalWork??story.title;
 const routes=[story.routes[story.startRoute],...Object.values(story.routes).filter(route=>route.key!==story.startRoute)];
 const firstId=route=>`${story.id}:${route}:0`;
 project.chapters=[];project.lines=[];
 for(const [routeIndex,route] of routes.entries()){
  const chapterId=`${story.id}:${route.key}`;
  const chapter={...DEFAULT_PROJECT.chapters[0],id:chapterId,order:routeIndex+1,title:route.title||route.key,summary:route.recordSummary||'',purpose:'',mood:'',keyEvents:'',nextChapterIdea:'',storyStageKeys:[],chapterSpeakerNames:[],characterAssetIds:[],backgroundAssetIds:[],backgroundId:'',leftAssetId:'',rightAssetId:''};
  const beats=[...route.beats];
  if(route.choice?.prompt)beats.push({...beats.at(-1),id:'choice-prompt',type:'narration',speaker:'해설',text:route.choice.prompt});
  if(route.choice?.options.length===1)beats.push({...beats.at(-1),id:'continue-action',type:'narration',speaker:'해설',text:route.choice.options[0].text});
  if(!beats.length)throw new Error(`Empty source route ${route.key}`);
  for(const [i,beat] of beats.entries()){
   const character=side=>{const c=beat.characters?.find(c=>c.side===side);const spec=c&&story.assets.characters[c.name];return assetId(spec?.variants?.[c.variant]??spec?.variants?.default);};
   const leftAssetId=character('left'),rightAssetId=character('right');
   const active=beat.characters?.find(c=>c.name===beat.speaker||c.active);
   const line={...DEFAULT_PROJECT.lines[0],id:`${chapterId}:${i}`,chapterId,order:i+1,type:beat.type==='dialogue'?'dialogue':'narration',speaker:beat.type==='dialogue'?(active?.side==='right'?'right':'left'):'narration',speakerName:beat.speaker||'해설',text:beat.text||'',backgroundId:assetId(beat.bgImage??story.assets.backgrounds[beat.bg]),leftAssetId,rightAssetId,purposeNote:'',emotionNote:'',directionNote:''};
   delete line.effect;delete line.flow;
   if(i===beats.length-1){line.flow=route.choice?.options.length>1?{type:'choice',options:route.choice.options.map(option=>({id:option.id,label:option.text,targetLineId:firstId(option.nextRoute)}))}:{type:'goto',targetLineId:route.choice?.options.length===1?firstId(route.choice.options[0].nextRoute):route.nextRoute?firstId(route.nextRoute):null};}
   project.lines.push(line);
  }
  project.chapters.push(chapter);
 }
 project.speakerNames=[...new Set(project.lines.filter(line=>line.type==='dialogue').map(line=>line.speakerName))];
 return project;
});
await writeFile(new URL('../app/story-examples.generated.json',import.meta.url),JSON.stringify({sourceCommit:commit,projects},null,2)+'\n');
console.log(JSON.stringify({stories:projects.map(p=>({title:p.title,cuts:p.lines.length})),missingAssets:[...missing]}));
