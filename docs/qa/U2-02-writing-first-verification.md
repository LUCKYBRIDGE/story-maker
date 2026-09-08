# U2-01/02 로컬 구현·검증 기록

- 기록일: 2026-09-08 (09-07부터 이어 수행)
- 저장소: `/Volumes/WAN2/apps/story-maker`
- 브랜치: `u1-10-chat-player-readability-20260905`
- 비교 기준: 세션 시작 fetch 후 로컬/원격 작업 브랜치 `e3415df89f34e4ab33a3e019565a0b44f7acd7d4`.
  원격 main `cbe40aa8942ef0516206f8a0c895b957db7c090e`. 시작 작업 트리는 clean이었다.
- 실행: Work Lead. 교육 UX 주 책임, 접근성·프런트엔드·데이터 보존 관점 검토.
- 상태: 로컬 변경이며 commit/push/배포하지 않았다. 기존 PR CI는 이번 미커밋 변경의 증거가 아니다.

## 구현 범위

두 전래동화의 위기 직전 줄거리를 새 문장으로 구성했다. 토끼는 용궁에서 붙잡힌 뒤,
옹고집은 처음 재판장에 도착한 뒤 빈 컷을 연다. 결말·정답·분기 선택지는 제공하지 않는다.
새 빈 작품은 이야기 구성으로 진입한다. 편집/플레이는 같은 전체 배경·인물·남색 대사창을 쓴다.
태블릿 화면 구조는 유지하고 모바일의 중복 설명·설정을 접는다.

160자는 초기 화면 호흡 기준이다. 초과 입력/저장/가져오기를 보존하며 새 플레이 적용 시
해당 컷을 안내한다. 명시적 나누기는 원문·첫 ID·화자·무대·메모를 보존하고 즉시 되돌리기와
기존 복구 기록을 제공한다. 줄바꿈이 많으면 160자 이내라도 스크롤이 필요할 수 있다.

## 자동 검증

- `npm run check`: ESLint·TypeScript 통과.
- `npm test`: Vinext 프로덕션 빌드 포함 122/122 통과 (신규 회귀 2개 추가).
- `git diff --check`: 통과.
- 추가 회귀 13개: 두 틀의 시작점/열린 미래/자산/클론, 기존 저장본 보존,
  빈 이어쓰기 컷을 제외한 미리보기의 문서 유효성, 공식 8탭 Excel 왕복,
  공통 프레임/모바일 구조, 159·160·161자와 이모지·조합 문자,
  무손실 분할·ID/순서/무대 보존·중복 ID 실패, 저장 허용/적용 차단 경계,
  non-secure context(crypto.randomUUID 미지원 환경) 안전한 분할 ID fallback,
  플레이 복귀 시 이중 rAF를 통한 textarea ref/포커스 안전 복원 및 모바일 비활성 가이드 숨김.
- 500KB 초과 청크 및 Vinext route 분류 경고는 남는다. 새 의존성·자산 변경 없음.

## 실제 브라우저 조작 및 모바일 이슈 조치

Codex/Chrome 환경의 로컬 `http://127.0.0.1:3000/`에서 CDP 및 가상 뷰포트(390×844, 320×800)로 수행했다.
실제 모바일 기기(iOS Safari / Android Chrome) 접속 피드백을 바탕으로 3대 UX/디자인 개선을 완료했다.

