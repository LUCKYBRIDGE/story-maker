import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceCandidates = [
  path.resolve(projectRoot, "../pinky-ne-site"),
  path.resolve(projectRoot, "../pinky-ne-site-publish"),
];
const sourceCommit = "cc9552b44b41d1be4e79244d35f0cfdb2e849610";
const sourceRoot = sourceCandidates.find((candidate) => {
  try {
    execFileSync("git", ["-C", candidate, "cat-file", "-e", `${sourceCommit}^{commit}`]);
    return true;
  } catch {
    return false;
  }
});

if (!sourceRoot) {
  throw new Error(
    `원본 커밋 ${sourceCommit}을 포함한 pinky-ne-site 저장소를 찾지 못했습니다.`,
  );
}
const sourcePrefix = "games/ifstory/images/adventure/";
const rabbitTurtleOriginalStems = new Set([
  "adventure_dragonking_recovered_unified_720x900",
  "adventure_dragonking_unified_720x900",
  "adventure_dragonking_young_unified_720x900",
  "adventure_physician_unified_720x900",
  "adventure_rabbit_white_unified_720x900",
  "adventure_turtle_child_unified_720x900",
  "adventure_turtle_unified_720x900",
  "adventure_rabbit_turtle_bg_flashback_rescue",
  "adventure_rabbit_turtle_bg_grassland",
  "adventure_rabbit_turtle_bg_palace",
  "adventure_rabbit_turtle_bg_palace_confession",
  "adventure_rabbit_turtle_bg_palace_trap",
  "adventure_rabbit_turtle_bg_palace_welcome",
  "adventure_rabbit_turtle_bg_river_winter",
  "adventure_rabbit_turtle_bg_shore",
  "adventure_rabbit_turtle_bg_shore_escape",
]);
const rabbitTurtleStageBackgroundStems = new Set([
  "adventure_rabbit_turtle_bg_flashback_rescue",
  "adventure_rabbit_turtle_bg_grassland",
  "adventure_rabbit_turtle_bg_grassland_night",
  "adventure_rabbit_turtle_bg_palace",
  "adventure_rabbit_turtle_bg_palace_confession",
  "adventure_rabbit_turtle_bg_palace_trap",
  "adventure_rabbit_turtle_bg_palace_welcome",
  "adventure_rabbit_turtle_bg_river_winter",
  "adventure_rabbit_turtle_bg_shore",
  "adventure_rabbit_turtle_bg_shore_discussion",
  "adventure_rabbit_turtle_bg_shore_escape",
  "adventure_rabbit_turtle_bg_shore_herb",
]);
const onggojibRecommendedCharacterStems = new Set([
  "onggojib_double_blue_firm_consistent_pixel",
  "onggojib_double_blue_gentle_consistent_pixel",
  "onggojib_double_blue_offering_consistent_pixel",
  "onggojib_magistrate_command_pixel",
  "onggojib_posol_pixel",
  "onggojib_real_angry_pixel",
  "onggojib_real_borrowed_consistent_pixel",
  "onggojib_real_consistent_pixel",
  "onggojib_real_exiled_consistent_pixel",
  "onggojib_real_exiled_pleading_v2_pixel",
  "onggojib_real_remorse_consistent_pixel",
  "onggojib_real_resolve_consistent_pixel",
  "onggojib_second_child_hesitant_pixel",
  "onggojib_second_child_pixel",
  "onggojib_servant_household_pixel",
  "onggojib_servant_injured_pixel",
  "onggojib_wife_concerned_pixel",
  "onggojib_wife_pixel",
  "onggojib_wife_resolved_pixel",
  "onggojib_worker_asking_v2_pixel",
  "onggojib_worker_woodcutter_v2_pixel",
  "onggojib_youngest_child_cautious_pixel",
  "onggojib_youngest_child_pixel",
]);
const onggojibRecommendedBackgroundStems = new Set([
  "onggojib_magistrate_yard_pixel",
  "onggojib_snow_road_pixel",
  "onggojib_snow_village_road_pixel",
  "onggojib_spring_courtyard_pixel",
  "onggojib_spring_room_pixel",
  "onggojib_warm_room_pixel",
  "onggojib_winter_courtyard_pixel",
]);

const tree = execFileSync(
  "git",
  [
    "-C",
    sourceRoot,
    "ls-tree",
    "-r",
    "--name-only",
    sourceCommit,
    "--",
    sourcePrefix,
  ],
  { encoding: "utf8" },
);

