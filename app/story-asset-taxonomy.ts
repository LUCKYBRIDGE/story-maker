import type { StoryAsset } from "./story-assets";

export type StoryAssetExpression =
  | "기본"
  | "기쁨"
  | "슬픔"
  | "화남"
  | "놀람"
  | "걱정"
  | "미안함"
  | "결심"
  | "피곤"
  | "의심"
  | "생각"
  | "아픔"
  | "후회"
  | "안도"
  | "온화"
  | "망설임"
  | "조심"
  | "회상";

export type StoryAssetAction =
  | "말하기"
  | "도망"
  | "소품 들기"
  | "제안"
  | "명령"
  | "부탁"
  | "건네기"
  | "일하기";

export type StoryAssetVariant = "어린 시절" | "젊은 모습" | "의상 변형";

export type StoryAssetTaxonomy = {
  character?: string;
  framing?: StoryAsset["framing"];
  expression?: StoryAssetExpression;
  action?: StoryAssetAction;
  variant?: StoryAssetVariant;
};

const EXPRESSION_RULES: Array<[RegExp, StoryAssetExpression]> = [
  [/기쁨|기뻐|웃음|행복/, "기쁨"],
  [/슬픔|슬퍼|울음/, "슬픔"],
  [/분노|화남|화가|엄한/, "화남"],
  [/놀람|깜짝|당황/, "놀람"],
  [/걱정|불안/, "걱정"],
  [/부끄러움|미안|죄책감/, "미안함"],
  [/결심|다짐|단호/, "결심"],
  [/지침|피곤/, "피곤"],
  [/의심|수상/, "의심"],
  [/생각|고민/, "생각"],
  [/위독|병든|아픔|다침/, "아픔"],
  [/후회|반성/, "후회"],
  [/회복|안도/, "안도"],
  [/온화|평온/, "온화"],
  [/망설임|주저/, "망설임"],
  [/조심|경계/, "조심"],
  [/회상/, "회상"],
  [/기본/, "기본"],
];

const ACTION_RULES: Array<[RegExp, StoryAssetAction]> = [
  [/말함|말하기|대화|고백|설명/, "말하기"],
  [/도망|달아남/, "도망"],
  [/약초 꾸러미|등불 든|물대야 든/, "소품 들기"],
  [/제안/, "제안"],
  [/명령/, "명령"],
  [/부탁|애원/, "부탁"],
  [/건넴|건네|제공/, "건네기"],
  [/나무꾼|장작|집안일/, "일하기"],
];

function classifyExpression(text: string): StoryAssetExpression | undefined {
  return EXPRESSION_RULES.find(([pattern]) => pattern.test(text))?.[1];
}

function classifyAction(text: string): StoryAssetAction | undefined {
  return ACTION_RULES.find(([pattern]) => pattern.test(text))?.[1];
}

function classifyVariant(asset: StoryAsset): StoryAssetVariant | undefined {
  const text = `${asset.group} ${asset.pose}`;
  if (/어린/.test(text)) return "어린 시절";
  if (/젊은/.test(text)) return "젊은 모습";
  if (/빌린 옷/.test(text)) return "의상 변형";
  return undefined;
}

export function classifyStoryAsset(asset: StoryAsset): StoryAssetTaxonomy {
  if (asset.type !== "character") return {};

  const text = `${asset.group} ${asset.pose} ${asset.tags.join(" ")}`;
  return {
    character: asset.group,
    framing: asset.framing,
    expression: classifyExpression(text),
    action: classifyAction(text),
    variant: classifyVariant(asset),
  };
}

export function buildStoryAssetTaxonomyTags(asset: StoryAsset): string[] {
  const taxonomy = classifyStoryAsset(asset);
  return [
    taxonomy.character ? `인물 · ${taxonomy.character}` : undefined,
    taxonomy.expression ? `감정·상태 · ${taxonomy.expression}` : undefined,
    taxonomy.action ? `행동 · ${taxonomy.action}` : undefined,
    taxonomy.variant ? `변형 · ${taxonomy.variant}` : undefined,
  ].filter((tag): tag is string => Boolean(tag));
}

export function applyStoryAssetTaxonomy(assets: StoryAsset[]) {
  for (const asset of assets) {
    if (asset.type !== "character") continue;
    asset.tags = [...new Set([...asset.tags, ...buildStoryAssetTaxonomyTags(asset)])];
  }
  return assets;
}
