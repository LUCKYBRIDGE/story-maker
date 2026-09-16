/** 컷별 배경·왼쪽 인물·오른쪽 인물. 대본은 story-classic-seonnyeo.ts에서 관리한다.
 * 사슴·사냥꾼·어머니·두 아이 전용 자산을 사용한다.
 * 용마·수탉·두레박과 결합 동작 자산은 생성 한도로 아직 보완 대기다.
 * 빈 인물을 장 기본값으로 채우지 않으며, 떠난 선녀가 다음 컷에 남지 않게 한다.
 */
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
    [valley, "", ""], [valley, woodcutter, ""], [valley, woodcutter, ""],
    [valley, "", ""], [valley, "", guarded], [valley, "", guarded],
    [valley, "", guarded], [valley, woodcutter, guarded], [yard, woodcutter, fairy],
  ],
  [ // 3장: 날개옷을 입는 순간 의상을 바꾼다.
    [yard, woodcutter, fairy], [room, smile, fairy], [yard, smile, children],
    [room, woodcutter, ""], [room, woodcutter, ""], [room, "", deer],
    [room, woodcutter, children], [room, woodcutter, fairy], [room, honest, fairy],
    [room, woodcutter, celestial], [yard, surprised, resolved],
  ],
  [ // 4장: 승천 뒤 선녀 슬롯을 비운다.
    [yard, children, resolved], [yard, surprised, resolved], [yard, surprised, ""],
    [yard, sad, ""], [yard, sad, ""], [autumn, sad, ""],
    [valley, sad, ""], [valley, woodcutter, deer], [valley, woodcutter, deer],
    [valley, honest, deer], [valley, "", deer], [valley, woodcutter, deer],
  ],
  [ // 5장: 연못에서 하늘나라로, 재회 뒤 두 번째 금기
    [valley, woodcutter, ""], [valley, "", ""], [valley, "", ""],
    [sky, "", ""], [sky, smile, children], [sky, honest, warm],
    [sky, children, warm], [sky, sad, warm], [sky, honest, warm],
    [sky, woodcutter, celestial], [sky, woodcutter, celestial],
    [sky, woodcutter, celestial], [sky, honest, celestial],
  ],
  [ // 6장: 말을 타는 동작을 서 있는 캐릭터로 오해하지 않도록 귀환 장면은 배경 중심
    [sky, "", ""], [valley, "", ""], [yard, "", mother],
    [yard, "", mother], [yard, "", mother], [yard, "", mother],
    [yard, "", mother], [yard, "", mother], [yard, "", mother],
    [room, "", mother], [yard, "", mother], [yard, "", mother],
    [yard, "", ""], [yard, "", ""], [yard, "", ""],
    [yard, sad, ""], [valley, sad, ""], [autumn, sad, ""],
    [autumn, sad, ""], [autumn, "", ""], [yard, "", ""],
    [yard, "", ""], [yard, "", ""],
  ],
];
