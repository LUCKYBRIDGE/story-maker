// Canonical values only. Legacy regex output is not authoritative v2 metadata.
export const ASSET_EXPRESSIONS = [
  "기본", "기쁨", "슬픔", "화남", "놀람", "걱정", "두려움", "미안함", "결심", "피곤",
  "의심", "생각", "아픔", "후회", "안도", "온화", "망설임", "조심", "회상", "허탈",
] as const;
export const ASSET_ACTIONS = [
  "말하기", "도망", "들기", "제안", "명령", "부탁", "건네기", "일하기",
  "치료하기", "나누기", "박 타기", "앉기", "주저앉기",
] as const;
export type AssetExpression = typeof ASSET_EXPRESSIONS[number];
export type AssetAction = typeof ASSET_ACTIONS[number];
