# 2026-09-09 안정화 재검토와 실행 증거

상태: 자동화 구현·로컬 검증 완료, PR #16/#17/#18 CI 성공 (PR #18 CI 34351709722, verify 3분42초). 사용자 요청에 따른 재검증 보고서이며 제품 사양을 대체하지 않는다.
주 책임 QA·릴리스, 검토 관점 데이터 신뢰성·교육 UX. Work Lead, G/A/B 증거.

## 확인한 기준선

- main `d545456ed1662a0aa55d20d966325f1ac4192976`, tree는 `67be51a`와 동일.
- 시작 로컬 `codex/story-experience`: 미커밋 없음, main과 tree 동일 (이력만 2 ahead/3 behind).
- PR #14 head `e7dc8d6`, base main, mergeable, verify run 34347041043 성공.
  package/lock 2개 파일: sharp 0.35.4, fflate 0.7.5. 다른 패키지 버전 교체 없음.
  lock의 일부 선택 의존성 libc 메타데이터 제거도 확인; Linux npm ci CI 성공.
- PR #15 head `b046d40`, base main, mergeable, verify 34347768813 성공.
  README/STATUS/개발 상태표 3개 파일. 상세 상태표의 이전 SHA·감사 7건 표현을 보완한다.
- #14와 #15는 파일이 겹치지 않아 상호 선행 조건 없음. 모두 사용자 병합 승인 대기.
- main CI 34346214614, Pages 34346214609 성공. deployment 6348751954의 SHA와 성공 URL 확인.
- main protected=false, rulesets=[] (읽기 API 확인). 설정 변경 시도하지 않음.
- Cloudflare Pages check가 main `d545456`에서 성공했고 preview check도 계속 생성된다.
  GitHub check만으로 Cloudflare production alias가 어느 SHA를 서비스하는지는 증명되지 않는다.
  Cloudflare dashboard의 production deployment SHA 확인은 MANUAL VERIFICATION REQUIRED.

## 재구성한 실행 계획

| ID / 순서 | 문제·사용자 영향 / 증거 | 범위·PR 단위 | 검증·DONE 조건 | 위험·사람 의존 |
|---|---|---|---|---|
| P0 | 직접 push/실패 코드 배포 가능; 보호 없음 | 기존 운영 계약에 설정 안내, #15 문서 정합화 | API/PR diff/링크 확인; 실제 설정은 승인 후 | 관리자 정책, 승인 필요 |
| ST-01 / P1 | 네 QA가 CI 밖, 개인 Chrome에 의존 | CI+browser harness 작은 독립 PR | 기존 169개 유지, check·static build·4 suites, Linux CI 성공과 실패 artifact | 실행시간/OS flaky; 한 프로세스씩, timeout |
| ST-02 / P1 | 원작 결말 하나씩만 브라우저 검사 | 그래프·원작 QA 별도 PR, ST-01 기반 | 신규 도달 불가 검출·모든 edge 검사·무순환, 모든 결말 대표 재생, 이전·재선택·저장 격리 | 긴 경로는 실행시간 측정 |
| ST-03 / P2 | 모바일 emulation과 실제 입력 증거 혼동 | QA만 별도 PR 및 기존 실기기 가이드 | 터치 모사/회전/축소/초점 자동 검사; 실제 두 OS는 기록지 | IME·키보드·safe area는 사람 필요 |
| P2 Sheet | CSV/parser 방어 풍부, 실제 공유 fixture 없음 | 기존 mock UI 확대; OAuth 추가 금지 | 정상/선택 탭 없음/권한·로그인 오류, 학생 draft 보존 | 실제 공유 시트만 MANUAL BLOCKER |
| P2 배포 | Pages push 워크플로가 verify와 독립 | 별도 release 정책 카드 | 동일 SHA의 성공 CI artifact만 배포하는 계약·시험 | 공개 배포/환경 정책 승인 필요 |
| P3 구조 | Studio 3307줄/118899B, CSS 11178줄/244665B | DEFERRED; 메모 등 변경 빈도 확인 후 단일 hook | UI/키/형식 동일 + smoke 통과 | CSS 순서·상태 stale closure 위험; 전면 분리 제외 |
| P3 A1-02 | 자동 asset audit는 이미 존재 | 기존 A1-02 유지 | 후보 승인+무대 검수 | BLOCKED — HUMAN VISUAL APPROVAL |
| 후속 Narrative | 옹고집전 감정선·분기 설득력 | 기술 PR 뒤 별도 Story Revision | 교사/편집자 경로별 평가 | 의미·연출 적절성은 코드 통과로 대체 불가 |

