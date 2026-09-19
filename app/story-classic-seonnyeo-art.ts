/** 컷별 배경·왼쪽 인물·오른쪽 인물. 대본은 story-classic-seonnyeo.ts에서 관리한다.
 * 인물·소품·결합 동작 전용 자산으로 원작의 주요 사건을 보여 준다.
 * 빈 인물을 장 기본값으로 채우지 않으며, 떠난 선녀가 다음 컷에 남지 않게 한다.
 */
const robe = "seonnyeo.character.classic-wing-robe";
const holdingRobe = "seonnyeo.character.classic-woodcutter-holding-robe";
const carryingChildren = "seonnyeo.character.classic-fairy-carrying-children";
const bucket = "seonnyeo.character.classic-heavenly-bucket";
const inBucket = "seonnyeo.character.classic-woodcutter-in-bucket";
const horse = "seonnyeo.character.classic-celestial-horse";
const riding = "seonnyeo.character.classic-woodcutter-riding-horse";
const porridge = "seonnyeo.character.classic-mother-offering-porridge";
const startledHorse = "seonnyeo.character.classic-horse-startled-by-porridge";
const fallen = "seonnyeo.character.classic-woodcutter-fallen";
const departingHorse = "seonnyeo.character.classic-celestial-horse-departing";
const rooster = "seonnyeo.character.classic-rooster-calling-sky";
const aged = "seonnyeo.character.classic-woodcutter-aged";
const firstBaby = "seonnyeo.character.classic-fairy-holding-first-baby";
const deer = "seonnyeo.character.classic-deer";
const hunter = "seonnyeo.character.classic-hunter";
const mother = "seonnyeo.character.classic-mother";
const children = "seonnyeo.character.classic-children";
const valley = "seonnyeo.background.BG01-valley-day";
const yard = "seonnyeo.background.BG04-cottage-day";
const autumn = "seonnyeo.background.BG06-cottage-autumn";
const room = "seonnyeo.background.BG09-room-day";
const sky = "seonnyeo.background.classic-sky-realm";
const woodcutter = "seonnyeo.character.M02-neutral";
const axe = "seonnyeo.character.M02-axe";
const surprised = "seonnyeo.character.M02-surprised";
const sad = "seonnyeo.character.M02-sad";
const honest = "seonnyeo.character.M02-honest";
const smile = "seonnyeo.character.M02-dry-smile";
const fairy = "seonnyeo.character.M01-base";
const guarded = "seonnyeo.character.M01-base-guarded";
const celestial = "seonnyeo.character.M01-celestial";
const resolved = "seonnyeo.character.M01-celestial-resolve";
const warm = "seonnyeo.character.M01-celestial-warm";

export const SEONNYEO_CLASSIC_ART: readonly (readonly (readonly [string, string, string])[])[] = [
  [ // 1장: 사슴의 보은
    [yard, woodcutter, mother], [valley, axe, ""], [valley, surprised, deer],
    [valley, woodcutter, deer], [valley, woodcutter, hunter], [valley, woodcutter, hunter],
    [valley, woodcutter, hunter], [valley, woodcutter, deer], [valley, woodcutter, deer],
    [valley, "", deer], [valley, woodcutter, deer], [valley, woodcutter, deer],
  ],
  [ // 2장: 목욕은 빈 연못 풍경과 서술로 전달한다.
    [valley, woodcutter, ""], [valley, "", ""], [valley, "", ""],
    [valley, "", robe], [valley, holdingRobe, ""], [valley, woodcutter, ""],
    [valley, "", ""], [valley, "", guarded], [valley, "", guarded],
    [valley, "", guarded], [valley, woodcutter, guarded], [yard, woodcutter, fairy],
  ],
  [ // 3장: 날개옷을 입는 순간 의상을 바꾼다.
    [yard, woodcutter, fairy], [room, smile, firstBaby], [yard, smile, children],
    [room, holdingRobe, ""], [room, holdingRobe, ""], [room, "", deer],
    [room, woodcutter, children], [room, holdingRobe, fairy], [room, holdingRobe, fairy],
    [room, woodcutter, celestial], [yard, surprised, resolved],
  ],
  [ // 4장: 승천 뒤 선녀 슬롯을 비운다.
    [yard, "", carryingChildren], [yard, surprised, carryingChildren], [yard, surprised, carryingChildren],
    [yard, sad, ""], [yard, sad, ""], [autumn, sad, ""],
    [valley, sad, ""], [valley, woodcutter, deer], [valley, woodcutter, deer],
    [valley, honest, deer], [valley, "", deer], [valley, woodcutter, deer],
  ],
  [ // 5장: 연못에서 하늘나라로, 재회 뒤 두 번째 금기
    [valley, woodcutter, ""], [valley, "", bucket], [valley, inBucket, ""],
    [sky, inBucket, ""], [sky, smile, carryingChildren], [sky, honest, warm],
    [sky, children, warm], [sky, sad, warm], [sky, honest, warm],
    [sky, horse, celestial], [sky, honest, celestial],
    [sky, honest, celestial], [sky, honest, celestial],
  ],
  [ // 6장: 귀환·호박죽 사고·낙마·수탉 결말
    [sky, riding, ""], [valley, riding, ""], [yard, riding, mother],
    [yard, riding, mother], [yard, riding, mother], [yard, riding, mother],
    [yard, riding, mother], [yard, riding, mother], [yard, riding, mother],
    [yard, riding, porridge], [yard, riding, porridge], [yard, riding, porridge],
    [yard, startledHorse, ""], [yard, startledHorse, ""], [yard, fallen, ""],
    [yard, fallen, departingHorse], [valley, sad, ""], [autumn, sad, ""],
    [autumn, aged, ""], [autumn, aged, ""], [yard, "", rooster],
    [yard, "", rooster], [yard, "", rooster],
  ],
];
