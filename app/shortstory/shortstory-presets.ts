import { newShortStory, type ShortStoryProject } from './shortstory-data.ts';
const prefix = 'rabbit-turtle.';
const bg = (name: string) => `${prefix}background.rabbit-turtle-bg-${name}`;
const rabbit = `${prefix}character.rabbit-white-unified-720x900`;
const turtle = `${prefix}character.turtle-unified-720x900`;
const dragon = `${prefix}character.dragonking-sick-elder-attached`;
export function rabbitShortStory(): ShortStoryProject {
  const project = newShortStory();
  return { ...project, id: 'shortstory-preset-rabbit', title: '별주부전', description: '여덟 장면으로 만나는 토끼와 별주부의 모험', authorDisplayName: '전래 이야기', source: { kind: 'preset', presetId: 'rabbit' }, cover: { backgroundId: bg('shore'), characterId: rabbit, authorNote: '토끼는 위기를 어떻게 벗어났나요? 내가 토끼라면 어떻게 했을지 이야기해 보세요.' }, pages: [
    ['용궁의 근심', '용왕이 깊은 병에 걸렸어요. 토끼의 간이 약이 된다는 말을 듣고, 별주부가 토끼를 찾아 나섰어요.', bg('palace'), dragon, turtle],
    ['육지로 떠난 별주부', '별주부는 토끼의 모습을 기억하며 바다를 건넜어요. 낯선 육지에서 토끼를 찾을 수 있을까요?', bg('shore'), turtle, ''],
    ['달콤한 초대', '들판에서 토끼를 만난 별주부는 용궁의 멋진 잔치를 이야기했어요. 간을 구하러 왔다는 사실은 숨겼지요.', bg('grassland'), rabbit, turtle],
    ['바다를 건너', '토끼는 별주부의 등에 올라탔어요. 바닷속 궁전이 궁금해 두근거렸지만, 돌아갈 길은 알지 못했어요.', bg('shore'), rabbit, turtle],
    ['뜻밖의 위기', '용궁에 도착하자 토끼의 간을 꺼내라는 명령이 떨어졌어요. 토끼는 놀랐지만, 살아 돌아갈 방법을 생각했어요.', bg('palace-trap'), rabbit, dragon],
    ['토끼의 꾀', '“제 간은 육지에 두고 왔어요. 데려다주시면 가져오지요.” 용왕은 토끼의 말을 믿고 별주부에게 다시 뭍으로 데려다주라고 했어요.', bg('palace'), rabbit, turtle],
    ['다시 밟은 땅', '뭍에 닿자 토끼가 폴짝 뛰어내렸어요. “간을 몸 밖에 두는 토끼가 어디 있니!” 별주부는 그제야 속았다는 걸 알았어요.', bg('shore'), rabbit, turtle],
    ['숲으로 돌아간 토끼', '토끼는 숲으로 달아났어요. 달콤한 말을 덥석 믿어 위험에 빠졌지만, 침착하게 생각한 덕분에 목숨을 구했지요.', bg('grassland'), rabbit, ''],
  ].map(([title,text,backgroundId,leftAssetId,rightAssetId], i) => ({ id: `rabbit-page-${i+1}`, order: i+1, title,text,backgroundId,leftAssetId,rightAssetId })) };
}