P2 그래프 검사를 새로 만든다는 가정은 제거했다. 기존 findStoryFlowIssues가
연결 오류·순환을 검사하고 Node 예시 검사도 도달 경로를 순회한다. 부족한 단언과
브라우저 경로 범위만 확장한다. 모바일 화면 크기 전수 검사는 보존하고 CI 기본은
1365×900/390×844로 줄인다. 전체 뷰포트는 QA_VIEWPORTS로 재실행한다.

## 추가 고위험 누락의 평가

각 1~5 상대척도, 비용은 클수록 비쌈. 우선순위 참고이며 확률의 실측값이 아니다.

| 발견 | 사용자 영향 × 가능성 / 비용 | 판단 |
|---|---|---|
| CI와 무관한 main Pages 배포 | 5 × 3 / 2 | release 후속 우선; main 보호와 함께 해결 |
| QA의 외부 Chrome/Playwright 설치 의존 | 4 × 5 / 2 | ST-01에서 고정 설치 |
| 예시 저장 격리 검사가 빈 draft(null)만 비교 | 5 × 3 / 1 | ST-02에서 실제 학생 fixture 및 active/backup/checkpoint 비교 |
| 상태표 내부 서로 다른 최신 SHA·보안 수 | 3 × 4 / 1 | #15 보완 |
| 500ms 저장 대기와 모바일 강제 종료 | 5 × 2 / 3 | pagehide flush 이미 있음; 실제 OS 종료/용량 검증은 남음. 재현 없는 저장 rewrite 제외 |
| 큰 Studio/CSS | 3 × 2 / 4 | 당장 리팩터링보다 회귀 게이트 우선 |
| 명시적 앱 error boundary 없음 | 4 × 2 / 2 | 렌더 예외 시 복구 안내가 부족; 안전한 재시도 화면을 별도 P2 카드로 검토 |

## 기존 방어 확인과 한계

- 저장: repository의 실패 결과, v1 변환, checkpoint/backup, pagehide flush 코드와 회귀가 있다.
  탭 강제 종료/OS 메모리 회수/실제 quota를 모두 증명한 것은 아니다.
- Excel: 실제 XLSX 왕복과 8탭·legacy 회귀가 있다. memo-integration은 긴 개행/따옴표,
  장 범위·분기·표지와 CSV 가져오기까지 비교한다.
- Sheet: 500/403/network/login HTML/abort와 선택 메모 탭 404를 이미 검사한다.
  공유 가능한 실제 테스트 시트가 저장소에 없고 테스트 URL은 fixture다.
- 오류 경계: app/error.tsx 또는 명시적 ErrorBoundary가 없다. QA는 pageerror를 실패 처리하지만
  예기치 않은 렌더 예외에서 학생에게 복구 행동을 안내하는 제품 방어는 후속 범위다.
  에러 화면에서 저장본을 덮어쓰지 않는 인수 조건이 필요하다.
- 모바일 CSS: safe-area env와 dvh 규칙은 존재한다. useFloatingMemo는 innerHeight/resize로
  맞추며 visualViewport를 직접 사용하지 않는다. 실제 soft keyboard 동작은 실기기 확인 대상이다.
- 접근성: start screen의 모달 초점·Escape·탭 이동·44px, flow 선택지 키보드 검사가 있다.
  앱 전체 접근성 감사나 스크린리더 합격으로 확대 해석하지 않는다.
- 성능: 원작은 StoryStudio에서 dynamic import한다. 큰 청크 경고는 존재;
  최초 네트워크/저사양 실기기 성능을 이번 정적 분석으로 점수 확정하지 않는다.
- 자산: character-asset-audit와 회귀가 이미 있다. 후보 이미지 등록/치환 없이
  사람 승인 대기를 유지한다. story-example-source-v1 원본 계약 보존.
