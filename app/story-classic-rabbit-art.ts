/** Visual direction only; the approved 56-cut script stays in story-classic-readings.ts.
 * Rows: background, left actor, right actor. See docs/design/rabbit-classic-art.md. */
export const RABBIT_CLASSIC_ART: readonly (readonly (readonly [string, string, string])[])[] = [
  // 1장
  [
    ["rabbit-turtle.background.classic-palace-vista","",""], // 1-01 용궁 외경, 인물 도입 전
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-02 병든 용왕 단독
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-03 병든 용왕의 호소
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.palace-physician-worried","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-04 의원과 병든 용왕
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-05 도사는 해설로 전달, 의관을 도사로 대체하지 않음
    ["rabbit-turtle.background.classic-court","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-06 육지행 질문과 신하들
    ["rabbit-turtle.background.classic-court","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-07 시선을 피하는 신하들
    ["rabbit-turtle.background.classic-court","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-08 망설임 유지
    ["rabbit-turtle.background.classic-court","","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-09 용왕의 재촉
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.turtle-resolve","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-10 나서는 별주부
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.classic-turtle-portrait","rabbit-turtle.character.dragonking-sick-elder-attached"], // 1-11 초상화 전달
  ],
  // 2장
  [
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","","rabbit-turtle.character.turtle-resolve"], // 2-01 빈 물가에 별주부 단독
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","","rabbit-turtle.character.classic-turtle-portrait"], // 2-02 초상화와 낯선 육지
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","","rabbit-turtle.character.classic-turtle-portrait"], // 2-03 초상화를 들고 탐색
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","","rabbit-turtle.character.classic-turtle-portrait"], // 2-04 그림과 짐승을 비교
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-white-unified-720x900","rabbit-turtle.character.classic-turtle-portrait"], // 2-05 처음 토끼 등장
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-white-unified-720x900","rabbit-turtle.character.turtle-offer"], // 2-06 서로 마주 보고 인사
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-suspicious","rabbit-turtle.character.turtle-offer"], // 2-07 토끼의 경계
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-white-unified-720x900","rabbit-turtle.character.turtle-offer"], // 2-08 용궁 설명
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-suspicious","rabbit-turtle.character.turtle-offer"], // 2-09 토끼의 의심
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-thinking","rabbit-turtle.character.turtle-offer"], // 2-10 설득에 귀 기울임
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-thinking","rabbit-turtle.character.turtle-resolve"], // 2-11 토끼가 고민
    ["rabbit-turtle.background.rabbit-turtle-bg-grassland","rabbit-turtle.character.rabbit-speaking-truth","rabbit-turtle.character.turtle-resolve"], // 2-12 용궁행 결정
  ],
  // 3장
  [
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","rabbit-turtle.character.rabbit-suspicious","rabbit-turtle.character.turtle-resolve"], // 3-01 물가에서 멈춤
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","rabbit-turtle.character.rabbit-suspicious","rabbit-turtle.character.turtle-offer"], // 3-02 등에 타라는 제안
    ["rabbit-turtle.background.classic-sea","rabbit-turtle.character.classic-riding",""], // 3-03 등에 타고 바다로
    ["rabbit-turtle.background.classic-sea","rabbit-turtle.character.classic-riding",""], // 3-04 돌아보는 토끼의 불안
    ["rabbit-turtle.background.classic-sea","rabbit-turtle.character.classic-riding",""], // 3-05 멀어진 육지
    ["rabbit-turtle.background.classic-sea","rabbit-turtle.character.classic-riding",""], // 3-06 이동 연속성
    ["rabbit-turtle.background.classic-underwater","rabbit-turtle.character.classic-riding",""], // 3-07 산호와 물고기
    ["rabbit-turtle.background.classic-palace-vista","rabbit-turtle.character.classic-riding",""], // 3-08 용궁 첫 발견
    ["rabbit-turtle.background.classic-court","rabbit-turtle.character.rabbit-white-unified-720x900","rabbit-turtle.character.dragonking-sick-elder-attached"], // 3-09 신하들의 시선과 병든 왕
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-speaking-truth","rabbit-turtle.character.dragonking-sick-elder-attached"], // 3-10 토끼의 인사
    ["rabbit-turtle.background.classic-court","rabbit-turtle.character.rabbit-shocked","rabbit-turtle.character.dragonking-sick-elder-attached"], // 3-11 붙잡으라는 명령에 놀람
  ],
  // 4장
  [
    ["rabbit-turtle.background.classic-court","rabbit-turtle.character.rabbit-shocked","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-01 충격
    ["rabbit-turtle.background.classic-court","rabbit-turtle.character.rabbit-shocked","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-02 사실 확인
    ["rabbit-turtle.background.classic-court","rabbit-turtle.character.rabbit-shocked","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-03 병을 고치려는 왕
    ["rabbit-turtle.background.classic-court","rabbit-turtle.character.rabbit-shocked","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-04 신하들 사이 갇힘, 무기 없이 긴장
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-thinking","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-05 생각에 집중
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.classic-rabbit-laugh","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-06 두려움을 감추고 웃음
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.classic-rabbit-laugh","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-07 용왕이 웃는 이유를 물음
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.classic-rabbit-laugh","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-08 능청스러운 답변
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-speaking-truth","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-09 용왕의 의문
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-speaking-truth","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-10 간은 시각화하지 않고 말로만 설명
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-thinking","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-11 용왕의 반응을 살핌
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-speaking-truth","rabbit-turtle.character.dragonking-sick-elder-attached"], // 4-12 육지로 보내 달라는 제안
  ],
  // 5장
  [
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.rabbit-thinking","rabbit-turtle.character.dragonking-sick-elder-attached"], // 5-01 용왕의 마음이 흔들림
    ["rabbit-turtle.background.rabbit-turtle-bg-palace","rabbit-turtle.character.turtle-resolve","rabbit-turtle.character.dragonking-sick-elder-attached"], // 5-02 별주부에게 내리는 명령
    ["rabbit-turtle.background.classic-underwater","rabbit-turtle.character.classic-riding",""], // 5-03 다시 등에 타고 출발
    ["rabbit-turtle.background.classic-underwater","rabbit-turtle.character.classic-riding",""], // 5-04 산호 사이 귀환
    ["rabbit-turtle.background.classic-sea","rabbit-turtle.character.classic-riding",""], // 5-05 수면과 먼 육지
    ["rabbit-turtle.background.classic-sea","rabbit-turtle.character.classic-riding",""], // 5-06 물가에 가까이 가 달라는 요청
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","rabbit-turtle.character.classic-rabbit-leap","rabbit-turtle.character.classic-turtle-water"], // 5-07 분리된 도약 토끼와 물가 별주부
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","rabbit-turtle.character.classic-rabbit-rock","rabbit-turtle.character.classic-turtle-water"], // 5-08 바위 소품 포함 토끼와 물가 별주부를 좌우 분리 배치
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","rabbit-turtle.character.classic-rabbit-rock","rabbit-turtle.character.classic-turtle-water"], // 5-09 바위 소품 포함 토끼와 물가 별주부를 좌우 분리 배치
    ["rabbit-turtle.background.rabbit-turtle-bg-shore-escape","","rabbit-turtle.character.turtle-tired"], // 5-10 토끼 없는 빈 물가, 홀로 돌아가는 여운
  ],
];
