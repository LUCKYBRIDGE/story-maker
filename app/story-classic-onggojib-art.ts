/** Visual direction only. Frozen story text lives in story-classic-onggojib.ts.
 * Each row: background, left actor, right actor. See docs/design/onggojib-classic-art.md. */
export const ONGGOJIB_CLASSIC_ART: readonly (readonly (readonly [string, string, string])[])[] = [
  // 1장
  [
    ["onggojib.background.classic-closed-house", "onggojib.character.real-consistent-pixel", ""], // 1-01 닫힌 대문·곳간 배경과 거만한 옹고집
    ["onggojib.background.classic-closed-house", "onggojib.character.real-consistent-pixel", ""], // 1-02 닫힌 대문·곳간 배경과 거만한 옹고집
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-consistent-pixel", "onggojib.character.worker-asking-v2-pixel"], // 1-03 문 안 왼쪽 주인·문 밖 오른쪽 청원자
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-angry-pixel", "onggojib.character.worker-asking-v2-pixel"], // 1-04 문 안 왼쪽 주인·문 밖 오른쪽 청원자
    ["onggojib.background.classic-closed-house", "onggojib.character.real-consistent-pixel", "onggojib.character.worker-asking-v2-pixel"], // 1-05 닫힌 대문·곳간 배경과 거만한 옹고집
    ["onggojib.background.spring-courtyard-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.servant-household-pixel"], // 1-06 하인과 주인
    ["onggojib.background.spring-courtyard-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.servant-household-pixel"], // 1-07 꾸짖는 손
    ["onggojib.background.classic-cold-room", "", "onggojib.character.classic-mother"], // 1-08 회청색 방, 몸을 웅크린 어머니
    ["onggojib.background.classic-cold-room", "", "onggojib.character.classic-mother"], // 1-09 어머니에게 시선 집중
    ["onggojib.background.classic-cold-room", "onggojib.character.real-consistent-pixel", "onggojib.character.classic-mother"], // 1-10 부유한 아들과 추운 어머니
    ["onggojib.background.classic-closed-house", "onggojib.character.real-consistent-pixel", ""], // 1-11 닫힌 대문·곳간 배경과 거만한 옹고집
  ],
  // 2장
  [
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-consistent-pixel", "onggojib.character.classic-monk"], // 2-01 승려가 대문 밖에서 합장
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-consistent-pixel", "onggojib.character.classic-monk"], // 2-02 차분히 시주를 청함
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-angry-pixel", "onggojib.character.classic-monk"], // 2-03 주인의 거절
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-consistent-pixel", "onggojib.character.classic-monk"], // 2-04 한 줌의 곡식을 거듭 청함
    ["onggojib.background.classic-gate-threshold", "onggojib.character.real-angry-pixel", "onggojib.character.classic-monk"], // 2-05 옹고집의 내보내라는 명령
    ["onggojib.background.classic-gate-threshold", "onggojib.character.classic-servant-usher", "onggojib.character.classic-monk"], // 2-06 하인이 문 밖으로 내보내는 손짓
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-monk", "onggojib.character.classic-master"], // 2-07 산중 스승과 제자
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-monk", "onggojib.character.classic-master"], // 2-08 생각에 잠긴 도승
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-master-talisman", "onggojib.character.classic-straw-bound"], // 2-09 도승과 풀·짚 몸, 이마에 붙은 부적
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-master", "onggojib.character.classic-straw-rising"], // 2-10 도승과 일어나며 사람으로 변하는 짚
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-master", "onggojib.character.double-blue-gentle-consistent-pixel"], // 2-11 기준 옹고집과 같은 얼굴·파란 옷
    ["onggojib.background.classic-gate-threshold", "onggojib.character.classic-servant-door", "onggojib.character.double-blue-gentle-consistent-pixel"], // 2-12 문을 열고 집주인으로 맞이하는 하인
  ],
  // 3장
  [
    ["onggojib.background.spring-room-pixel", "onggojib.character.servant-household-pixel", "onggojib.character.classic-double-seated"], // 3-01 장부를 보는 가짜와 하인
    ["onggojib.background.spring-room-pixel", "onggojib.character.classic-shocked", "onggojib.character.classic-double-seated"], // 3-02 선 진짜의 놀람과 앉은 가짜
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.double-blue-gentle-consistent-pixel"], // 3-03 두 사람 동일 의복·체격
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.double-blue-gentle-consistent-pixel"], // 3-04 가짜는 악당 표정 금지
    ["onggojib.background.spring-room-pixel", "onggojib.character.classic-shocked", "onggojib.character.double-blue-gentle-consistent-pixel"], // 3-05 같은 얼굴·같은 옷의 둘
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.wife-concerned-pixel"], // 3-06 아내의 질문
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.wife-concerned-pixel"], // 3-07 진짜의 자신감
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.wife-concerned-pixel"], // 3-08 동쪽 처마 질문
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.wife-concerned-pixel"], // 3-09 기억의 답변
    ["onggojib.background.spring-room-pixel", "onggojib.character.wife-concerned-pixel", "onggojib.character.double-blue-gentle-consistent-pixel"], // 3-10 침착한 같은 답
    ["onggojib.background.spring-room-pixel", "onggojib.character.classic-pointing", "onggojib.character.classic-pointing"], // 3-11 두 사람이 같은 방향의 작은 문갑을 가리킴
    ["onggojib.background.spring-room-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.classic-double-seated"], // 3-12 격앙된 진짜와 앉은 가짜
    ["onggojib.background.spring-courtyard-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.double-blue-gentle-consistent-pixel"], // 3-13 관가로 향하는 두 사람
  ],
  // 4장
  [
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.double-blue-gentle-consistent-pixel"], // 4-01 관가에 나란한 두 옹고집
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.magistrate-pixel"], // 4-02 사또 질문
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.real-consistent-pixel", "onggojib.character.magistrate-pixel"], // 4-03 진짜의 서두름
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.double-blue-gentle-consistent-pixel", "onggojib.character.magistrate-pixel"], // 4-04 가짜의 침착함
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.magistrate-pixel"], // 4-05 다급한 손짓
    ["onggojib.background.classic-court-records", "onggojib.character.real-consistent-pixel", "onggojib.character.magistrate-pixel"], // 4-06 문서 놓인 관가에서 질문
    ["onggojib.background.classic-court-records", "onggojib.character.double-blue-gentle-consistent-pixel", "onggojib.character.magistrate-pixel"], // 4-07 문서 대조와 가짜의 태연함
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.wife-concerned-pixel", "onggojib.character.servant-household-pixel"], // 4-08 판단하지 못한 가족과 하인
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.real-angry-pixel", "onggojib.character.double-blue-gentle-consistent-pixel"], // 4-09 진짜의 격앙과 가짜의 침착함을 같은 화면에
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.double-blue-gentle-consistent-pixel", "onggojib.character.magistrate-pixel"], // 4-10 차분한 가짜
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.double-blue-gentle-consistent-pixel", "onggojib.character.magistrate-command-pixel"], // 4-11 가짜를 인정하는 사또 판결
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.classic-shocked", "onggojib.character.posol-pixel"], // 4-12 아직 좋은 옷, 충격으로 벌어진 손
  ],
  // 5장
  [
    ["onggojib.background.magistrate-yard-pixel", "onggojib.character.classic-shocked", "onggojib.character.posol-pixel"], // 5-01 쫓겨남, 아직 의복 멀쩡함
    ["onggojib.background.classic-gate-outside", "onggojib.character.classic-shocked", ""], // 5-02 닫힌 대문 바깥으로 뒤바뀐 위치
    ["onggojib.background.classic-gate-outside", "onggojib.character.real-angry-pixel", ""], // 5-03 열리지 않는 문에 외침
    ["onggojib.background.classic-gate-outside", "onggojib.character.classic-shocked", ""], // 5-04 문 앞의 상실감
    ["onggojib.background.snow-village-road-pixel", "onggojib.character.real-exiled-consistent-pixel", ""], // 5-05 원망하며 움츠린 몸
    ["onggojib.background.snow-village-road-pixel", "onggojib.character.real-exiled-consistent-pixel", ""], // 5-06 헤진 옷, 굶주림
    ["onggojib.background.classic-poor-threshold", "onggojib.character.real-exiled-pleading-v2-pixel", "onggojib.character.worker-asking-v2-pixel"], // 5-07 문 밖 왼쪽 옹고집·안 오른쪽 마을 사람, 초반 반전
    ["onggojib.background.classic-poor-threshold", "onggojib.character.real-exiled-pleading-v2-pixel", "onggojib.character.worker-asking-v2-pixel"], // 5-08 문 밖 왼쪽 옹고집·안 오른쪽 마을 사람, 초반 반전
    ["onggojib.background.classic-poor-threshold", "onggojib.character.real-exiled-consistent-pixel", ""], // 5-09 원망하며 움츠림
    ["onggojib.background.classic-poor-threshold", "onggojib.character.classic-worn-reflection", ""], // 5-10 자신의 말을 떠올리며 손을 내림
    ["onggojib.background.classic-eaves", "onggojib.character.classic-worn-reflection", ""], // 5-11 차가운 바깥과 따뜻한 창호, 어머니를 회상
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-worn-reflection", ""], // 5-12 산중을 찾음, 옷이 갑자기 회복되지 않음
  ],
  // 6장
  [
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-worn-reflection", "onggojib.character.classic-master"], // 6-01 도승 앞 낮아진 어깨
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-worn-reflection", "onggojib.character.classic-master"], // 6-02 부끄러움과 솔직함
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-worn-reflection", "onggojib.character.classic-master"], // 6-03 고개 숙임
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-worn-reflection", "onggojib.character.classic-master"], // 6-04 도승의 허락
    ["onggojib.background.classic-hermitage", "onggojib.character.classic-talisman", "onggojib.character.classic-master"], // 6-05 같은 부적을 받은 초라한 옹고집
    ["onggojib.background.classic-gate-threshold", "onggojib.character.classic-worn-reflection", "onggojib.character.classic-servant-door"], // 6-06 돌아온 주인에게 문을 여는 하인
    ["onggojib.background.spring-room-pixel", "onggojib.character.classic-worn-reflection", "onggojib.character.double-blue-gentle-consistent-pixel"], // 6-07 초라한 진짜와 여유 있는 가짜
    ["onggojib.background.spring-room-pixel", "onggojib.character.classic-talisman", "onggojib.character.classic-straw-return"], // 6-08 부적을 든 진짜와 굳어 풀·짚으로 흩어지는 가짜
    ["onggojib.background.warm-room-pixel", "onggojib.character.classic-worn-reflection", "onggojib.character.classic-mother"], // 6-09 어머니를 먼저 찾음
    ["onggojib.background.warm-room-pixel", "onggojib.character.real-resolve-consistent-pixel", "onggojib.character.classic-mother-warm"], // 6-10 차분한 아들과 온기를 되찾은 어머니
    ["onggojib.background.classic-open-house-empty", "onggojib.character.real-resolve-consistent-pixel", "onggojib.character.worker-asking-v2-pixel"], // 6-11 열린 곳간·대문과 마주 서는 이웃
  ],
];