- 보안: #14의 8→2는 Linux registry 감사 증거. 로컬 macOS 설치 로그는 7건으로 달랐다.
  플랫폼·시점별 수치를 섞지 않는다. image-size 경로는 개발/빌드 도구이며 정적 Pages
  학생 입력에 바로 노출되는 서버 API는 없다. 강제 beta/fork 전환은 제외한다.

## 재현과 외부 확인

- main/PR: `git fetch origin`, `gh pr view 14`, `gh pr view 15`, `gh run list`.
- 보호: `gh api repos/LUCKYBRIDGE/story-maker/branches/main`,
  `gh api repos/LUCKYBRIDGE/story-maker/rulesets`.
- 브라우저: ST-01 PR에서 `npm ci`, `npx playwright install chromium`,
  `npm run build:github`, `npm run qa:smoke`. Linux는 install --with-deps chromium.
- 기존 전체 gate: `npm run check`, `npm test`. G/A 통과와 D 미검증을 분리한다.
- main merge, 보호 설정, production 배포는 이 세션에서 수행하지 않는다.


## 완료한 작업과 증거

1. PR #14 보안 재검토: main 상당 lockfile 감사 8건(1 moderate/7 high), #14 정확한
   head의 package-lock-only 최신 registry 감사 2 high(image-size/vinext) 재현.
   기존 강제 업그레이드 제외 결정을 유지. main 미반영.
2. PR #15 보완: 상세 상태표 SHA/감사 값 정정, 운영 계약 main 보호 정확한 설정,
   본 재검토 보고서. 문서만 변경; 코드 빌드 수동 반복 없음.