const paths = tree
  .split("\n")
  .filter(Boolean)
  .filter((entry) => entry.endsWith(".png"))
  .filter((entry) => {
    if (entry.includes("/characters/")) return true;
    if (entry.includes("/backgrounds/")) return true;
    const relative = entry.slice(sourcePrefix.length);
    return !relative.includes("/") && relative.startsWith("adventure_rabbit");
  })
  .sort();

const exactLabels = {
  adventure_dragonking_command: ["용왕", "명령"],
  adventure_dragonking_command_attached: ["용왕", "엄한 명령"],
  adventure_dragonking_critical_attached: ["용왕", "위독"],
  adventure_dragonking_critical_worse_attached: ["용왕", "매우 위독"],
  adventure_dragonking_recovered_unified_720x900: ["용왕", "회복"],
  adventure_dragonking_sick_elder_attached: ["용왕", "병든 모습"],
  adventure_dragonking_unified_720x900: ["용왕", "기본"],
  adventure_dragonking_young_attached: ["젊은 용왕", "기본"],
  adventure_dragonking_young_unified_720x900: ["젊은 용왕", "전신"],
  adventure_palace_physician_worried: ["의관", "걱정"],
  adventure_physician_unified_720x900: ["의관", "기본"],
  adventure_rabbit_guilty_escape: ["토끼", "미안해서 도망"],
  adventure_rabbit_herb_bundle: ["토끼", "약초 꾸러미"],
  adventure_rabbit_shocked: ["토끼", "놀람"],
  adventure_rabbit_speaking_truth: ["토끼", "진실을 말함"],
  adventure_rabbit_suspicious: ["토끼", "의심"],
  adventure_rabbit_thinking: ["토끼", "생각"],
  adventure_rabbit_white_unified_720x900: ["토끼", "기본"],
  adventure_turtle_ashamed: ["자라", "부끄러움"],
  adventure_turtle_child_flashback: ["어린 자라", "회상"],
  adventure_turtle_child_unified_720x900: ["어린 자라", "기본"],
  adventure_turtle_herb_bundle: ["자라", "약초 꾸러미"],
  adventure_turtle_offer: ["자라", "제안"],
  adventure_turtle_resolve: ["자라", "결심"],
  adventure_turtle_tired: ["자라", "지침"],
  adventure_turtle_unified_720x900: ["자라", "기본"],
  adventure_rabbit_palace_reveal: ["용궁", "토끼의 진실"],
  adventure_rabbit_turtle_shore_choice: ["물가", "토끼와 자라의 선택"],
  adventure_rabbit_turtle_temptation: ["들판", "자라의 유혹"],
  adventure_rabbit_turtle_temptation_opening: ["들판", "이야기의 시작"],
  adventure_rabbit_turtle_bg_flashback_rescue: ["바닷속", "구출 회상"],
  adventure_rabbit_turtle_bg_grassland: ["들판", "낮"],
  adventure_rabbit_turtle_bg_grassland_night: ["들판", "밤"],
  adventure_rabbit_turtle_bg_palace: ["용궁", "궁전"],
  adventure_rabbit_turtle_bg_palace_confession: ["용궁", "고백 장면"],
  adventure_rabbit_turtle_bg_palace_trap: ["용궁", "위기 장면"],
  adventure_rabbit_turtle_bg_palace_welcome: ["용궁", "환영 연회장"],
  adventure_rabbit_turtle_bg_river_winter: ["강가", "겨울"],
  adventure_rabbit_turtle_bg_shore: ["물가", "기본"],
  adventure_rabbit_turtle_bg_shore_discussion: ["물가", "대화 장면"],
  adventure_rabbit_turtle_bg_shore_escape: ["물가", "도망 장면"],
  adventure_rabbit_turtle_bg_shore_herb: ["물가", "약초 장면"],
  onggojib_broken_celadon_cg_pixel: ["옹고집전 장면", "깨진 청자"],
  onggojib_child_carry_cg_pixel: ["옹고집전 장면", "아이를 업음"],
  onggojib_child_distance_cg_pixel: ["옹고집전 장면", "멀어진 아이"],
  onggojib_child_fever_cg_pixel: ["옹고집전 장면", "열이 난 아이"],
  onggojib_confession_folded_coat_cg_pixel: ["옹고집전 장면", "옷을 개며 고백"],
  onggojib_court_child_choice_cg_pixel: ["관아", "아이의 선택"],
  onggojib_exiled_mirror_cg_pixel: ["옹고집전 장면", "쫓겨난 뒤 거울"],
  onggojib_gate_stranger_cg_pixel: ["대문", "낯선 사람"],
  onggojib_kind_father_cg_pixel: ["옹고집전 장면", "다정한 아버지"],
  onggojib_magistrate_yard_pixel: ["관아", "마당"],
  onggojib_open_gate_kindness_cg_pixel: ["대문", "문을 열어 줌"],
  onggojib_reconciliation_blue_cg_pixel: ["옹고집전 장면", "푸른 옷의 화해"],
  onggojib_reconciliation_borrowed_cg_pixel: ["옹고집전 장면", "빌린 옷의 화해"],
  onggojib_servant_lamp_cg_pixel: ["옹고집전 장면", "등불 든 하인"],
  onggojib_servant_water_basin_cg_pixel: ["옹고집전 장면", "물대야 든 하인"],
  onggojib_snow_road_pixel: ["눈길", "산길"],
  onggojib_snow_village_road_pixel: ["눈길", "마을"],
  onggojib_spring_courtyard_pixel: ["옹고집의 집", "봄 마당"],
  onggojib_spring_room_pixel: ["옹고집의 집", "봄날 방"],
  onggojib_warm_room_pixel: ["옹고집의 집", "따뜻한 방"],
  onggojib_winter_courtyard_pixel: ["옹고집의 집", "겨울 마당"],
  onggojib_wood_chopping_cg_pixel: ["옹고집전 장면", "장작 패기"],
};

