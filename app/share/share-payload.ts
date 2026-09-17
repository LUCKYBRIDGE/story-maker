import type { StoryProject } from '../story-data';
import { findStoryFlowIssues, orderedStoryFlowLines, type StoryFlow } from '../story-flow';
import { resolveStoryStage } from '../story-stage-view';
import { resolveStoryCover } from '../story-cover';
import { parseShortStory, type ShortStoryProject } from '../shortstory/shortstory-data';
export type SharePage = { id: string; title: string; text: string; backgroundId: string; leftAssetId: string; rightAssetId: string; speakerName?: string; flow?: StoryFlow };
export type SharePayload = { runtimeVersion: 1; kind: 'shortstory' | 'knolstory'; title: string; description: string; author: string; authorNote: string; cover: { backgroundId: string; characterId: string }; pages: SharePage[] };
export function shortStoryPayload(input: ShortStoryProject): SharePayload {
  const p = parseShortStory(input);
  return { runtimeVersion: 1, kind: 'shortstory', title:p.title, description:p.description, author:p.authorDisplayName, authorNote:p.cover.authorNote, cover: { backgroundId:p.cover.backgroundId,characterId:p.cover.characterId }, pages:p.pages.map(({id,title,text,backgroundId,leftAssetId,rightAssetId})=>({id,title,text,backgroundId,leftAssetId,rightAssetId})) };
}
export function knolStoryPayload(p: StoryProject): SharePayload {
  if (!p.lines.length || findStoryFlowIssues(p).length) throw Error('플레이에 적용한 작품의 컷 연결을 확인해 주세요.');
  const cover = resolveStoryCover(p);
  return { runtimeVersion:1,kind:'knolstory',title:p.title,description:p.description,author:cover.author,authorNote:cover.authorNote,cover:{backgroundId:cover.backgroundId,characterId:cover.characterId},pages:orderedStoryFlowLines(p).map(line=> {
    const chapter = p.chapters.find(c=>c.id===line.chapterId), stage = resolveStoryStage(chapter,line);
    return {id:line.id,title:chapter?.title ?? '',text:line.text,backgroundId:stage.background.id,leftAssetId:stage.left.id,rightAssetId:stage.right.id,speakerName:line.type==='dialogue'?line.speakerName:'', ...(line.flow ? {flow:structuredClone(line.flow)} : {})};
  }) };
}