3. [PR #16](https://github.com/LUCKYBRIDGE/story-maker/pull/16): CI/개발 의존성/브라우저 harness.
   [CI 34350483098](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34350483098)
   169/169, check, static build, 4 suite 성공. 전체 verify 3분12초, browser 약 73초.
   로컬 1×1 viewport 실패 주입 시 exit 1, failure PNG/JSON/trace.zip/run.log 생성 확인.
4. [PR #17](https://github.com/LUCKYBRIDGE/story-maker/pull/17): tests/helper·원작 QA·원본 ADR.
   [CI 34350971983](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34350971983)
   기존 169+신규 3=172/172, check, build, browser 성공. 전체 verify 3분15초,
   browser 약 85초. 다섯 결말 대표 경로의 종료·이전/재선택·학생 네 저장 키 보존.
5. [PR #18](https://github.com/LUCKYBRIDGE/story-maker/pull/18): touch/Sheet QA·실기기 matrix.
   [CI 34351709722](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34351709722)
   172/172 pass, check, static build, smoke 4 suite(desktop/mobile), classroom 2 suite(mobile-input, sheet-import) 성공. 전체 verify 3분42초.
   로컬 qa:classroom 약 9초, check 성공. Google CSV 요청은 응답 주입이며 실제 계정 아님.
   정상 import 확인 전 무변경, 확인 후 원본 checkpoint 보존, 오류 시 draft/active 보존.
6. 자산 자동 재감사: 등록 자산 참조 108개, 누락 0/중복 ID 0. 기존 이미지 audit를
   산출물 변경 없이 실행: 88파일(등록 70/후보 18), KEEP 15, MANUAL-REVIEW 71,
   NORMALIZE-TRANSLATE 1, LEGACY 1, REJECT 0. '후보 71개'가 아니라 전체 감사 중
   사람 검토 분류 71개다. 승인/등록 변경은 하지 않았다.

원작 그래프 추가 발견: 옹고집전 453컷 중 원본부터 분리된 5경로 108컷.
그 목록을 명시적으로 고정하고 새 도달 불가를 실패 처리한다. 원문을 삭제하거나
임의 연결하지 않았다. 이 내용은 Narrative Audit의 실제 검토 항목이다.

## 남은 작업과 사람 검증

- #14/#15/#16은 main 기준. #17은 #16 기반, #18은 #17 기반의 작은 연속 PR.
  승인 후 #16→#17→#18 순으로 base를 main에 재지정하고 충돌·CI를 재확인한다.
  #14 package/lock 및 #15 상태표는 QA PR과 일부 파일을 공유한다. merge-tree 검사에서
  #14와 QA 합성은 충돌 없음. #15의 요약 삽입 위치를 옮겨 QA 상태 기록과의
  충돌도 해소했다. 이는 합성 가능성 검사이며 실제 main merge는 아니다.
- 모든 PR은 main 미병합. 자동 Cloudflare preview check는 GitHub 통합에 의해 실행;
  이 작업이 production 배포를 요청한 것은 아니다.
- main 보호 설정, Pages 성공 CI와 동일 SHA 배포 계약: 관리자 승인/후속 release 작업.
- iOS Safari/Android Chrome 실제 IME·키보드·safe area·finger drag·파일 선택기:
  **MANUAL VERIFICATION REQUIRED**, 기존 physical-device-verification-guide 사용.
- 실제 공유 Google Sheet: 공개 테스트 URL/권한 fixture가 없어 **MANUAL BLOCKER**.
  교사가 제공한 비개인 테스트 작품으로 정상·optional 없음·접근 철회 후 오류를 확인한다.
- Cloudflare production alias/SHA: dashboard 확인 필요. main check 성공은 확인했으나
  production serving SHA를 입증하지 못했으므로 사용 중단/불필요 경로라고 단정하지 않는다.
- A1-02: **BLOCKED — HUMAN VISUAL APPROVAL**. 자동 audit 판정을 승인으로 바꾸지 않는다.
- Studio/CSS 분리는 DEFERRED. useFloatingMemo는 이미 별도 hook이며 저장 repository,
  queue·checkpoint·navigation helpers도 존재한다. 실제 변경 위험을 좁힌 뒤 단일 훅만 검토.
- 옹고집전 Narrative Quality Audit는 별도 과제: 분리된 원본 경로 처리 의도와 감정선,
  선택 설득력·대사·연출을 교사/편집자가 검토한다.

## 제품 안정성 평가 (10점 척도)

테스트 합격률이나 확률이 아닌 증거 기반의 주관적 우선순위 평가다. 새 QA는 PR에서
검증됐지만 main에 통합되지 않았다. 특히 운영 보호·실기기 항목을 과대평가하지 않는다.

| 영역 | 점수 | 근거와 한계 |
|---|---:|---|
| 핵심 창작 기능 | 8 | 기존 회귀+desktop/mobile smoke; 실제 교실 파일럿 미완료 |
| 선택/분기 | 8 | 3갈래·합류·재선택·5결말; 원본 분리108컷 의도 검토 남음 |
| 저장 안정성 | 8 | v1/queue/checkpoint/실패 보존·예시 격리; OS 강제 종료 미검증 |
| Excel | 8 | 실제 XLSX/8탭/legacy/긴 메모 왕복; 모바일 OS picker 미검증 |
| Google Sheet | 7 | parser+오류+UI fixture; 실제 Google 공유 계정 미검증 |
| 브라우저 회귀 방지 | 8 | 새 PR에 정적 CI gate; main 미통합·장기 flaky 표본 부족 |
| 모바일 준비도 | 6 | touch·rotation·초점 자동 검사; 실제 두 OS IME/키보드 미검증 |
| 접근성 | 6 | 일부 모달/키보드/44px 확인; 앱 전체·스크린리더 감사 미완료 |
| 배포 신뢰성 | 6 | Pages SHA 성공; 보호 없음·CI와 독립 배포·CF alias 불명확 |
| 보안 | 6 | main 감사8, #14 후보2; 승인 전 미반영·upstream 잔여 |
| 유지보수성 | 6 | 도메인 일부 분리·172개 검사; 큰 상위 조정자/CSS 결합 |
| 문서 신뢰성 | 8 | #15 보완과 실제 증거 연결; 통합 전 snapshot/PR 상태 구분 필요 |

## 수업 가치를 기준으로 다음 세 작업

1. 승인된 보안 패치·QA PR 통합과 main 보호/검증 후 배포: 수업 직전 실패 버전 노출 방지.
2. 실제 iOS/Android에서 글쓰기→메모→Excel 백업→재접속 15분 파일럿:
   조합 입력·키보드·복구를 확인해 학생 작품 유실과 교사 지원 부담 감소.
3. 옹고집전 Narrative Audit/Revision: 분리108컷의 의도와 결말·선택 설득력,
   대사/감정선을 별도 작은 이야기 PR로 개선. 안정화 PR과 혼합하지 않는다.