const ownerTokens = [
  ["onggojib_real", "진짜 옹고집"],
  ["onggojib_double", "가짜 옹고집"],
  ["onggojib_wife", "옹고집의 아내"],
  ["onggojib_servant", "옹고집의 하인"],
  ["onggojib_worker", "일꾼"],
  ["onggojib_second_child", "둘째 아이"],
  ["onggojib_youngest_child", "막내 아이"],
  ["onggojib_child", "아이"],
  ["onggojib_magistrate", "사또"],
  ["onggojib_posol", "포졸"],
  ["onggojib_stranger", "낯선 사람"],
  ["onggojib_group", "옹고집전 여러 인물"],
];

const poseTokens = [
  ["fake_servant_worker_payment", "가짜 하인과 일꾼에게 품삯"],
  ["fake_worker_reward", "가짜 일꾼에게 보상"],
  ["fake_wife_entering", "가짜 아내 등장"],
  ["fake_child_story", "가짜 아이 이야기"],
  ["real_ghost_servant_pass", "진짜 옹고집과 하인"],
  ["real_source", "정체가 드러남"],
  ["exiled_pleading", "쫓겨나 애원"],
  ["woodcutter", "나무꾼"],
  ["household", "집안일"],
  ["offering", "건넴"],
  ["concerned", "걱정"],
  ["resolved", "결심"],
  ["remorse", "후회"],
  ["resolve", "결심"],
  ["borrowed", "빌린 옷"],
  ["exiled", "쫓겨남"],
  ["pleading", "애원"],
  ["injured", "다침"],
  ["cautious", "조심"],
  ["hesitant", "망설임"],
  ["command", "명령"],
  ["asking", "부탁"],
  ["gentle", "온화"],
  ["firm", "단호"],
  ["angry", "분노"],
  ["hidden", "정체를 숨김"],
  ["consistent", "이어지는 모습"],
  ["pixel", "기본"],
];

const tagAliases = {
  놀람: ["깜짝", "당황"],
  부끄러움: ["미안함"],
  걱정: ["불안"],
  지침: ["피곤"],
  결심: ["다짐"],
  분노: ["화남"],
  도망: ["달아남"],
  화해: ["용서"],
  겨울: ["눈"],
  연회장: ["잔치"],
};

function classifyFraming({ type, group, stem }) {
  if (type !== "character") return undefined;
  if (group === "옹고집전 여러 인물" || stem.includes("_group_")) {
    return "여러 인물";
  }
  return "전신";
}

function buildTags(story, group, pose, framing, usage, selectionTier) {
  const tags = [story, selectionTier, usage, framing, group, pose];
  for (const [keyword, aliases] of Object.entries(tagAliases)) {
    if (`${group} ${pose}`.includes(keyword)) tags.push(...aliases);
  }
  return [...new Set(tags.filter(Boolean))];
}