| 항목 | 확인 결과 | 조치 사항 |
|---|---|---|
| HTTP 컷 나누기 | 로컬 IP/HTTP 접속 시 `crypto.randomUUID` 미지원 환경 시뮬레이션 | `splitLine`에 타임스탬프+카운터+난수 기반 안전한 fallback ID 생성기 적용 |
| 플레이 복귀 포커스 | 플레이어에서 '이 컷 고치기' 클릭 시 마운트 타이밍 레이스 컨디션 | `editorRestoreRequest`에 이중 `requestAnimationFrame` 적용하여 ref 바인딩 및 textarea 포커스/스크롤 완벽 복원 |
| 모바일 대본 정보량 | 대본 보기에서 비활성 컷마다 `0/160자` 가이드가 상시 노출되어 스크롤 가중 | `.script-scene-card:not(.active):not(:focus-within) .cut-length-guide:not(.over-limit) { display: none; }`로 비활성 정상 가이드 숨김 |
| 키보드 가림 완화 | 모바일에서 입력창 탭 시 소프트 키보드가 대사창과 하단 버튼을 가리는 현상 | 글쓰기 입력창 포커스 시 무대 캔버스 높이를 `clamp(100px, 26vw, 130px)`로 자동 축소하고 textarea `scroll-margin-bottom` 확보 |
| Safe Area (노치/홈바) | iOS Safari에서 Dynamic Island/홈바 제스처 선과 버튼 간섭 | `app/layout.tsx`에 `viewportFit: "cover"` 지정 및 상하단 툴바/컨트롤에 `env(safe-area-inset-*)` 여백 반영 |
| **글상자(대사창) 미화** | "해설은 괄호 없이 씁니다", "70/160자 · 공백 포함" 등 잡다한 시스템 문구가 대사창 안에 자리잡아 시각적 몰입 저해 | `stage-writing-help` 평상시 안내문구 제거(해설 괄호 위반 경고 시에만 노출), `CutLengthGuide`의 "· 공백 포함" 텍스트를 툴팁으로 전환하고 `70 / 160자` 우측 하단 은은한 카운터로 정리. 160자 초과 시에만 분할 배너 표시 |
| **한눈 뷰포트 (Above-the-fold)** | 컷 화면 진입 시 무대 높이(기존 180~280px)와 상단 바로 인해 대사창이 잘려 손으로 스크롤해야 하는 불편 | 모바일 캔버스 높이를 `clamp(125px, 34vw, 165px)`로 스마트 최적화하고 상단 여백 압축. 390×844 기준 대사창 하단 492px로 뷰포트 내 완벽 배치(스크롤 0px 한눈 뷰 달성) |
| **첫 메인화면 책 표지 아트워크** | 메인화면 첫인상이 평범한 웹 폼처럼 삭막했던 문제를 해결. 메인화면 상단에 용궁·조선 관아 배경과 토끼·자라·두 옹고집이 당당히 어우러진 웅장한 '명작 전래동화 그림책 표지(Book Cover)' 대형 아트워크 구축. 양장본 하드커버 질감, 금박 액자 프레임, 책갈피 탭과 표지 뱃지 적용. 템플릿 카드도 양장본 미니 동화책 표지 스타일로 연계 |
| 토끼 이어쓰기 | 빈 컷 → 앞 위기 확인 → 197자 입력 → 분할(11→12컷) → 되돌리기(197자 복원) → 재분할 → 적용 → 12/12 플레이 → 12컷 편집 복귀 확인 | 통과 |
| 옹고집 이어쓰기 | 빈 컷 → 대본 보기 전환 → 플레이 재생 → '편집으로 돌아가기' → 대본 화면 복귀 확인 | 통과 |
| 플레이/에디터 치수 | CSS 320×800, 390×844 모두 가로 넘침 0px, 조작 버튼 44px 이상 유지 | 통과 |

## 남은 검증·다음 실행

실제 iOS Safari/Android Chrome 하드웨어에서의 한글 천지인/두벌식 자모 조합 버퍼링,
소프트 키보드 팝업 시 물리 화면 가림, Safe Area(Dynamic Island/하단 홈바 제스처 선) 간섭,
실제 손가락 터치감은 시뮬레이션과 구분되는 미검증 영역이다.
실기기 검증은 `physical-device-verification-guide.md`에 따라 외부 IP(`http://192.168.x.x:3000`)로 접속하여 수행한다.
A1-02 후보 자산의 시각적 기준점은 사람의 승인이 필요하므로 임의 등록하지 않는다.

기준 소스는 `app/story-cut-length.ts`, `app/story-commands.ts`, `app/story-apply-issues.ts`,
`app/story-data.ts`, `app/components/{StoryStage,SceneFocusEditor,StoryPlayer,StartScreen,ScriptScreen,CutLengthGuide}.tsx`,
`app/StoryStudio.tsx`, `app/globals.css`다. 다음 세션은 상태표와 해당 카드부터 읽고
`npm run check`, `npm test`, `git diff --check` 및 영향받는 브라우저 흐름으로 검증한다.
