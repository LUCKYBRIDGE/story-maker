# 화면 목업 기준표

- 정리일: 2026-09-04
- 용도: 구현 참고 자료. 실제 서비스 화면·승인된 모든 세부 규격·QA 증거가 아니다.
- 제품 계약: [상세 설계](../../storygame-detailed-design.md), [화면 흐름 ADR](../../decisions/studio-screen-flow-v1.md)
- 구현 순서: [완성 실행 계획 §11](../../storygame-completion-execution-plan.md#11-u1-화면-정합화-실행-계획)

## 선택 상태와 차용 범위

| 파일 | 선택 상태 | 차용할 것 | 그대로 구현하지 않을 것 |
|---|---|---|---|
| [home-a-v2.png](home-a-v2.png) | 사용자 선택 A안 + 최종 문구 확정 | 새 이야기 만들기 / 이어만들기 두 진입, 여백·색 계열 | 계정·클라우드 지원을 암시하는 가짜 버튼, 예시 그림을 실제 저장 작품으로 표시 |
| [plan_01_split.png](plan_01_split.png) | 사용자 위임으로 채택(2026-09-04) | 장 목록 1개 + 선택한 장 상세, 여러 이야기 단계 | 목업 예문·5개 장을 모든 작품에 강제 |
| [plan_02_accordion.png](plan_02_accordion.png) | 비교 후보 | 좁은 폭의 접기·펼치기 | 넓은 화면에도 모든 상세를 길게 나열 |
| [plan_03_board.png](plan_03_board.png) | 비교 후보 | 전체 흐름을 훑는 보조 요약 | 별도 필수 페이지 또는 장-단계 일대일 배정 |
| [plan_04_first.png](plan_04_first.png) | 빈 상태 참고 | 첫 행동의 크기·짧은 안내 | 현재 빈 작품은 장 0개다. 첫 장을 사용자 행동 없이 자동 생성하지 않음 |
| [plan_05_tablet.png](plan_05_tablet.png) | 반응형 참고 | 좁은 폭의 선택 장 중심 배치 | PNG 비율을 태블릿 CSS 화면 크기로 고정 |
| [editor-manuscript-f.png](editor-manuscript-f.png) | 사용자가 선호한 편집 방향 | 무대와 이 장 대본 함께 보기, 선택 컷 강조 | 현재 장 대본을 작품 전체 대본으로 오해시키는 문구, 화자·위치 선택의 불필요한 반복 |
| [editor-focus-g.png](editor-focus-g.png) | 사용자가 선호한 편집 방향 | 컷 집중 + 글/왼쪽 이미지/오른쪽 이미지/배경 | 긴 세로 배치, 잘린 썸네일을 전신 규격으로 사용, 적용 버튼 중복 |
| [asset-picker-player-d.png](asset-picker-player-d.png) | 선호한 이미지 선택·플레이 방향 | 감정 비교·선택 미리보기, 플레이에서 이 컷 고치기 | 목업 컷 수·표정명·자산 모양을 실제 데이터로 간주 |

메인 B안, 과거 첫 화면 문구와 다른 색의 캐릭터 제안은 이번 구현 기준이 아니다.
이야기 구성은 독립 화면으로 유지하며, 사용자의 최적안 선택 위임에 따라 01안을
채택했다. 넓은 폭은 목록+상세, 좁은 폭은 장 선택기+상세 한 열이다.
04의 빈 상태와 05의 선택 장 중심 배치만 차용한다. 모든 후보를 앱의 보기 모드로
구현하지 않는다. 현행·빈 화면과 원작 두 이야기의 지정 크기 검증, 실제 치수와
후속 구현에서 확인할 항목은 [기준선](../../qa/studio-ui-baseline.md)을 따른다.

목업의 3장 위기·절정 중첩은 가능한 데이터의 예시다. 현재 기본 예시의 단계
지정은 소스가 기준이며 그림에 맞추어 내용을 바꾸지 않는다. 숫자, 이름, 문구,
선택 상태가 충돌하면 상세 설계의 의미와 실제 데이터가 우선한다.

## 원본 보존

9개 PNG를 기존 결과에서 그대로 복사했다. 원본은 삭제하지 않았으며 이미지
재생성·색상 보정·캐릭터 교체를 하지 않았다. 이 폴더는 문서용이며
`public/` 또는 앱 번들에서 import하지 않는다.

- 메인·이야기 구성 원본: 로컬 시각화 세션
  `/Users/baekjiyun/.codex/visualizations/2026/09/02/01a06026-a3e0-7642-9729-f0e10677acc1/`
- 편집 F 원본: 같은 세션 generated_images의 `exec-d0fa15cb-87c3-48d3-877c-de5b814d4fa5.png`
- 편집 G 원본: 같은 세션 generated_images의 `exec-f33bbebb-0ebf-42e3-ac76-61f49c22b44b.png`
- D 원본: `work/ui-mockups/2026-09-04/D-asset-picker-player.png`

복사본 SHA-256 앞 12자리(전체 해시는 파일에서 재계산 가능):

| 파일 | 해시 |
|---|---|
| home-a-v2.png | fd8e336eadd5 |
| plan_01_split.png | f5b997707acc |
| plan_02_accordion.png | 34266daf825c |
| plan_03_board.png | 6aafba73f22a |
| plan_04_first.png | f4b9e75e4ca1 |
| plan_05_tablet.png | 3332d76c986d |
| editor-manuscript-f.png | 700326dd3607 |
| editor-focus-g.png | 1ce501495c4b |
| asset-picker-player-d.png | fca852d72e91 |

## 원작 플레이 참고

확인한 로컬 자료는 `/Volumes/WAN2/apps/pinky-ne-site-publish/games/ifstory/`다.
저장소 HEAD는 `df00a622848182c7d2ef0b0a4731b8b64d237082`.
`index.html`, `assets/index-CtjAkD9O.js`, `assets/index-EhEalP7k.css`는
출판용 산출물이며 원본 UI 소스가 아니다. U1-01에서 정식 로컬 서버의 /ifstory/
경로와 공개 테스트 전용 설정으로 두 이야기의 시작·첫 재생을 확인했다.
정상 기본 크기와 지정 크기 캡처, 같은 세션의 DOM 측정 결과는
[화면 기준선](../../qa/studio-ui-baseline.md)에 기록했다. 초기 캡처 도구의
배율·합성 문제는 격리된 브라우저 프로필과 페이지 표면 캡처로 해소했다.

무대·대사 위계·안전 여백을 참조하되 분기·선택지·점수·저장 방식은 이식하지 않는다.
참고 저장소는 읽기 전용이다. 없으면 새 자료를 요청하고 재생 화면을 추측하지 않는다.