function classifySelectionTier({ story, type, stem }) {
  if (story === "토끼와 자라") {
    if (type === "character") {
      return stem.includes("_unified_720x900")
        ? "기본 추천"
        : "추가 자료";
    }
    return rabbitTurtleStageBackgroundStems.has(stem)
      ? "기본 추천"
      : "추가 자료";
  }

  return (
    type === "character"
      ? onggojibRecommendedCharacterStems
      : onggojibRecommendedBackgroundStems
  ).has(stem)
    ? "기본 추천"
    : "추가 자료";
}

function classifyStem(stem, type) {
  const exact = exactLabels[stem];
  if (exact) return exact;

  if (stem.startsWith("onggojib_") && type === "character") {
    const owner = ownerTokens.find(([token]) => stem.startsWith(token));
    const ownerName = owner?.[1] ?? "옹고집전 인물";
    const remainder = owner ? stem.slice(owner[0].length + 1) : stem.slice(10);
    const pose =
      poseTokens.find(([token]) => remainder.includes(token))?.[1] ?? "기본";
    return [ownerName, pose];
  }

  return [
    type === "character" ? "이야기 인물" : "이야기 배경",
    stem
      .replace(/^adventure_/, "")
      .replace(/^onggojib_/, "")
      .replace(/_pixel|_attached|_unified|_720x900|_v2/g, "")
      .replaceAll("_", " "),
  ];
}

const duplicateNames = new Map();
const assets = paths.map((sourcePath) => {
  const relativePath = sourcePath.slice(sourcePrefix.length);
  const stem = path.basename(relativePath, ".png");
  const type = relativePath.includes("characters/") ? "character" : "background";
  const story = relativePath.includes("onggojib")
    ? "옹고집전"
    : "토끼와 자라";
  const category =
    type === "background" &&
    (stem.includes("_cg_") || !relativePath.includes("/backgrounds/"))
      ? "special"
      : type;
  const [group, pose] = classifyStem(stem, type);
  const framing = classifyFraming({ story, type, group, stem });
  const usage =
    story === "토끼와 자라" && !rabbitTurtleOriginalStems.has(stem)
      ? "추가 연출"
      : "원작 사용";
  const selectionTier = classifySelectionTier({ story, type, stem });
  const baseDisplayName = `${group}_${pose}`.replaceAll(" ", "");
  const seen = (duplicateNames.get(baseDisplayName) ?? 0) + 1;
  duplicateNames.set(baseDisplayName, seen);
  const displayName =
    seen === 1 ? `${baseDisplayName}.png` : `${baseDisplayName}${seen}.png`;
  const id = `${story === "옹고집전" ? "onggojib" : "rabbit-turtle"}.${type}.${stem
    .replace(/^adventure_/, "")
    .replace(/^onggojib_/, "")
    .replaceAll("_", "-")}`;

  return {
    id,
    displayName,
    label: `${group} · ${pose}`,
    story,
    type,
    category,
    group,
    pose,
    framing,
    usage,
    selectionTier,
    tags: buildTags(story, group, pose, framing, usage, selectionTier),
    src: `/story-assets/${id}.webp`,
    sourcePath,
    copyright: "놀퀴즈",
  };
});

const output = `// 이 파일은 scripts/generate-story-assets.mjs로 생성됩니다.
// 원본: LUCKYBRIDGE/pinky-ne-site @ ${sourceCommit}

export type StoryAsset = {
  id: string;
  displayName: string;
  label: string;
  story: "토끼와 자라" | "옹고집전";
  type: "character" | "background";
  category: "character" | "background" | "special";
  group: string;
  pose: string;
  framing?: "전신" | "상반신" | "여러 인물";
  usage: "원작 사용" | "추가 연출";
  selectionTier: "기본 추천" | "추가 자료";
  tags: string[];
  src: string;
  sourcePath: string;
  copyright: "놀퀴즈";
};

export const STORY_ASSET_SOURCE_COMMIT = "${sourceCommit}";

export const STORY_ASSETS: StoryAsset[] = ${JSON.stringify(assets, null, 2)};
`;

await writeFile(path.join(projectRoot, "app/story-assets.ts"), output);
console.log(
  `Generated ${assets.length} assets (${assets.filter((item) => item.type === "character").length} characters, ${assets.filter((item) => item.type === "background").length} backgrounds).`,
);
