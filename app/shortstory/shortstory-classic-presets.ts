import { getClassicReading } from '../story-classic-readings';
import { resolveStoryStage } from '../story-stage-view';
import { newShortStory, type ShortStoryProject } from './shortstory-data';
const stories = {
  onggojib: [
    '옹고집은 재산이 많았지만 남에게 베풀 줄 몰랐어요. 도움을 청하는 이웃도 내쫓고, 함께 사는 어머니에게도 인색했지요.',
    '어느 날 찾아온 승려마저 매정하게 내쫓았어요. 이 말을 들은 도승은 풀과 짚으로 옹고집과 똑같이 생긴 사람을 만들었어요.',
    '진짜 옹고집이 집으로 돌아오니 또 다른 옹고집이 앉아 있었어요. 둘은 서로 자기가 진짜라고 우겼어요. 가족들도 누구를 믿어야 할지 몰랐지요.',
    '두 옹고집은 관아로 갔어요. 가짜 옹고집은 집안 내력과 문서까지 훤히 알고 있었어요. 사또는 결국 진짜 옹고집을 가짜라고 판결했어요.',
    '집에서 쫓겨난 옹고집은 배고픔과 외로움을 겪었어요. 문전박대를 당할 때마다 자신이 내쫓았던 사람들의 마음을 생각하게 되었지요.',
    '잘못을 뉘우친 옹고집은 도승에게 부적을 받아 집으로 돌아왔어요. 가짜는 풀과 짚으로 변했지요. 옹고집은 어머니를 보살피고 이웃에게 대문을 열었어요.',
  ],
  seonnyeo: [
    '나무꾼이 사냥꾼에게 쫓기던 사슴을 숨겨 주었어요. 사슴은 보답으로 선녀들이 내려오는 연못을 알려 주며, 날개옷 하나를 감추라고 했어요.',
    '나무꾼은 연못에서 날개옷 하나를 몰래 감췄어요. 옷을 잃은 선녀는 하늘로 돌아가지 못했어요. 선녀는 지상에 남아 나무꾼과 살게 되었지요.',
    '두 아이가 태어난 뒤, 나무꾼은 감춰 둔 날개옷을 보여 주었어요. 선녀는 옷을 입자 두 아이를 안고 그리운 하늘나라로 올라갔어요.',
    '나무꾼은 빈집에서 선녀와 아이들을 그리워했어요. 다시 나타난 사슴은 하늘에서 물을 길으러 내려오는 두레박을 타라고 알려 주었지요.',
    '두레박을 타고 올라간 나무꾼은 가족을 다시 만났어요. 하지만 지상의 어머니가 그리웠어요. 선녀는 용마를 내주며 땅에 내려서지 말라고 당부했어요.',
    '어머니를 만난 나무꾼은 말 위에서 호박죽을 먹다가 말 등에 쏟고 말았어요. 놀란 말에서 떨어지자 용마만 하늘로 돌아갔지요. 나무꾼은 하늘을 그리워하다 수탉이 되었다고 전해져요.',
  ],
};
export function classicShortStory(theme: keyof typeof stories): ShortStoryProject {
  const source=getClassicReading(theme),p=newShortStory();
  return {...p,id:`shortstory-preset-${theme}`,title:source.title,description:'여섯 장면으로 읽고 나의 말로 다시 만드는 전래 이야기',authorDisplayName:'전래 이야기',source:{kind:'preset',presetId:theme},cover:{backgroundId:source.cover?.backgroundId??source.chapters[0].backgroundId,characterId:source.cover?.characterId??source.chapters[0].leftAssetId,authorNote:theme==='onggojib'?'옹고집의 마음은 언제 달라졌나요? 나의 이야기에서는 어떤 사건으로 달라질까요?':'선녀와 나무꾼은 각각 어떤 마음이었을까요? 인물의 마음을 생각하며 나의 말로 고쳐 써 보세요.'},pages:source.chapters.map((chapter,i)=>{const line=source.lines.find(l=>l.chapterId===chapter.id),stage=resolveStoryStage(chapter,line);return {id:`${theme}-page-${i+1}`,order:i+1,title:chapter.title,text:stories[theme][i],backgroundId:stage.background.id,leftAssetId:stage.left.id,rightAssetId:stage.right.id};})};
}
