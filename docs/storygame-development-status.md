# storygame 개발 상태표

- 기준일: 2026-09-13
- 공유 기준 저장소: GitHub `LUCKYBRIDGE/story-maker`의 `main`과 현재 작업 PR
- 로컬 실행 복사본: `/Volumes/WAN2/apps/story-maker` (Work/로컬 실행·실환경 검증용)
- 실행 환경 계약: `docs/operations/github-first-hybrid-development.md`
- 실행 절차: `docs/storygame-ai-implementation-runbook.md`
- 작업 계약: `docs/tasks/storygame-atomic-task-cards.md`
- 규칙: 대기 시 `READY`는 정확히 하나, 실행 중에는 그 작업만 `IN_PROGRESS`다.
  승인·외부 조건 대기 때문에 READY가 없으면 이유를 기록하고 구현을 멈춘다.

## 현재 작업: START-01 시작 화면 놀스토리 표지 새로고침(전환) 버튼 추가

- 2026-09-13 사용자 요청(시작 화면 "놀스토리" 옆에 작은 새로고침 버튼을 두고 클릭 시 현재 준비된 토끼와 자라 / 옹고집전 표지로 상호 전환)으로 진행, **DONE — 2026-09-13 로컬 구현·검증**, Work Lead · G/A/B.
- 기준 `origin/codex/library-blank-book-aesthetic` (`7cc6e15`), branch `codex/start-screen-theme-toggle`.
- `StartScreen.tsx`: `.poster-brand-title` 그룹화, `onToggleTheme` 콜백 연결, 회전 화살표 SVG 아이콘 버튼(`.poster-theme-refresh`) 추가, 전환 대상 이야기 이름을 안내하는 `aria-label` 및 `title` 부여.
- `StoryStudio.tsx`: `onToggleTheme={() => setSelectedStoryTheme(t => t === "rabbit" ? "onggojib" : "rabbit")}`로 시작 화면 표지 및 "이야기 읽기" 대상 동적 전환 연결.
- `globals.css`: `.poster-brand > svg` 격리로 버튼 내부 SVG 오염 방지, 28px 골드/페이퍼 원형 서클 버튼 스타일링, hover 시 90도/active 시 180도 부드러운 회전 트랜지션, 12개 뷰포트 전체에서 브랜드 텍스트 높이 변화 0 (`themeShift: 0`) 달성.
- `npm run check`, `npm test`(빌드+200/200), `git diff --check` 통과.
- `start-screen.mjs` 12개 뷰포트 전체 레이아웃 쉬프트 0, 브라우저 실환경 스크린샷 검증 완료 (`outputs/start-toggle-*.png`).
- 작업 브랜치 로컬 커밋 및 PR/동기화 준비 완료.

## 최근 완료: SHELF-01 서재 '새 이야기' 반투명 와이어프레임 박스 글자 줄바꿈 및 선반 충돌 개선

- 2026-09-13 사용자 피드백(철사형 반투명 와이어프레임 박스 디자인 선호 반영, 글씨 어색한 쪼개짐 및 선반 넘침 방지)으로 진행, **DONE — 2026-09-13 로컬 구현·검증 (PR #29 대기)**, Work Lead · G/A/B.
- 기준 `origin/main` `67a05f6`, branch `codex/library-blank-book-aesthetic`.
- 사용자가 선호하는 고유의 철사형 반투명 와이어프레임 박스(`.blank-book-cover`) 디자인과 서재의 감성을 온전히 보존.
- 컨테이너 쿼리 단위(`cqw`) 도입 및 `white-space: nowrap; word-break: keep-all; text-wrap: nowrap;`로 "새 이야기" 단어가 `새 이야` / `기`로 어색하게 쪼개지는 현상 원천 해결.
- `max-height: 100%`, `overflow: hidden`, `aspect-ratio: 1 / 1.4` 및 `.shelf-book` 폭 비율 정돈(`.52`)으로 1280×800 등 데스크톱·태블릿에서 플렉스 팽창으로 상단 목재 선반을 뚫고 올라가는 레이아웃 파괴 완전 차단.
- `npm run check`, `npm test`(빌드+200/200), `git diff --check` 통과.
- `library-craft.mjs`: 1365×900, 1280×800, 820×1180, 390×844, 320×740 전 뷰포트 선반 높이/클리어런스/1행 타이틀 검증 통과.
- `library-motion.mjs`: FLIP 애니메이션 및 모션 축소 통과.
- PR #29 오픈 상태.

## 최근 완료: POSTER-01 시작 화면 포스터 여백 및 프레이밍 최적화

- 2026-09-13 사용자 피드백(포스터 상·하단 빈 여백 고려로 인한 과도한 공백 및 심미성 저하)으로 진행, **DONE — 2026-09-13 main 병합(PR #28, 67a05f6)**, Work Lead · G/A/B.
- 기준 `origin/main` `c5d150ea6746c9469d4d5f7ce1e4ab6378f504ff`, branch `codex/poster-framing-aesthetic`.
- 원본 포스터 아트(940×1672) 내부의 상단 빈 하늘(23%) 및 하단 빈 안개(16%) 영역을 걷어내고, 실제 일러스트의 자연스러운 구도(약 10:11)에 맞춰 `.poster-scene-space`의 종횡비를 10/11로 조정, 이미지를 `object-fit: cover; object-position: center 54.5%;`로 배치.
- 옹고집전 및 토끼와 자라 테마 모두에서 소나무·기와집부터 인물, 강아지, 연못, 돌길·꽃까지 의미 있는 장면은 100% 온전히 보존하면서 불필요한 이중 여백을 제거하여 모바일(390×844) 스크롤 방지 및 심미성 대폭 향상.
- `npm run check`, `npm test`(빌드+200/200), `git diff --check` 통과.
- PR #28 생성 후 main 병합 완료 (`67a05f6`). CI 및 배포 통과.

## 최근 완료: IMG-01 이미지·무대 레이아웃 안전화

- 2026-09-12 사용자 첨부 요청으로 승인, **DONE — 2026-09-13 main 병합(PR #27, c5d150e)**, Work Lead · G/A/B.
- 기준 `origin/main` `002f844bb6373362b46b507481edef947a8990ba`, branch `codex/image-layout-safety`. 시작 시 로컬 변경 없음.
- 범위와 인수 조건은 IMG-01 카드. 이미지 역할별 crop, 글상자와 무대 연동, 인물 확대·framing·표지 안전 영역 및 브라우저 회귀를 검증한다.
- 저장/Excel/공유 파일/원본 자산/배포 형식 보존. 다음 READY 없음.
- 포스터 contain/비율 확보, 장면·풍경 backgroundRole 생성기, 실제 무대/장식 backdrop 분리, 글상자 변수 연동, 자연 치수·알파 발 기준과 framing별 슬롯, 표지 안전 좌우 배치 구현. 후속 사용자 결정대로 하단 일부 겹침 허용, 상반신 이상 보존. 표시 계약은 상세 설계 §8.1.
- `npm run check`, `npm test` 빌드+200/200, `git diff --check` 통과. `/tmp/image-layout-{check,tests}-final.log`.
- `image-layout-safety.mjs`: 14 viewport × framing3 × dock4 × scale4 = 672 조합, 표지3배치 × framing3 × 위치3 × viewport3 = 81 조합 통과. 실제 배율·비율·발선·상반신·무대 경계·배경 crop·가로 넘침 assertion. `outputs/image-layout-safety/results.json` 및 대표 PNG.
- viewport: 320×740, 360×800, 390×844, 720×450, 844×390, 768×1024, 820×1180, 1024×768, 1280×720, 1365×900, 1440×900, 1920×1080, 667×375, 932×430. 편집/썸네일 경계는390/844/820/1365px에서 배율4종 추가 확인.
- start-screen, display-settings, reader-layout, reader-history, reader-book, library-craft, docked-cuts 통과. 최종 qa:smoke의 start-screen/story-flow/sticky-memos/pinky-examples/library-home 5개 통과, `outputs/image-layout-smoke-final/results.json`. 긴 글·선택·기록·새로고침·표지·서재·편집·파일 가져오기 보존.
- 오래된 진입 selector를 현재 홈 경로로 변경. 표시 설정 검사는 위치 동일 대신 크기 동일/상향 이동으로, 포스터 theme 비교는 스크롤과 독립인 문서 좌표로 수정. 이전 story-flow 1회 적용 대기 실패는 소스 변경 없이 최종 재실행 통과; 숨기거나 assertion을 완화하지 않음.
- 실제 상반신 framing 자산은 현재0개여서 공통 정책은 DOM framing fixture로 검증. 현재 배경38개 육안 확인, 대표 포스터/무대/표지 PNG 육안 확인. 실제 iOS/Android·키보드/OS 파일창은 미검증. 극단 설정은 필요 시 세로 스크롤, 원본 포스터 자체의 종이 여백은 보존.
- PR #27 생성 후 main 병합 완료 (`c5d150ea6746c9469d4d5f7ce1e4ab6378f504ff`). CI 및 Pages 배포 통과.

## 최근 완료: IA-01 서재 홈과 작업 화면 정돈

- 2026-09-12 사용자 첨부 요청으로 승인, **DONE — 로컬 구현·검증**, Work Lead · G/A/B.
- root `/Volumes/WAN2/apps/story-maker`, branch `codex/library-home-workspace`, 기준 `origin/main` 7520b04. 기존 로컬 변경 없음.
- 범위·인수 조건은 IA-01 카드. 방문 정책, 관리 역할, 브랜드, 공통 표현, 편집 위치와 서재 위계를 순서대로 구현한다. 데이터·파일 형식·이미지·Router는 보존한다.
- 첫 방문 Landing/재방문 Library, 손상·이전 버전·차단 저장소 대응, 포스터 깜빡임 없는 SSR 준비 화면. 같은 탭 편집·읽기 복원 유지.
- 창작 관리는 백업·가져오기·삭제·Excel/복구 진입, 서재는 읽기·편집·생성. 제목·소개·표지는 펼침 영역, 위치는 머리말 한 곳, 세 단계·두 보기·네 탭 상시 제공. 모바일 탭 44px 보완. 브랜드 놀스토리, 저작권 © 놀퀴즈 보존.
- 기준선 198/198, 구현 후 `npm run check`, `npm test`(빌드+199/199), `git diff --check`와 변경 문서 내부 링크 검사 통과. `/tmp/library-home-{baseline,check,tests}.log`.
- B: `qa:smoke` 5개(start-screen/story-flow/sticky-memos/pinky-examples/library-home), `qa:classroom` 2개, library-craft/library-motion/player-continuity 통과. `/tmp/library-home-{smoke,classroom,craft,motion,continuity,browser}.log`.
- 1440×900/1280×720/1024×768/820×1180/390×844/844×390/320×740/720×450(200% 확대의 가용 크기)에서 위치·보기·탭·44px·가로 넘침·저장/새로고침·백업·표지 대화상자 취소/초점 확인. `/tmp/library-home-qa/`, `/tmp/library-home-smoke/` 캡처 육안 확인.
- 실제 iOS/Android 키보드와 OS 파일 선택창, 실제 Google 서버는 미검증. 시트는 응답 fixture, 200%는 가용 크기 등가 검사다. 준비 중 기능은 완료 조건에서 제외했다.
- 작업 branch `codex/library-home-workspace`에서 초안 PR로 공유한다. main 병합·공개 배포 없음. 다음 READY 없음.

## 최근 완료: PLAY-UI-01 화면 복원과 읽기 표시 설정

- 2026-09-12 사용자 요청 및 후속 결정. **DONE — 로컬 구현·검증**.
- © 놀퀴즈, 같은 탭 화면/읽던 컷/선택 기록 복원, 하단35% 고정 글상자와20~60% 조절, 인물 그룹별 균일 크기 설정.
- 기존 작품 저장 형식·원본 이미지 유지. 표시 설정 localStorage/화면 sessionStorage 분리. 상세 계약은 PLAY-UI-01 카드.
- 화면 설정에서 글상자20~60%/기본35%, 인물별40~140%/기본값 복원. 동일 인물 그룹의 포즈·편집 미리보기·썸네일 공유. 아이 기본62%와 어린 자라72%, 발 기준 균일 배율 유지.
- 서재 필터·페이지·팝업, 편집 위치, 읽기 컷·표지·실제 선택 경로·종료 선택을 같은 탭 새로고침 후 복원. 공유 읽기 스냅숏은 기존 validator를 통과한 경우에만 복원한다.
- `npm run check`, `npm test`(빌드+198개), `git diff --check` 통과. `/tmp/display-settings-{check,tests}.log`.
- 브라우저: player-continuity, display-settings, reader-layout, reader-history, library-craft 통과. 390×844/1365×900/1380×1412/844×390에서35% 고정·변경·초기화·동일 인물 다른 포즈·새로고침·선택 기록·편집 복원·키보드·스크롤 확인. `/tmp/player-continuity.log`, `/tmp/display-settings-{browser,layout,history}.log`, `/tmp/player-fix-library.log`; screenshot `/tmp/player-continuity-qa/`, `/tmp/display-settings-qa/` 육안 확인.
- 로컬 `codex/library-craft`에 적용. 커밋·푸시·배포 없음. 실제 기기 OS와 저장이 차단된 환경의 영구 복원은 미검증/미보장. 다음 READY 없음.


## 최근 완료: HOME-01 상단 메뉴와 하단 읽기

- 2026-09-12 사용자 요청. **DONE — 로컬 구현·검증**.
- 상단에 이야기 변경/나만의 이야기/서재 입장 3개 메뉴를 두고 하단 중앙 버튼은 이야기 읽기로 변경했다. 읽기는 현재 선택된 기본 작품의 읽기 표지를 열며 이야기 펼치기로 재생한다.
- `npm run check`, `start-screen.mjs`의 320×740, 390×844, 820×1180, 1365×900 검사, `git diff --check` 통과. 이야기 변경 후 읽기, 서재 입장, 창작 관리·키보드 복귀, 44px 터치 영역, 가로 넘침 없음 확인. `/tmp/home-nav-{check,browser}.log`, `/tmp/start-screen-qa/` screenshot.
- 로컬 `codex/library-craft` 적용. 커밋·푸시·배포 없음. 실제 기기 OS 미검증. 다음 READY 없음.

## 최근 완료: LIB-11 빈 윤곽 책으로 새 이야기 시작

- 2026-09-12 하단 두 버튼을 제거하고 빈 책으로 생성 팝업을 여는 사용자 요청. **DONE — 로컬 구현·검증**.
- 모든 책/내 작품에서 기존 이야기 다음 순서에 윤곽 책을 추가했다. 실제 이야기 수에는 제외하고 페이지 용량에는 포함한다. 기존 확대 팝업의 빈 작품 생성·전래동화 이어쓰기·외부 파일 가져오기 안내 재사용.
- `npm run check`, `library-craft.mjs`, `library-motion.mjs`, `git diff --check` 통과. 로그 `/tmp/library-blank-{check,browser,motion}.log`. 1365/820/390/320px에서 빈 책 선택·확대·Escape 초점 복원·Enter 재진입·실제 생성, 기존 읽기/편집/공유/페이지/리사이즈 검증. screenshot `/tmp/library-craft-qa/new-book-*.png` 및 서재 확인.
- 후속 결정: 빈 책은 기존 이야기 뒤에 일반 순서로 배치한다. 우측 고정은 하지 않으며 행이 차면 다음 행 왼쪽, 단독이면 첫 행 왼쪽에 놓는다. 줄바꿈·단독 왼쪽 정렬 검사를 추가했으며 check·library-motion·diff 검사 통과. 로그 `/tmp/library-order-{check,motion}.log`.
- 로컬 `codex/library-craft`에 적용. 커밋·푸시·배포 없음. 실제 기기 OS 미검증. 다음 READY 없음.

## 최근 완료: LIB-10 책의 선반 안쪽 배치

- 2026-09-12 책이 더 안쪽에 들어가 보이도록 후속 요청. **DONE — 로컬 구현·검증**.
- 서재 책 너비 비율 .56→.52, 밑면 위치 .20→.205, 종이 단면과 바깥 그림자 축소, 밀착 그림자 및 hover 이동 1px 적용. 선택/읽기 표지와 데이터 유지.
- `npm run check`, `library-motion.mjs`, `library-craft.mjs`, `git diff --check` 통과. 로그 `/tmp/library-inset-{check,motion,browser}.log`. 4가지 화면 크기의 읽기·편집 진입·키보드·페이지·리사이즈 확인, 가로/세로 화면의 책 안착 육안 확인.
- 로컬 적용만 수행. 커밋·푸시·배포 없음. 실제 기기 OS 미검증. 다음 READY 없음.

## 최근 완료: LIB-09 참고 이미지의 목재 깊이와 하단 전경

- 2026-09-12 사용자 참고 이미지에 맞춘 후속 조정. **DONE — 로컬 구현·검증**.
- 책장 내부 상단/양옆의 음영과 선반 앞면의 밝기를 분리하고, 기둥과 테두리 갈색을 맞췄다. 책 너비 비율 .54→.56, 전경은 아래 모서리 쪽으로 이동했다. 기존 소품·벽·마루·2/3단 구조 유지.
- `npm run check`, `library-motion.mjs`, `library-craft.mjs`, `git diff --check` 통과. 로그 `/tmp/library-warm-{check,motion,browser}.log`. 4가지 크기에서 읽기·편집 진입·키보드·페이지 이동 및 리사이즈 확인, 가로/세로 screenshot 육안 확인.
- `codex/library-craft` 로컬 반영. 커밋·푸시·배포 없음. 실제 기기 OS는 미검증. 다음 READY 없음.

## 최근 완료: LIB-08 전경 가구 크기와 화면 가장자리 구도

- 2026-09-12 사용자 요청: 전경 소품이 미니어처처럼 보이는 문제 수정. 소품 전체 노출은 요구가 아니며 화면 경계에서 일부만 보여도 된다. **DONE — 로컬 구현·검증**.
- 전경 가구는 큰 크기와 원래 비율을 유지하고 좌우·아래 화면 밖으로 배치한다. 모바일은 축소 대신 노출 폭을 줄인다. 화면 내부 잘림은 금지한다.
- LIB-07의 전체 윤곽 노출/방 하단 일치 검증은 이번 사용자 결정으로 대체했다. 투명 원본과 기존 책장·책·데이터는 유지한다.
- `npm run check`, `library-motion.mjs`, `library-craft.mjs`, `git diff --check` 통과. `/tmp/library-scale-{check,motion,browser}.log`. 1365×900, 820×1180, 390×844, 320×740 흐름 및 연속 리사이즈 확인. 가로·세로와 여러 권 화면 육안 확인.
- `codex/library-craft` 로컬 적용만 수행. 커밋·푸시·배포 없음. 실제 기기 OS는 미검증. 다음 READY 없음.

## 최근 완료: LIB-07 소품 톤과 전경 초점 (로컬)

- 사용자 요청: 통일된 재질·색감과 전경의 얕은 심도, 잎과 소품의 부자연스러운 잘림 제거. **DONE — 로컬 구현·검증**.
- 배경에 합쳐진 우측 식물을 제거하고, 전체 윤곽이 담긴 투명 식물·책 더미와 의자·램프를 각각 생성했다. 원래 비율 전체를 표시하며 방 하단에 고정한다. 윗판 식물은 기둥 앞에 자연스럽게 겹친다.
- 소품은 비상호작용/접근성 트리 제외, 전경만 약한 흐림. 이전 배경·소재는 보존했다.
- `npm run check`, `library-craft.mjs`, `library-motion.mjs`, `git diff --check` 통과. 로그 `/tmp/library-depth-{check,browser,motion}.log`. 1365×900, 820×1180, 390×844, 320×740의 읽기·편집 진입·키보드·페이지 이동 및 연속 리사이즈 확인. 방 하단 정렬 검증 추가.
- `/tmp/library-motion-qa/` 가로/세로 실화면에서 소품의 온전한 윤곽, 바닥 배치, 가로 넘침 없음 확인. 실제 기기 OS는 미검증.
- `codex/library-craft` 로컬 변경만 적용. 커밋·푸시·배포 없음. 다음 READY 없음.

## 최근 완료: LIB-06 갈색 목재·주변 화분·책 안착 (로컬)

- 사용자 첨부 참고 색감, 책을 가리지 않는 장식, 일자 기둥·책 안착 후속 요청, **DONE — 로컬 구현·검증**.
- warm finish로 중간 갈색 적용. 투명 화분 `public/library/pothos-pot.webp`을 윗판 우측에 올리고
  잎은 기둥 주변으로 내렸다. 모바일 축소/별도 여백, pointer-events none/aria-hidden 처리.
- 선반의 반복 이미지와 독립된 양쪽 세로 기둥을 만들어 가로 굴곡을 제거했다.
  서재 책만 종이 단면/바깥 그림자를 줄이고 선반 윗면에 접촉 그림자를 적용, hover 이동은3px로 줄였다.
  선택 화면의 표지 연출은 유지했다.
- `npm run check`, `library-craft.mjs`, `library-motion.mjs`, `git diff --check` 통과.
  로그 `/tmp/library-seated-check.log`, `/tmp/library-seated-browser.log`, `/tmp/library-seated-motion.log`.
  desktop/mobile 및 여러 권 screenshot `/tmp/library-motion-qa/`, `/tmp/library-craft-qa/` 확인.
- 기존 로컬 branch `codex/library-craft`와 모든 변경 보존. 이전 배경·소재 보존. 저장 형식 변경 없음.
- 커밋·푸시·배포 없음. `http://localhost:3003/` 적용. 실제 기기 OS는 별도 미검증. 다음 READY 없음.

## 최근 완료: LIB-05 부드러운 오크·벽과 마루 공간 (로컬 후보)

- 사용자 후속 요청: 강한 대비를 줄인 새 책장 후보, 책상 대신 벽 앞 마루 위에 선 책장. **DONE — 로컬 구현·검증 / 사용자 취향 평가 대기**.
- `codex/library-craft` 기존 변경 보존. 새 soft finish와 parquet room을 built-in imagegen으로 생성했다.
  `public/library/oak-shelf-soft.webp`, `parquet-room.webp`; 이전 소재·CSS·설정은 보존해 복원 가능하다.
- 밝은 무광 오크와 옅은 그림자, 책장 하부 받침을 적용하고 벽/마루 경계를 책장 높이에 맞춰 자동 정렬한다.
  소재별 선반 윗선에 책 밑면을 맞췄다. 2/3단 및 반응형 연출 유지.
- `npm run check`, `library-craft.mjs`, `library-motion.mjs`, `git diff --check` 통과.
  desktop/mobile 실화면에서 낮은 대비, 마루 위 받침, 선반 정렬 확인. 기존 책·읽기·키보드·공유·페이지 회귀 통과.
- 로그 `/tmp/library-soft-check.log`, `/tmp/library-soft-browser.log`, `/tmp/library-soft-motion.log`.
  화면 `/tmp/library-motion-qa/landscape.png`, portrait-phone.png. 실제 기기 OS는 별도 미검증.
- 커밋·푸시·배포 없음. `http://localhost:3003/`에 새 후보 적용. 다음 READY 없음.

## 최근 완료: LIB-04 책장 기본 단수와 반응형 연출 (로컬)

- 사용자 후속 결정: 가로 기본 2단 이상, 세로로 긴 화면 3단. **DONE — 로컬 구현·검증**, Work Lead · A/B.
- 기존 LIB-02/03 로컬 변경 보존. branch `codex/library-craft`, root `/Volumes/WAN2/apps/story-maker`.
- 책 수가 적거나 없어도 선반 단수를 유지한다. 넓은 가로5열/중간3열/좁은2열, 용량은 열×단수.
- 화면 높이에 맞춘 책/선반 크기, 2→3단 전환, 책 위치 이동(560ms 기본 + 순서별 차이),
  새로 등장하는 책의 시차 효과를 연결했다. 진행 중 리사이즈를 중단·재연결하며 동작 축소 설정에서는 즉시 배치한다.
- `npm run check` 오류/경고 없음, `npm test` 빌드 및 **196/196 통과**, `git diff --check` 통과.
- `library-craft.mjs`: 1365/820/390/320px, 기존 실제 책·키보드·읽기 복귀·생성·공유 파일·페이지 검사 통과.
- `library-motion.mjs`: 가로2/세로3 실제 grid 단수, 빈 상태, 방향 경계 포함 연속 6회 리사이즈,
  실행 중 책 애니메이션, 초점 유지, 동작 축소 시 실행 애니메이션0, 선택 화면의 리사이즈·ESC 복귀 통과.
- 로그 `/tmp/library-motion-check.log`, `/tmp/library-motion-test.log`, `/tmp/library-motion-regression.log`,
  `/tmp/library-motion-browser.log`. 시각 확인 `/tmp/library-motion-qa/landscape.png`, portrait-tablet.png, portrait-phone.png.
- 저장·파일 형식 변경 없음. 물리 기기 회전/OS 동작은 자동 브라우저 검증과 구분한다.
- 커밋·푸시·배포 없음. `http://localhost:3003/` 미리보기. 다음 READY 없음.

## 최근 완료: LIB-03 선반 재질·조명 정합화 (로컬)

- 2026-09-11 사용자 후속 요청, **DONE — 로컬 구현·검증**. 기존 LIB-02 변경을 보존했다.
- `codex/library-craft`. built-in imagegen으로 목재 선반 한 단을 생성해 `public/library/oak-shelf.webp`에 저장했다.
  기존 평면 그라데이션을 나뭇결·측광·윗면·전면 두께가 있는 소재로 교체하고 행별 반복/프레임/받침대에 연결했다.
  책 밑면을 선반 전면 윗선에 맞췄고 desktop 행 높이를 340px로 조정했다.
- `npm run check` 통과, `library-craft.mjs` 1365/820/390/320px 실제 흐름 및 공유 파일 11개·리사이즈/페이지 검사 통과.
  `/tmp/library-shelf-check.log`, `/tmp/library-shelf-browser.log`, `/tmp/library-craft-qa/` 캡처 확인.
  desktop/mobile 한 단 및 desktop 여러 단에서 재질·배치 확인. `git diff --check` 통과.
- 이번 범위는 자산·CSS·자산 경로이며 저장·읽기 로직 변경 없음. 전체 회귀는 LIB-02 증거를 유지한다.
- 커밋·푸시·배포 없음. 미리보기 `http://localhost:3003/`. 다음 READY 없음.

## 최근 완료: LIB-02 서재·책 표지 완성도 개선 (로컬)

- 사용자 2026-09-11 첨부 4종 예시 기반 요청, **DONE — 로컬 구현·검증**. Work Lead · A/B.
- root `/Volumes/WAN2/apps/story-maker`, branch `codex/library-craft`. 시작 시 main/origin 동일, 로컬 변경 없음.
- 햇빛이 드는 실내 배경, 연속 목재 선반, 양장 표지/금박/책등/페이지 단면, 그림 없는 책 장식을 적용했다.
  서재·선택·읽기에서 BookCover를 공유하고 내 작품의 적용본 표지와 편집본을 구분한다.
- 모든 책/기본/내 작품/공유 필터, 해당 원작의 공유 파일 탐색, 파일 열기, 새 창작을 연결했다.
  잘못된 공유 버튼의 창작 관리 이동, 선택 화면의 초점 재설정, 리사이즈 뒤 페이지 이전 이동을 수정했다.
- 검증: `npm run check` 오류/경고 없음. `npm test` 빌드 및 **196/196 통과**.
  `QA_URL=http://localhost:3003 node tests/browser/library-craft.mjs` 통과:
  1365×900, 820×1180, 390×844, 320×740에서 실제 목록/열/페이지 용량, 44px 조작,
  Tab 가두기·좌우키·ESC 복귀·배경 비활성·스크롤 복원, 읽기 복귀·저장 불변·빈 작품 생성.
  적용/편집 표지 분리, 내 작품 읽기/편집, 실제 공유 파일 11개 가져오기·출처 필터·페이지 전환·양방향 리사이즈 확인.
- 기본 표지 이미지 로딩 및 읽기 표지 desktop/mobile 실화면 확인.
  로그 `/tmp/library-check.log`, `/tmp/library-test.log`, `/tmp/library-browser.log`;
  스크린샷 `/tmp/library-craft-qa/` (shelf/focus/reader-cover/many-books).
- 최종 scoped diff/whitespace 확인. 변경: BookCover, StoryDiscovery, CSS, `public/library/`,
  해당 browser 검사와 기존 상세 설계·작업 카드·상태표. 저장 형식·공식 Excel·자산 ID 변경 없음.
- 한계: 실물 휴대폰/OS/IME는 이번 검증 밖. 원작 전체와 온라인 공개 서재는 미지원 상태를 정직하게 유지한다.
- 커밋·푸시·머지·배포 없음. 개발 화면 `http://localhost:3003/`. 다음 READY 없음.

## 최근 완료: 서재 책 꺼내기 Focus Stage 및 감성 UI 구현 main 반영 (2026-09-11)

- 사용자 명시 요청으로 서재 진입 간소화 및 책 꺼내기 Focus Stage 감성 UI/UX를 구현하여 PR #20 및 PR #21로 main에 병합 완료했다. (머지 커밋: `c90efd5`)
- 책장에서 책 선택 시 원목 거치대에 책을 올리고 주변 서재를 은은하게 조명하는 Focus Stage 인터랙션 구현.
- 좌우 화살표/방향키 연속 탐색, 2×2 선택 카드([원작 전체·준비 중], [놀스토리 읽기], [모두의 이야기], [편집하기/복제해서 만들기]) 및 ESC/닫기 복귀.
- 검증: `npm run check` 0 오류, `npm test` 196/196 전체 통과, `npm run qa:smoke` 4종 스위트 통과, GitHub Actions CI verify 통과.
- 현재 main 기준선과 완전 동기화(In-Sync) 완료.

## 이전 요청: SP-A~F 플랫폼 기초 및 다중 프로젝트/파일 워크플로 main 반영 (2026-09-10)

- **SP-A~F DONE (PR #19 머지 완료, 커밋 `0c88761`)**. 2026-09-10 승인 서비스 개편 SP-A~E를
  아래 계약별 증거로 확인했다. 현재 범위의 새 READY 없음. 기존 자산 사람 승인과
  물리 기기 검증은 유예 상태를 유지하며 완료로 바꾸지 않는다.
- 루트 `/Volumes/WAN2/apps/story-maker`, branch `codex/story-platform-foundation`.
  최종 fetch 후 HEAD/origin 차이 0, PR #19 OPEN/DRAFT 확인. 이번 구현은 로컬 변경으로만 존재한다.
  기존 지침·설계 변경의 numstat를 시작 기록과 대조해 보존했다. commit/push/merge/deploy 없음.
- 초기 전체 검사 196개 중 5개 실패를 분석했다. 4개는 이전 문구/DOM을 찾는 검사여서
  현재 복구 안내·창작 관리·공유 읽기 컴포넌트·실제 이미지 선로딩 경로로 갱신했다.
  컷 꾸미기의 장 단계 라벨 누락은 기능 회귀로 판단해 복원했다. 요구를 삭제하지 않았다.
- 최종 `npm test` 빌드 및 **196/196 통과**, `npm run check`, `git diff --check` 통과.
  로그 `/tmp/story-platform-test-final.log`, `/tmp/story-platform-check.log`.

| 승인 계약 | 현재 소스/증거 | 판정 |
|---|---|---|
| 로컬 우선, 로그인·네트워크 불필요 | collection/File API 경로, 자동 저장·파일 browser, 서버 신규 의존성 없음 | 충족 |
| Home→서재→읽기 선택→작품 목록, 진입 복귀 | StartScreen/StoryDiscovery, story-discovery browser 1365/820/390 | 충족 |
| 실제 책만 페이지 표시 5×2/3×3/2×3 | libraryPage 단위 검사 및 브라우저 capacity/columns/실제 목록 | 충족 |
| 기본판 읽기 전용, 새 ID 도달 seed·원본 보존 | story-discovery 도메인 및 browser 원본 불변/양 작품 복제 | 충족 |
| 두 작품 생성·편집·전환·재접속, 세 번째 차단 | project-collection browser 1365/390, Node collection | 충족 |
| 편집/적용본/선택 분리, legacy bytes·실패 보호 | collection/repository/checkpoint 검사, 이전 실패·재시도·손상 저장 browser | 충족 |
| project/shared 파일, 동일 ID 유지/교체, 자산/크기 검증 | story-file Node/browser, 실제 다운로드·교체·실패 복구·슬롯 없는 읽기 | 충족 |
| 출처와 기존 Excel/공개 시트 경로 | 파일·실제 XLSX 왕복 Node, sheet-import 4개 mock 시나리오 | 충족 |
| 불변 publication, 제출 상태·조회 조건, 허용 remix | story-publication 검사, 공유 목록→새 ID/출처 복제 browser | 충족 |
| 미지원 원작 전체/서버/학교를 실제로 표시하지 않음 | Reader Entry 준비 상태, 공유 파일 세션 안내·온라인 준비 상태 소스 확인 | 충족 |
| 화자 색상·복수 화자, 본문색·문서/Excel 호환 | reader-layout UI 적용/재접속/읽기 및 Node 문서/file/Excel | 충족 |
| 가변 글상자, 고정 인물, 실제 방문·선택 기록·복귀 | reader-layout/reader-book/reader-history desktop/mobile/가로 회전 | 충족 |

- 마지막 통합 browser: project-collection, story-discovery, story-file, sheet-import,
  reader-layout 통과. SP-E의 reader-book/reader-history 성공 증거도 유지한다.
  서버 종료로 접속 거부된 시도는 성공에 포함하지 않았다. 종료를 확인하고 dev 서버 재시작 후
  같은 검사를 재실행해 통과했다. 현재 개발 화면 `http://localhost:3003/`.
- 파일 shared 목록은 세션 전용, 원작 전체·온라인 공개·검수·학교 서비스는 승인 계약상 미지원이다.
  실제 Google 서버·물리 기기 IME/OS 파일 선택창·자산 사람 승인은 이번 자동 검증 밖이다.
  이전 A1-02 후보 자산은 변경/승인하지 않았다. 향후 공개 배포 승인과 혼동하지 않는다.
- 최종 변경 검토: 제품 변경은 app/관련 tests와 기존 상태표·작업 카드·파일 ADR에 한정했다.
  비밀정보·사용자 작품·불필요한 생성 산출물은 추가하지 않았다. 기존 지침 변경은 별도 보존한다.

## 이전 요청: SP-E 읽기 개선 (2026-09-10)

- **SP-E DONE (로컬 구현·검증, 미커밋)**. 당시 다음 작업은 SP-F였으며 후속 검증은 위 기록을 따른다.
- 기존 로컬 변경 보존. 화자별 색상·단일/복수 화자·긴 글상자·종이 기록을 연결했다.
  `coSpeakerNames`는 주 화자와 별도로 저장하고 문서·Excel·파일·fingerprint를 왕복한다.
  컷 꾸미기에서 선택하며 대본/컷 미리보기와 읽기·기록에 함께 표시한다.
- 화자 이름만 색을 바꾸고 본문색은 유지한다. 최대 6색을 충돌 회피 배정하고 이름은 항상 표시한다.
  일반 긴 글상자는 최대 65dvh로 확대하되 무대 좌표는 기존 기준으로 고정한다.
  기록은 중앙 종이 창이며 보조 조작의 터치 영역을 44px로 보완했다.
- 변경: story-speakers/story-speaker-colors, StoryPlayer/ReadingTranscript,
  SceneFocusEditor/ScriptScreen, story-data/document validation/workbook/sheet/publication,
  CSS와 관련 검사. 파일 호환 계약은 기존 nolstory-file-v1 ADR에 기록했다.
- `npm run check`, `git diff --check` 통과. 문서/file/publication 핵심 Node 검사 13/13 통과.
- `QA_URL=http://localhost:3003 node tests/browser/reader-layout.mjs` 1365×900/390×844:
  추가 화자 UI 선택·저장, 화자 색상 구분·이전 복귀 유지, 긴 글 35% 초과/65% 이하,
  글씨 확대·기록 전후 인물 위치 고정, 기록 중앙 배치 통과. 모바일에서는 복수 화자
  플레이 적용→재접속→현재 대사·지난 기록 이름 보존도 확인했다.
- 같은 서버에서 reader-book.mjs desktop/mobile 표지·글씨·기록·장 이동·진입 복귀 통과.
  reader-history.mjs 선택 경로·종료 선택·재선택·실제 기록·인물 고정 및 가로 회전 통과.
  `/tmp/reader-layout-qa/history-390.png` 시각 확인. 실기기 OS/IME는 별도 미검증.
- 전체 빌드/회귀는 SP-F에서 한 번 확인한다. 커밋·푸시·배포 없음.
  루트 `/Volumes/WAN2/apps/story-maker`, branch `codex/story-platform-foundation` 유지.

## 이전 요청: SP-D 공유본·고쳐쓰기 계약 (2026-09-10)

- **SP-D DONE (로컬 구현·검증, 미커밋)**. 당시 다음 작업은 SP-E였다.
- Work Lead · G/A/B. `/Volumes/WAN2/apps/story-maker`, `codex/story-platform-foundation`.
  SP-C와 기존 지침·설계 변경을 보존했다. 공유 snapshot 불변성, SHA-256 읽기 내용
  fingerprint, 제출 상태 전이·조회 조건, 허용 공유 파일의 새 ID 복제 도메인을 추가했다.
- 파일 미리보기와 세션 공유 목록에서 고쳐쓰기 허용과 빈 슬롯을 확인하고 중앙 저장소로
  새 편집본을 만든다. 원제·저자·원본 fingerprint 출처를 보존하며 공유 원본은 바꾸지 않는다.
- 계약은 `docs/decisions/nolstory-file-v1.md`에 기록했다. 제출 상태와 snapshot을 분리하고
  조회는 baseStoryId/schoolId/sourceKind AND 조건을 사용한다. 서버·학교·검수 서비스는 미지원이다.
- 변경: `app/story-publication.ts`, StoryStudio/StoryFileDialog/StoryDiscovery,
  `tests/story-publication.test.mjs`, 기존 파일 브라우저 검사, 카드/파일 ADR.
- 증거: `npm run check`, `git diff --check` 통과.
  `node --test tests/story-publication.test.mjs tests/story-file.test.mjs` 6/6 통과:
  snapshot 동결·편집본 격리, ID/시간/메모 제외, 제목/표지/장/대본/연결/자산/효과 변경 판정,
  허용 정책·새 ID·출처, 제출 전이와 조회, 파일/Excel 왕복 및 실패 보존.
- `QA_URL=http://localhost:3003 node tests/browser/story-file.mjs` 통과:
  파일 흐름 1365×900/390×844, 두 슬롯일 때 고쳐쓰기 차단, desktop 공유 읽기 후
  공유 목록 재진입→고쳐쓰기→새 ID·출처 확인. 브라우저 런타임 오류 없음.
- 전체 빌드/회귀·실기기는 이번 최소 검사에서 실행하지 않았다. 커밋·푸시·배포 없음.
  다음은 SP-E 화자 표시·복수 화자/Excel 호환·가변 글상자·지난 기록 개선 및 최종 계획 검증이다.

## 이전 요청: SP-C 파일 보관·가져오기 (2026-09-10)

- **SP-C DONE (로컬 구현·검증, 미커밋)**. 당시 다음 작업은 SP-D였다.
  후속 공유본·고쳐쓰기 결과는 위 현재 요청 기록을 따른다.
- Work Lead · G/A/B. `/Volumes/WAN2/apps/story-maker`, `codex/story-platform-foundation`.
  fetch 후 로컬/원격 HEAD 차이 0, PR #19 OPEN/DRAFT 확인. SP-B와 기존 지침·설계 변경 보존.
- `.nolstory` 편집 백업은 작품 ID·출처·편집본·적용본을 보존한다. 같은 ID는 유지/교체를
  명시 선택하며 교체 전 checkpoint를 남긴다. 두 작품이 찼을 때 새 편집본 추가는 차단한다.
  공유 읽기는 슬롯을 소비하지 않고 창작 관리/서재/읽기 진입으로 돌아간다.
- 공유 내보내기는 적용본을 사용하고 창작 메모·작업 노트·시트 주소를 제외한다.
  고쳐쓰기 허용 값은 기본 false로 파일에 기록하며 실제 remix 동작은 SP-D에 남는다.
  공유 파일 목록은 현재 세션만 유지하며 재접속 후 파일을 다시 열도록 안내한다.
- 크기·MIME·schema·ID·내장 자산 참조를 검사한다. 커스텀 첨부는 지원하지 않는다.
  Excel/시트의 선택 출처 행을 왕복하며 이전 양식의 출처 미상은 유지한다.
  계약은 `docs/decisions/nolstory-file-v1.md`에 있다.
- 변경: `app/story-file.ts`, StoryFileDialog, collection importProject, StoryStudio,
  CreationHub/StoryDiscovery 파일 연결, workbook/sheet 출처 행, 관련 CSS와 검사.
- 증거: `npm run check` 및 `git diff --check` 통과.
  `node --test tests/story-file.test.mjs tests/story-project-collection.test.mjs` 11/11 통과:
  편집/적용본·null/빈 적용본·출처 왕복, 비공개 메모 제외, 잘못된 파일 거부,
  원자 교체 실패 보존, 슬롯 제한, legacy 보존, 실제 XLSX와 읽은 sheet snapshot 출처 왕복.
- `QA_URL=http://localhost:3003 node tests/browser/story-file.mjs` Chromium
  1365×900/390×844 통과: 두 파일 추가, 세 번째 차단, 동일 ID 유지/교체,
  실제 다운로드 내용, 다른 작품 보존, 공유 읽기 무저장, 복귀·재접속,
  44px 버튼·가로 넘침. desktop은 공유 내보내기 및 저장 실패 중 최신 편집본 파일 백업 확인.
  교체 창 화면 `/tmp/story-file-qa/replace-1365.png`, `replace-390.png` 확인.
- 전체 빌드/회귀·실기기·실제 Google 서버는 이번 최소 검사에서 실행하지 않았다.
  커밋·푸시·PR 갱신·병합·배포 없음. 다음 세션은 현재 로컬 변경을 보존하고 SP-D부터 진행한다.

## 이전 요청: SP-B.2 서재·읽기 선택·작품 목록 연결 (2026-09-10)

- **SP-B.2 DONE (로컬 구현·검증, 미커밋)**. 당시 다음 독립 작업은 SP-C였으며,
  후속 파일 입출력 결과는 위 현재 요청 기록을 따른다.
- Work Lead · G/A/B. `/Volumes/WAN2/apps/story-maker`, `codex/story-platform-foundation`.
  시작 시 fetch와 초안 PR #19 OPEN/DRAFT 확인, 로컬/원격 HEAD `98cc7f4` 일치.
  SP-B.1 로컬 구현과 기존 지침·설계 변경을 보존했다.
- 기존 포스터의 이야기 변경에서 서재를 열고, 선택 이야기 읽기는 읽기 종류와 작품 목록을 거친다.
  화면 왕복 시 선택 이야기 유지. 서재는 기본 2개와 실제 로컬 작품만 HTML 제목/CSS 표지로 표시한다.
  가로 5×2/태블릿 3×3/휴대폰 2×3 페이지 용량을 적용하며 가짜 책을 채우지 않는다.
- Reader Entry는 고전 원작 전체 준비 상태와 놀스토리/공유 작품을 구분한다.
  Story Hub는 기본/내 작품/공유 그룹을 제공한다. 공유 파일·서버는 미구현 빈 상태로 표시한다.
  내 작품은 이 기기의 모든 작품이며 읽기는 각 적용본을 사용한다.
- 기본 작품 읽기는 학생 저장을 바꾸지 않는다. 복제는 새 ID·출처와 도달 가능한 컷/장을 사용하고
  원본 master는 그대로 보존한다. 토끼 136컷, 옹고집 345컷 seed, 기존 2개 정책을 공유한다.
  플레이는 서재/작품 목록/창작 관리 등 실제 진입 화면으로 돌아간다.
- 변경: `app/story-discovery.ts`, `app/components/StoryDiscovery.tsx`, StartScreen/StoryStudio/
  StoryPlayer, 관련 CSS와 browser 진입 검사. 이전 세션 변경과 함께 아직 로컬에만 있다.
- 증거: `npm run check` 통과. `node --test tests/story-discovery.test.mjs
  tests/story-studio-state.test.mjs` 9/9 통과. 원본 불변·도달 경로/분기 보존·문서 유효성·중앙 슬롯
  제한·페이지 분할 및 플레이 상태 격리를 확인했다.
- `QA_URL=http://localhost:3003 node tests/browser/story-discovery.mjs` Chromium
  1365×900/820×1180/390×844 통과: 서재 배치·선택/복귀·원작/공유 빈 상태,
  기본판 읽기 전후 학생 저장 불변, 양 기본판 복제, 내 적용본 읽기·복귀, 2개 제한,
  키보드 선택/초점·44px·가로 넘침. 실제 보유 수가 4개 이하이므로 여러 페이지는 단위 검사로 검증.
- `QA_URL=http://localhost:3003 QA_VIEWPORTS='[[1365,900],[390,844]]'
  node tests/browser/start-screen.mjs` 통과: 테마별 기존 포스터 배치 변화/가로 넘침 0,
  창작 관리 및 새 읽기 진입. 캡처 `/tmp/story-discovery-qa/`.
- 알려진 원문 조건: 토끼 master의 괄호 해설 2컷은 그대로 복제한다. 기존 해설 작성 규칙 때문에
  수정본의 플레이 적용 전에 수정 안내가 나오며, browser 검사는 복제본에서 직접 수정 후 적용했다.
  원문을 자동 수정하거나 적용 검사를 약화하지 않았다. 옹고집의 미도달 5개 장은 seed에서 제외한다.
- 전체 빌드/회귀·실기기 검사는 최소 검증 요청에 따라 미실행. 커밋·푸시·PR 갱신·병합·배포 없음.
  다음 세션은 이 로컬 변경 및 원격을 확인하고 SP-C부터 진행한다. 지침 변경을 구현 커밋에 섞지 않는다.

## 이전 요청: SP-B.1 창작 관리·Studio 저장소 연결 (2026-09-10)

- **SP-B.1 DONE (로컬 구현·검증, 미커밋)**. 사용자 지정 우선 범위인 창작 관리와
  다중 작품 Studio 연결을 완료했다. 당시 Home/Library/Reader Entry/Story Hub를 SP-B.2로 인계했다.
  후속 결과는 현재 요청의 SP-B.2 기록을 따른다.
- Work Lead · G/A/B. 시작 시 origin fetch, 초안 PR #19 OPEN/DRAFT와
  `codex/story-platform-foundation` 로컬/원격 HEAD `98cc7f4` 일치 확인.
  저장소 `/Volumes/WAN2/apps/story-maker`. 기존 지침·설계 문서의 로컬 변경을 보존했다.
- CreationHub는 작품별 목록/선택·빈 이야기/기본판 복제·읽기·확인 삭제를 제공한다.
  Studio draft 자동 저장/적용본/선택 ID는 `storygame:projects:v1`에 연결했다.
  생성은 새 ID와 출처를 사용하며, 최대 2개 정책을 생성·Excel/시트 가져오기에 적용한다.
  같은 ID 가져오기는 명시 확인과 해당 작품 checkpoint를 거쳐 교체한다.
- 전환·창작 관리 복귀 전 최신 편집본을 저장한다. 실패하면 현재 편집 화면을 유지하고
  재시도로 저장할 수 있다. 다른 작품의 undo/복구 기록은 현재 작품에 적용하지 않는다.
  최초 접근 시 기존 단일 draft/active를 이전하되 원래 bytes를 보존한다.
- 검증: `npm run check` 통과. collection/repository/document/checkpoints Node 검사 19/19.
  `QA_URL=http://localhost:3003 node tests/browser/project-collection.mjs` Chromium
  1365×900 / 390×844에서 빈 작품·기본판 생성, 두 작품 편집/즉시 전환/재접속,
  선택 ID 복원, 적용본 분리 읽기/창작 관리 복귀, 세 번째 생성 비활성,
  저장 실패·재시도, 삭제 취소/확인/빈 슬롯 재사용, 44px·가로 넘침·초점 확인.
  desktop에서는 실제 XLSX 세 번째 가져오기 차단과 작품 보존도 확인했다.
  `QA_URL=http://localhost:3003 node tests/browser/sheet-import.mjs` 4개 시나리오 통과:
  정상/선택 탭 없음/권한 거부/로그인 응답, 다른 ID 추가·같은 시트 확인 교체와 checkpoint 확인.
  시트 응답은 fixture 주입이며 실제 Google 서버 검증이 아니다.
  이전 저장본 bytes 보존·최초 이전 실패/재시도·손상 collection 비덮어쓰기도 브라우저 통과.
  화면 캡처 `/tmp/story-collection-qa/hub-1365.png`, `hub-390.png`.
- 현재 CI와 관련 브라우저 재현 스크립트의 진입·저장 단언을 새 창작 관리와 collection에 맞췄다.
  전체 QA/빌드/회귀·실제 모바일 키보드/장치·실제 Google 서버는 요청한 최소 검증 범위 밖으로
  실행하지 않았다. 기존 SP-A 출처 문서 정규화는 보존하며 Excel source 왕복은 SP-C에 남는다.
- 커밋·푸시·PR 본문 갱신·main 병합·배포는 수행하지 않았다. PR #19에는 아직 이번 로컬 변경이 없다.
  당시 다음 작업은 SP-B.2였다. `.nolstory`/publication/복수 화자는
  각각 SP-C/D/E에 남아 있다. 기존 지침 변경을 구현 커밋에 섞지 않는다.

## 이전 요청: SP-A 저장소 체크포인트 (2026-09-10)

- `98cc7f4` / 초안 PR #19. ID별 draft/playback·선택 ID·최대 2개 중앙 정책과
  최초 단일 키 이전, 저장 실패·손상·중복/세 번째 차단·늦은 자동저장 보호 구현.
- 선택적 source 계약과 문서 정규화 보존. 당시 Studio는 미연결이었고 SP-B로 인계했다.
- 당시 증거: `npm run check`, collection/repository/document Node 검사 16/16.
  Studio 연결 후 현재 증거는 위 SP-B.1 항목을 따른다.

## 이전 요청: 책 표지·대본 읽기 화면 개선 (2026-09-10)

- 사용자 직접 지정, 로컬 구현 완료. 기존 UI 변경은 `d552dc6`에 체크포인트, 미배포.
- 책등·종이 단면·금박 장식, 넓은 화면 최대 560px. 원작 및 학생 작품의 공통 표지 사용.
- 후속 조정: 현재 컷만 표시하는 하단 글상자는 내용에 맞춰 축소, 최대 35dvh.
  정보 펼침과 무대 배치를 분리해 인물 크기 고정. 지난 기록·글씨 조절은 하단 구석에 축소 배치.
- 별도 지난 기록 창에 실제 방문 대본과 선택 문구(같은 도착점/종료 선택 포함)를 표시.
  이전 이동은 이후 기록 제거, 장 이동은 기록 초기화. 작품·장 정보 기본 접힘.
- 돌아가기 메뉴에서 메인/편집(학생 작품), 이동 메뉴에서 현재/다른 장의 첫 컷만 선택.
- `npm run check` 통과, 관련 표지·플레이 상태·분기 테스트 25/25 통과 (각 1회).
  Chromium 1365×1000/390×844에서 글씨·기록·이전·장 처음·메인 복귀 확인.
  모바일 현재 문장 위치 계산 수정 후 해당 화면만 재확인. 두 원작 표지 시각 확인.
- 재현: `QA_URL=http://localhost:3002 node tests/browser/reader-book.mjs`.
  전체 빌드/회귀·실제 장치 검증은 사용자 제한에 따라 생략.

## 이전 요청: 고정 컷 이동·원작 연출 개선 (2026-09-10)

- 사용자 직접 지정, Work Lead. 주 책임 교육 UX; 검토 관점 접근성·데이터 보존.
- 최신 main `6bbc72a`에서 `codex/docked-cut-editor`로 분기. 로컬 구현 완료, `d552dc6`에 체크포인트, 미배포.
- 대본/컷 공통 하단 고정 이동·추가, Alt+방향키와 IME 보호, 입력 초점/내용 보존.
  화자·종류·이미지 선택을 글쓰기 앞에 모으고 연결·특수 연출·배치 복사는 보조 설정으로 이동.
- 이어쓰기 첫 컷의 앞 문장과 반응 질문을 입력 후에도 유지. 원문/저장 스키마 변경 없음.
  플레이 화자 밝기 전환·짧은 글 표시 전환·분기 도착 이미지 선로딩, 편집 미리보기 효과 연결.
- `npm run check` 1회 통과. 관련 Node 테스트 23/23 1회 통과
  (story-scene-frame, story-continuation, story-examples, story-stage-view, story-scene-effect).
- Chromium 1365×900, 820×1180, 390×844에서 고정 이동/추가·입력 보존·조합 키 보호·44px 확인.
  기존 적용/메모 고정 영역과의 겹침 수정. 모바일 대본 전환은 키보드로 확인;
  자동 포인터 전환은 스크롤 간섭으로 미확인. 실제 모바일 키보드/장치 미검증.
  재현: `QA_URL=http://localhost:3002 node tests/browser/docked-cuts.mjs`.
- 자산 실측: 배경 38개 1599×900, 캐릭터 70개 투명 800×1200, 캔버스 가장자리 알파 잘림 없음.
  발선 예외: 옹고집 real-borrowed/real-resolve/second-child 1143,
  real-exiled/youngest-child 1141 (각 카탈로그 ID 접미사 생략). 나머지 65개는 1149±3.
  몸통 시각 중심 x=400과 신체 비율의 사람 검수는 수행하지 않음. 원본 이미지 보정 없음.
- 원작 기준 커밋 `df00a622`의 토끼 133/옹고집 450개 beat 문장과 생성본 일치.
  전체 분기 연출 재생·실기기·전체 빌드는 사용자 검증 제한에 따라 이번에 실행하지 않음.

## 이전 요청: ST-03 교실 모바일·시트 UI 검증

- 상태: `DONE` (로컬 자동화, 미통합), Work Lead · G/A/B, 사용자 안정화 요청.
  기존 제품 Node 172/172는 PR #17 CI, 추가 QA는 로컬 check/qa:classroom 통과.
  PR #18의 최신 Linux CI 결과는 PR checks 및 안정화 보고서에서 확인한다.
- 주 책임 QA·릴리스; 검토 관점 접근성·데이터 신뢰성.
- `codex/stabilization-classroom-qa`, PR #17 기반 후속 독립 QA.
- Chromium touch 이동/크기·회전/높이 축소·초점·reduced motion, 실제 Excel 생성 CSV의
  UI 정상/optional 404/403/login 검사. 네트워크는 응답 주입, 실제 Google 검증 아님.
- 로컬 qa:classroom 약 9초, check 통과. 확인 전 무변경·정상 가져오기 후 원본 checkpoint 보존,
  권한/로그인 오류 시 draft/active 보존 통과.
- 실기기/실제 공유 시트만 MANUAL VERIFICATION REQUIRED. A1-02 사람 승인 대기 유지.

## 이전 요청: ST-02 원작 도달 경로와 결말 검증

- 상태: `DONE` (미통합), PR #17 Linux CI 34350971983 성공, 172/172. 사용자 안정화 요청의 후속 독립 QA, Work Lead · G/A/B.
- 주 책임 QA·릴리스, 검토 관점 데이터 신뢰성·아동문학 편집자.
- PR #16 위 `codex/stabilization-example-paths`; 제품/생성 원문은 변경하지 않는다.
- 토끼와 자라 136컷 도달/6경로/3결말, 옹고집전 345컷 도달/16경로/2결말.
- 로컬 그래프 6/6, 정적 Chromium 다섯 결말 종료·이전/재선택·네 저장 키 보존 통과.
  전체 smoke 약 68초, check 통과. 실제 장치/22경로의 의미·연출 평가는 미검증.
- 옹고집전 나머지 108컷은 원본 커밋부터 분리된 이전 5경로. 예외 ID를 고정해
  추가 도달 불가를 실패 처리하며 Narrative Audit에서 연결/보존 결정을 별도 검토한다.

## 이전 요청: ST-01 안정화 브라우저 회귀 게이트

- 상태: `DONE` (미통합), PR #16 Linux CI 34350483098 성공, 169/169 보존. 사용자 직접 지정 (2026-09-09), Work Lead · G/A/B.
- 주 책임 QA·릴리스, 검토 관점 데이터 신뢰성·학생 대변인.
- main `d545456`에서 `codex/stabilization-browser-gate` 분기. 제품 tree는 `67be51a`와 동일.
- PR #14/#15는 독립 open·CI 성공. 병합·보호 설정은 승인 대기.
- 허용 범위·인수·재현 명령은 ST-01 작업 카드 참조. A1-02 사람 승인 대기 보존.

## 이전 요청: EX-01 메모 조절·원작 체험·근접 컷 이동

- 상태: `DONE` (2026-09-09 구현·로컬 검증 완료). 사용자 지정, Work Lead. 주 책임: 교육 UX, 검토: 데이터 신뢰성·QA.
- 기준: PR #11 `5d39417`, clean → `codex/story-experience`. PR #11 위의 별도 변경.
- 메모는 직접 열기만 허용, 장 생성 자동 열기 제거. 닫기/드래그 이동/크기/방향키/화면 경계 지원.
- 원본: pinky-ne-site-publish `df00a622848182c7d2ef0b0a4731b8b64d237082` stories.js.
  로컬의 무관한 변경은 읽거나 수정하지 않았다. 생성기에 원본 경로와 커밋을 기록한다.
- 컷 집중 미리보기와 글상자 좌우 이동, 현재 스크롤 유지, 첫/마지막 버튼 비활성화.
- 인수: 원본 대사/분기/결말 일치·편집본 비변경, 창 크기/위치 조절, 진입 시 닫힘,
  desktop/tablet/mobile 브라우저, check/test/build:pages.
- 자동 검증: check 통과, 전체 169/169, build:pages 통과. SSR HTML·키보드 계약 유지.
- Chrome 1365×900 / 820×1180 / 390×844에서 기본 닫힘, 메모 드래그·방향키 이동,
  크기 조절·초기화·내용 스크롤·작성/복원, 미리보기/글상자 컷 이동과 끝 비활성 통과.
- 원본 133/450개 컷 문장을 전부 비교해 일치. 분기 안내/단일 행동을 포함한 재생본은 136/453개 컷.
  연결/정규화 검증 및 양 작품 첫 선택 경로에서 분기→결말까지 실제 브라우저 재생 통과.
  예시 체험 전후 사용자 저장본 동일. 모든 결말의 시각 재생과 실기기 IME는 미검증.
- 재현: tests/browser/sticky-memos.mjs, tests/browser/pinky-examples.mjs (QA_URL 지정 가능).
  생성 절차: docs/decisions/story-example-source-v1.md. main 병합·공개 배포 전 단계.

## 이전 요청: MN-01 가벼운 참고 메모와 연동 신뢰성

- 상태: `DONE` (2026-09-09 구현·로컬 검증 완료), 사용자 직접 지정. Work Lead · G/A/B.
- 기준: main/origin main `bdecb4f`, clean, 열린 PR 없음 → `codex/sticky-memos`.
- 주 책임: 교육 UX, 필수 검토 관점: 데이터 신뢰성·QA.
- 계획: 포스트잇 내용 편집/스크롤 → 작품·장 범위 → 저장/Excel/시트 오류 경로 → 실제 브라우저 회귀.
- 이전 항목형 메모·구성표·컷 연결은 보존하며 기본 메모 화면에서는 보조 정보로 접는다.
- 검증: 메모를 펼친 채 글쓰기, 장 변경 뒤 닫기, 긴 메모·필터·재접속,
  메모/분기/표지의 Excel·시트 CSV 왕복, 통신 오류·취소 시 작품 보존,
  npm run check / npm test / npm run build:pages.
- 자동: check 오류 0, 전체 166/166 (기존 159+통합 7), build:pages 통과.
  기존 메모 편집 UI 소스 단언 4개는 사용자가 요청한 내용/추가 정보/비모달/기존 항목 보존 계약으로 갱신.
- Chrome 1365×900 / 820×1180 / 390×844: 열린 메모 옆 글쓰기, 긴 메모 스크롤,
  작품·장 필터, 새로고침 복원, 메모 중 컷 이동 후 닫기, 적용 전 플레이 버전 분리 통과.
  실제 시트 진입 UI에서 500 응답을 주입해 오류 표시 및 기존 편집본 보존 확인.
- 통합: 긴 개행·따옴표 메모+장 연결+분기+표지의 실제 XLSX/공개 시트 CSV/문서 왕복,
  선택 메모 탭의 500/403/통신 오류/로그인 HTML/취소 중단, 이전 양식 탭 없음 호환.
- 재현: `tests/browser/sticky-memos.mjs`, 결과 `/tmp/sticky-memos-qa`.
  Google 서버 응답은 재현 가능한 테스트로 대체했으며 실제 공유 시트 계정·실기기 IME는 미검증.
  main 병합·공개 배포는 하지 않았다.

## 이전 요청: HS-02 글자 선명도·화면별 첫 진입

- 상태: `DONE` (2026-09-09 로컬 구현·검증, PR 검토 전). 사용자 직접 지정, Work Lead. 주 책임: 교육 UX, 검토 관점: 접근성·QA.
- branch: `codex/adaptive-home`, PR #9의 `6b54680` 위에 분리. main과 열린 PR 확인, 미커밋 변경 없음.
- 범위: 첫 화면 고딕체·SVG 아이콘, 안내/삽화 영역 분리, 세로 카드·가로 펼침 배치,
  태블릿/웹 창작 공작소 폭 확대. 기존 분기·저장·모달 기능 보존.
- 증거: 화면 크기별 양 테마·44px·영역 겹침·넘침·키보드/모달/읽기,
  정적 검사·전체 회귀·정적 빌드. 새 이미지 제작 없이 기존 고해상도 삽화 재사용.
- 검증: `npm run check`, `npm test` 159/159, `npm run build:pages` 통과.
  Chrome 320×740 / 360×800 / 390×844 / 600×960 / 768×1024 / 820×1180 /
  960×720 / 1024×768 / 1440×900 / 1920×1080 / 720×450 / 800×450 통과.
- 창작 공작소의 긴 이름이 사각 로고 스타일에 끼이던 충돌, 모바일 시작 버튼 줄바꿈도 수정.
- 재현: `QA_URL=<개발 서버> PLAYWRIGHT_MODULE=<기존 모듈> node tests/browser/start-screen.mjs`.
  `QA_VIEWPORTS`로 크기 배열 지정 가능. 캡처 `/tmp/adaptive-home-release`, 추가 가로 `/tmp/adaptive-home-landscape`.
- 실제 iOS/Android·OS별 글꼴 및 브라우저 자체 200% 확대는 이번 작업에서 미검증.
  좁은 창 재배치는 검증했다.
- 배포: [PR #9](https://github.com/LUCKYBRIDGE/story-maker/pull/9) 및 [PR #10](https://github.com/LUCKYBRIDGE/story-maker/pull/10) main 병합 완료,
  [GitHub Pages 배포 성공](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34309277601),
  [병합 후 CI 성공](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34309277625), Cloudflare Pages 프로덕션 배포 완료.
  [공개 화면](https://luckybridge.github.io/story-maker/)에서 첫 화면 고딕 선명도 개선, 가로/세로 적응형 레이아웃 및 이야기 분기 기능 정식 배포 확인.

## 이전 요청: BR-01 선택·분기·합류

- 상태: `DONE` (2026-09-09 구현·로컬 검증 완료, PR 검토 전). 사용자 직접 지정, Work Lead · G/A/B.
- branch: `codex/story-branching`, main `c24c90f`에서 시작, 기존 미커밋 변경 없음.
- 주 책임: 데이터 신뢰성, 검토: 교육 UX·QA.
- 범위: 컷 선택지 2/3개, 도착 컷·끝 연결, 갈래/합류 장 자동 준비,
  실제 경로 이전 탐색, 저장/Excel/공개 시트 왕복, 삭제 후 연결 보호.
- 인수: 2/3갈래 각각 재생·합류·다른 결말, 재선택, 이전 작품 회귀,
  정적 검사·전체 검사·정적 빌드, 데스크톱/태블릿/모바일 브라우저 검증.
- 기존 뒷이야기는 분기 생성 시 특정 선택지(1/2/3) 또는 공통 합류 뒤에 배정한다.
  취소는 무변경, 원문·컷 ID·소속 장 보존, 이후 도착 컷을 바꾸어 재연결할 수 있다.
- 자동 증거: `npm run check`, `npm test` 159/159 (기존 147 + 분기 12),
  `npm run build:pages`, 공식 Excel 생성 통과. 기존 SSR·키보드 회귀 포함.
- 브라우저: Chrome, 1365×900 / 820×1180 / 390×844. 세 갈래 작성·재생·합류,
  실제 경로 이전/재선택·키보드 선택점 건너뛰기 방지·새로고침 보존 통과.
  기존 두 컷 사이에 분기 삽입→취소→선택지 2로 뒷이야기 연결→각 결말 재생 통과.
  선택 버튼 44px 이상·가로 넘침 없음·콘솔 오류 없음.
- 모바일 글상자 초점 해제 시 높이 변화로 적용 클릭이 취소되는 문제도 수정했다.
- 재현: 개발 서버 후 `QA_URL=http://localhost:3002 PLAYWRIGHT_MODULE=<기존 Playwright 경로>
  node tests/browser/story-flow.mjs` 및 `tests/browser/story-flow-placement.mjs`.
  결과와 캡처는 `/tmp/story-flow-qa`. PR #9 및 PR #10으로 main 병합 및 정식 배포 완료.
- 물리 기기 IME, 무한 반복 스토리와 점수·조건부 선택은 범위 밖이다.

## 이전 요청: HS-01 첫 화면 공통 UI와 반응형

- 상태: `DONE` (2026-09-09 사용자 직접 지정). Work Lead · G/A/B. PR #7 병합 및 공개 배포 완료 (`67b4e26`).
- 기준: 원격 main `19abbd9`, clean 상태에서 `codex/start-screen-responsive` 분기.
- 주 책임: 교육 UX, 검토 관점: 접근성·QA. 첫 화면/일러스트/관련 검사만 수정.
- 인수: 두 테마 공통 UI 치수, 44px 버튼, 태블릿 양방향·웹·200% 확대,
  SSR 문구·모달·키보드 유지, check/test/build:pages 통과, PR 생성.
- 최종 로컬 검증: `npm run check` 오류 0, `npm test` 147/147 (SSR·키보드 계약 포함), `npm run build:pages` 통과.
- Chrome 자동 브라우저: 360×800, 390×844, 600×960, 768×1024, 820×1180,
  1024×768, 1440×900, 1920×1080, 720×450에서 두 테마 공통 영역 좌표 변화 0px,
  가로 넘침 0, 메인 버튼 44px 이상, 모달 초점·탭·Escape 복귀·읽기 진입 통과.
- 재현: dev 서버 후 `PLAYWRIGHT_MODULE=<기존 설치 경로>/playwright/index.mjs node tests/browser/start-screen.mjs`.
  결과/캡처는 기본 `/tmp/start-screen-qa`; `QA_URL`, `QA_OUTPUT` 지정 가능.
- 200% CSS zoom에서 모달 입력과 CTA 접근·가로 넘침 검증, 720×450 재배치 별도 확인.
  후속 공개 검증에서 실제 Chrome 확대 메뉴 200%를 확인하고 테마 변경·모달 탭·시트 입력란 접근,
  Escape 초점 복귀·읽기 앞표지·첫 컷·다음 컷·예시 닫기까지 통과했다. 검증 후 100%로 복원했다.
  물리 태블릿 터치/IME는 미검증.
- 자산: 사용자 제공 원본을 built-in imagegen으로 각각 편집. 프롬프트는 모든 글자·로고·버튼·금색 프레임·현판 제거,
  인물 얼굴·포즈·의상·색·머리/몸 비율·발과 배경 구도 보존, 상단 여백과 하단 종이색 유지.
  결과는 rabbit-turtle.poster.art.webp (940×1672), onggojib.poster.art.webp (941×1672), 각 약 208KiB.
  요청한 고해상도 대신 도구가 반환한 원본 크기를 보존하고 WebP quality 90으로 1회 압축했다.
  UI 텍스트/프레임은 해상도 독립적이며 비트맵 자체의 무한 확대 선명도를 보장하지 않는다.
- 후속 사용자 문구 결정: 두 테마 설명을 `당신이 직접 만들어 가는 이야기`로 통일한다.
- 배포: [PR #7](https://github.com/LUCKYBRIDGE/story-maker/pull/7) main 병합,
  [GitHub Pages 배포 성공](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34285350856),
  [병합 후 CI 성공](https://github.com/LUCKYBRIDGE/story-maker/actions/runs/34285350875), Cloudflare Pages 검사도 성공.
  [공개 화면](https://luckybridge.github.io/story-maker/)에서 신규 일러스트와 공통 UI·실제 상호작용 확인.
- 최초 정적 빌드의 캐시 DB 오류는 기존 .next를 작업 외부에 보존하고 새 빌드하여 해결했다.
- 기존 A1-02 승인 대기는 유지한다. 게임 캐릭터 자산과 저장/Excel 형식은 범위 밖이다.

## 이전 요청: BC-01 내 책 표지와 커튼

- 상태: `DONE` (사용자 직접 지정 후속 작업). Work Lead · G/A/B.
- branch: `codex/book-covers-curtain`; CE-01의 `c8d5912`에서 분기. 원격 main에는 CE-01이 아직 통합되지 않아 후속 브랜치가 이를 포함한다.
- 범위: 기본 표지·학생 커스텀·이어만들기·표지/커튼/플레이/뒤표지·v1/Excel 왕복.
- 책임: 교육 UX/프런트엔드, 검토 관점: 데이터 신뢰성·접근성.
- 자동: `npm run check` 오류 0, 빌드 포함 `npm test` 147/147 (신규 표지 7), 공식 양식 생성·검증.
- 브라우저: Chrome 152, 1365×900 / 390×844. 기본 표지, 필명/소개/그림/배치/색/크기 변경, 긴 제목,
  취소/Escape/초점 복귀, 기기 저장/새로고침 복원, 편집본·플레이 버전 분리 통과.
- 재생: 앱 진입 커튼, 앞표지→개막→첫 컷 효과, 중간 장 즉시 진입, 종료→뒤표지/작가의 말, 동작 줄이기 통과.
- 커튼 850ms, rAF 평균 약 16.7ms·p95 18.2~18.3ms (600ms 표본). 설정 버튼 최소 44px, 콘솔 오류 0.
- 재현: 개발 서버 후 `PLAYWRIGHT_MODULE=<기존 Playwright 모듈 경로> node tests/browser/story-book.mjs`.
  `QA_URL` 기본 localhost:3001, `QA_OUTPUT` 기본 `/tmp/story-book-qa`; 캡처/결과 JSON 저장.
- 캡처의 커튼은 중간 시점에서 정지해 외형 확인, 성능은 별도 비정지 실행. 실제 iOS/Android·IME는 미검증.
- 기존 CE-01 브라우저 회귀도 두 폭에서 통과: 5종 효과, 1.5초 지연, 각 24회 빠른 이동 후 잔여 연출 0, CPU 4배 감속 포함.

## 이전 요청: CE-01 장면 연출

- 상태: `DONE` (2026-09-08 사용자 직접 지정 작업; 기존 자산 승인 대기 유지)
- Work Lead · 증거 G/A/B · branch `codex/cinematic-effects`
- 범위: 컷 연출 5종, 편집/미리보기/플레이, 저장·Excel 호환, 자동·브라우저 검증.
- 자동 증거: `npm run check`, Vinext 빌드 포함 `npm test` 140/140 (기존 134 + 신규 6), 공식 양식 생성·검증.
- 브라우저: Chrome 152.0.7977.82, 1365×900 / 390×844. 설정·프리뷰·취소/초점 복귀·적용·새로고침 복원·플레이 버전 분리 통과.
- 두 폭 각각 빠른 이동 24회 뒤 잔여 연출 0, 플레이 종료 시 취소, 동작 줄이기, 버튼 44px, 콘솔 오류 0.
- 1.5초 지연 관측 약 1.52~1.53초. 3.2초 rAF 표본(조건별 192프레임): 평균 16.66~16.67ms,
  p95 17.5~17.6ms; CPU 4배 감속에서도 p95 17.5ms, 33.4ms 초과 0.
- 재현: 개발 서버 실행 후 `PLAYWRIGHT_MODULE=<기존 Playwright 모듈 경로> node tests/browser/story-effects.mjs`.
  기본 URL은 localhost:3001, `QA_URL`/`QA_OUTPUT`으로 변경. 새 프로젝트 의존성 없음.
- 캡처는 연출 진행 700ms에 정지해 외형 확인. 실제 타이밍·성능은 정지하지 않은 별도 실행으로 측정.
- 한계: 로컬 Chrome의 모바일 폭·CPU 감속 검증이며 실제 iOS/Android 및 모든 저사양 기기의 60fps 보장은 아님.

## 1. 현재 기준선

> 💡 **빠른 확인**: 세션 시작 시 `STATUS.md` 또는 `npm run status:check`를 실행하면 1초 만에 저장소 동기화 상태를 파악할 수 있어 토큰을 크게 절약할 수 있습니다.

| 항목 | 현재 사실 |
|---|---|
| 공유 기준선 | GitHub `main` (`c90efd5`); 세션 시작 시 `STATUS.md` 또는 `npm run status:check`로 확인 |
| 원격 저장소 | `LUCKYBRIDGE/story-maker`; 로컬에서는 `origin`으로 사용 |
| 로컬 작업 트리 | `c90efd5` 기준 `main` 브랜치 완전 동기화 (Clean) |
| `npm run check` | TypeScript 0 에러, ESLint 0 에러 통과 |
| `npm test` | Vinext 빌드 및 196/196 전체 통과 |
| 프로덕션 의존성 감사 | `npm audit --omit=dev` 0건 |
| 알려진 경고 | 최소화 후 500KB 초과 청크, Vinext가 쓰는 `image-size` 개발 의존성 경고 2건 (PR #14 대기) |
| 구현 기준 | U1~U2, CE-01, BC-01, BR-01, SP-A~F, 서재 Focus Stage (PR #21 머지 완료) |
| 자산 구조 | taxonomy v1 adapter 구현, v2는 목표 아키텍처만 확정 |
| 캐릭터 정렬 | A1-01 자동 Audit 완료. A1-02는 사람의 후보 자산 승인 대기로 BLOCKED |
| GitHub 기준선 | PR #21 머지 완료 (`c90efd5`), stale PR #15 정리 완료 |
| 이번 좁은 검사 | 서재 책 꺼내기 Focus Stage 인터랙션, 원목 거치대 및 선택 액션 4종 카드 |
| 새 UI | 서재 중심 진입, Focus Stage 부드러운 팝업 및 좌우 연속 탐색, ESC/닫기 복귀 |

실제 브라우저 상호작용의 검증 범위는 §4에 따로 기록한다. 정적·전체 검사 통과가
네이티브 모바일 키보드, 저장 할당량, 긴 작품 성능의 검증을 뜻하지 않는다.

## 2. 상태 정의

| 상태 | 의미 |
|---|---|
| `BLOCKED` | 선행 작업·승인·실행 조건을 기다려 시작 금지 |
| `DEFERRED` | 사용자 우선순위 변경으로 유예. 완료·폐기 아님 |
| `READY` | 현재 세션이 선택해야 하는 유일한 작업 |
| `IN_PROGRESS` | 사전 점검 후 실제 편집을 시작함 |
| `DONE` | 모든 인수 조건과 검증 증거가 있음 |

## 3. 전체 작업 대기열

| 순서 | ID | 상태 | 의존성 | 결과물 |
|---:|---|---|---|---|
| 0 | OPS-01 | `DONE` | 없음 | 운영 헌장·계획·런북·상태표 |
| 0.1 | OPS-02 | `DONE` | 사용자 직접 요청 | 저장소·문서·의존성·로컬 작업물 정리 |
| 1 | G0-01 | `DONE` | OPS-01 | 재사용 가능한 작품 fixture와 fixture 검사 |
| 2 | G0-02 | `DONE` | G0-01 | 현재 v1 호환 동작 특성 검사 |
| 3 | G0-03 | `DONE` | G0-02 | 핵심 사용자 흐름 7개 실행 명세 |
| 4 | G1-01 | `DONE` | G0-02 | 버전이 있는 작품 문서 봉투 |
| 5 | G1-02 | `DONE` | G1-01 | parse·normalize·validate·v1 마이그레이션 |
| 6 | G1-03 | `DONE` | G1-02 | 로컬 저장소 어댑터와 저장 상태 |
| 7 | G1-04 | `DONE` | G1-03 | 체크포인트·복구·삭제 되돌리기 |
| 8 | G2-01 | `DONE` | G1-04 | 장면 변경 순수 명령 |
| 9 | G2-02 | `DONE` | G2-01 | 장면·스크롤·초점 위치 복원 |
| 10 | G2-03 | `DONE` | G2-02 | 오류 위치 이동과 강조 |
| 11 | G2-04 | `DONE` | G2-03 | 창작 메모 왕복과 되돌리기 |
| 12 | G2-05 | `DONE` | G2-04 | 비채점형 고쳐쓰기 순환 |
| 13 | G3-01 | `DONE` | G2-05 | 화면 상태와 작품 상태 분리 |
| 14 | G3-02 | `DONE` | G3-01 | Excel·시트 어댑터와 공통 오류 모델 |
| 15 | G3-03 | `DONE` | G3-03-01~07 | 화면·Dialog·CSS의 점진 분리 묶음 |
| 15.1 | G3-03-01 | `DONE` | G3-02 | 공통 ModalDialog 기반 |
| 15.2 | G3-03-02 | `DONE` | G3-03-01 | Asset Picker 컴포넌트 분리 |
| 15.3 | G3-03-03 | `DONE` | G3-03-02 | 시작 화면 분리 |
| 15.4 | G3-03-04 | `DONE` | G3-03-03 | 이야기 구상 화면 분리 |
| 15.5 | G3-03-05 | `DONE` | G3-03-04 | 대본 전체 화면 분리 |
| 15.6 | G3-03-06 | `DONE` | G3-03-05 | 장면 꾸미기·창작 메모 표면 분리 |
| 15.7 | G3-03-07 | `DONE` | G3-03-06 | 플레이 화면·CSS 경계 분리 |
| 16 | G3-04 | `DONE` | G3-03, G0-03 | 핵심 상호작용 자동 검사 |
| 17 | G4-01 | `DONE` | G3-04 | 가져오기 오류·미리보기 경험 |
| 18 | G4-02 | `DONE` | G4-01 | 이미지·번들·오프라인 성능 |
| 19 | G4-03 | `DONE` | G4-02 | 접근성 마감 |
| 20 | G4-04 | `DONE` | G4-03 | 교실 파일럿과 상위 문제 3개 |
| 21 | G5-01 | `DONE` | G4-04 | 새 작품 플레이 분리와 빈 장의 컷 안전성 |
| 22 | G5-02 | `DONE` | G5-01 | Excel·시트의 중복 ID와 잘못된 값 거부 |
| 23 | G5-03 | `DONE` | G5-02 | 장·컷 용어와 모바일 조작 접근성 정리 |
| 24 | G6-00 | `DONE` | G5-03 | 설계 결정·ADR·실행 카드 등록 |
| 25 | G6-01 | `DONE` | G6-00 | 다중 단계 데이터 계약·v1 호환 |
| 26 | G6-02 | `DONE` | G6-01 | 단계 계산·추천·안내 순수 모듈 |
| 27 | G6-03 | `DONE` | G6-02 | 장별 다중 단계 선택기 |
| 28 | G6-04 | `DONE` | G6-03 | 반응형 장-단계 이야기 흐름표 |
| 29 | G6-05 | `DONE` | G6-04 | 대본·메모·고쳐쓰기 연결 |
| 30 | G6-06 | `DONE` | G6-05 | Excel·Google 시트 호환과 템플릿 |
| 31 | G6-07 | `DONE` | G6-06 | 전체 사용자 흐름 검증과 문서 마감 |
| 32 | A1-00 | `DONE` | G6-07 | 캐릭터 정렬·비율 기준 공식화 |
| 33 | A1-01 | `DONE` | A1-00 | 캐릭터 기준본·앵커 자동 Audit |
| 34 | A1-02 | `BLOCKED` | A1-01; 사람의 후보 자산 승인 | 승인 감정 세트 등록·무대 검수 — 원본·카드 보존 |
| 35 | U1-00 | `DONE` | 사용자 직접 계획 정비 요청 | 목업·소스·기준 문서 정합화 |
| 36 | U1-01 | `DONE` | U1-00 | 구성01·현행 DOM·원작 두 이야기 재생 확인; 지정 크기 캡처·치수 검증 마감 |
| 37 | U1-02 | `DONE` | U1-00 + 확인된 위치·필드 기준선 | 작품별 위치 저장·메인/플레이/새로고침 복귀 계약 |
| 38 | U1-03 | `DONE` | U1-01, U1-02 | 공통 셸·목표 토큰의 제한적 적용 |
| 39 | U1-04 | `DONE` | U1-03 | 메인 A·새 이야기와 이어만들기 |
| 40 | U1-05 | `DONE` | U1-04 | 독립 이야기 구성 화면 단순화 |
| 41 | U1-06 | `DONE` | U1-05 | 장 순서·후보 자료·기본 무대 조작 |
| 42 | U1-07 | `DONE` | U1-06 | 편집·플레이 공통 읽기 전용 무대 |
| 43 | U1-08 | `DONE` | U1-07 | 대본·컷 왕복과 가까운 이미지 선택 |
| 44 | U1-09 | `DONE` | U1-08 | 플레이 인덱스·예시 격리·현재 컷 수정 |
| 45 | U1-10 | `DONE` | U1-09 | 원작을 참고한 플레이 가독성·반응형 |
| 46 | U1-11 | `DONE` | U1-10 | 통합 호환·반응형 인수와 문서 마감 |
| 47 | U2-01 | `DONE` | 사용자 시작점 결정 | 두 전래동화 위기부터 이어쓰기; 114/114 검사 통과 |
| 48 | U2-02 | `DONE` | U2-01 및 사용자 이어작업 요청 | 공통 프레임·모바일 공개 수준·160자 안내/나누기, 120/120 통과 |
| 49 | CE-01 | `DONE` | U2-02 | 컷 시네마틱 연출 5종·강도·시점 설정 및 미리보기·플레이 |
| 50 | BC-01 | `DONE` | CE-01 | 학생 책 표지 3종 배치, 커튼 연출 및 앞·뒤표지 재생 |
| 51 | BR-01 | `DONE` | BC-01 | 2/3지선다 선택지 분기 및 합류 비주얼 스토리 플레이 |
| 52 | SP-A~F | `DONE` | BR-01 | 격리 보관함(2작품), .nolstory 파일 규격, 출처 보존 고쳐쓰기, 가변 글상자 |
| 53 | Focus Stage | `DONE` | SP-A~F | 서재 책 꺼내기 Focus Stage 감성 연출, 원목 거치대 및 선택 카드 (PR #21) |

## 4. 현재 실행 지시

- U2-02 DONE — 2026-09-08 마감. 사용자 이어작업 요청에 따라 U2-01 다음 작업을 같은 대화에서 이어 실행했다.
  Work Lead, 교육 UX 주 책임 / 접근성·프런트엔드 검토. 태블릿 페이지 구조 유지,
  편집/플레이 공통 프레임 및 모바일 정보량 정리, 한 컷 160자 안내·무손실 분할·되돌리기.
  선택지·저장 형식·자산 교체 없음. `npm run check`, 빌드 포함 `npm test` 122/122 통과.
  상세 증거: [U2-01/02 검증 기록](qa/U2-02-writing-first-verification.md).
  로컬 미커밋이며 배포되지 않았다. 물리 기기 IME·실터치는 완료 증거에 포함하지 않는다.
  현재 READY 없음: 다음 자산 작업은 사람의 승인이 필요하다. 실기기 결과 수집 또는 승인 후 작업 카드를 확정한다.

- U2-01 DONE — 2026-09-07 사용자 직접 결정: 토끼는 용궁 위기, 옹고집은 첫 재판장 도착부터 이어쓰기.
  Work Lead, 초등 국어 교사 주 책임 / 작가·편집자·데이터 신뢰성 검토. 새 템플릿과 진입 안내만 변경하며
  기존 저장본·Excel·선택지 미도입 계약을 보존한다. 카드: `docs/tasks/storygame-atomic-task-cards.md` U2-01.
  정적 검사와 Vinext 빌드 포함 전체 114/114 통과(추가 회귀 5개), 두 틀의 Excel/로컬 왕복 검증.
  로컬 브라우저에서 두 틀의 빈 컷·직전 위기·입력·적용·플레이·편집 복귀 확인.
  CSS 390×844 및 820×1180 크기를 DOM 실측; 최초 토끼 검증은 354×767도 포함.
  실기기 IME는 미검증. 관련 UI 추가 검증은 U2-02에서 수행한다.

- A1-02 BLOCKED: 미디어 자산 편집자 주 책임, 교육 UX 디자이너·프런트엔드 아키텍트·QA 검토.
  U2 우선으로 유예했던 이력을 보존하며, 현재는 후보 자산의 사람 승인 전까지 시작하지 않는다.
  인수 조건인 800×1200·알파·groundY 기준 및 71개 후보 자산의 수동 검토·기준점 승인 준비 상태를 확인한다.
  (외부 승인 대기: 사람의 시각적 랜드마크 승인이 필요하며, 임의로 자동 완료하지 않는다.)

- 물리 기기 및 외부 검증 가이드 추가 — 2026-09-07: QA·릴리스 책임자 주 책임.
  데스크톱 가상 뷰포트 시뮬레이션으로 확인할 수 없는 실제 모바일 환경(iOS Safari / Android Chrome)의
  소프트 키보드 가림, 한글 두벌식 IME 조합 버퍼링, Safe Area(노치/홈바) 간섭, 44px 실터치 검증을 위한
  실기기 점검 가이드(`docs/qa/physical-device-verification-guide.md`)를 작성했다.
  개발 서버 외부 바인딩(`npm run dev -- -H 0.0.0.0 -p 3000`) 및 5대 점검 체크리스트를 제공한다.

- U1-11 완료 — 2026-09-07: QA·릴리스 책임자 주 책임, 초등 국어 교사·데이터 신뢰성 검토.
  CF-01~13 전체 핵심 사용자 흐름 자동화(`tests/core-user-flows.test.mjs` 13/13 Pass) 및 headless Chrome 152.0 환경에서 실측 완료.
  학생 전체 라이프사이클(메인→구성→대본/컷 편집→플레이 적용→플레이어 재생→이 컷 고치기→안정 ID로 편집기 복귀) 완주 확인.
  5개 장 200컷 대규모 스트레스 테스트(1000자 대사, 1000자 해설, 줄바꿈, 긴 무공백 문자열 포함) 로드 1.8초, 멈춤 없음.
  7개 뷰포트(1440, 1280, 1024, 820, 390, 844x390, 320) 및 200% 확대(zoom200)에서 가로 스크롤 넘침 0건, 조작 버튼 44px 이상 전원 충족.
  공식 템플릿(`놀퀴즈_스토리_템플릿.xlsx`) 생성(108개 자산) 및 Excel 왕복 검증 통과.
  실측 데이터(`U1-11-capture-metrics.json`) 및 캡처 12개 보존 완료.
  검증: `npm run check`, Vinext 빌드 포함 `npm test` 109/109 통과, `template:generate` 0오류, `npm audit` 0취약점.

- U1-10 완료 — 2026-09-07: 교육 UX 디자이너 주 책임, 접근성·미디어 자산·프런트엔드 아키텍트 검토.
  GitHub PR #1의 정적 회귀 및 CI 검증을 거쳐, Work/로컬 격리 Chrome 152.0 환경에서 7개 주요
  뷰포트(1440×900, 1280×720, 1024×768, 820×1180, 390×844, 844×390, 320×800) 및 200% 확대(zoom200)
  실측을 완료했다. 모바일 78px 고정 높이를 해제하고 document-flow 기반 스크롤을 적용하여 1017자
  대사 및 1000자 해설 전체 완독이 가능함을 확인했다. 전 뷰포트에서 가로 스크롤 넘침이 없으며(0건),
  조작 버튼(이전, 다음 컷, 이 컷 고치기, 편집으로 돌아가기, 장 선택기) 모두 44px 이상 터치 타깃을
  충족했다. 화자명 분리, 괄호 지시문 하이라이트, 다중 단락 줄바꿈 보존, 긴 무공백 문자열 줄바꿈,
  자산 로드 에러/빈 자산 대체 렌더링, 컷별 안정 ID 기반 편집 화면 복귀 및 옹고집전·토끼와 자라
  템플릿 재생을 실화면으로 검증했다. 실측 데이터(U1-10-capture-metrics.json) 및 캡처 13개를 보존했다.
  검증: `npm run check`, Vinext 빌드 포함 `npm test` 108/108 통과, PR #1 CI 통과. 다음 U1-11만 READY로 연다.


- U1-09 완료 — 2026-09-05: 프런트엔드 아키텍트 주 책임, QA·릴리스·교육 UX 검토.
  main/origin과 기존 미커밋 변경을 확인하고 비교본을 `/tmp/u1-09-before`에
  보존한 뒤 IN_PROGRESS로 전환했다. 시작 좁은 검사 20/20, 신규 회귀 실패를
  먼저 확인하고 허용 소스 5개·테스트 3개·이 상태표만 변경했다.
  `selectStoryPlayerPosition`의 한 계산 결과로 본문·카운터·이전/다음·선로딩·
  현재 컷 ID를 연결했다. 빈 전체/빈 장은 0/0·탐색 비활성화, 유한 소수는 내림,
  음수/초과는 유효 범위, NaN/무한대는 첫 컷으로 정규화한다.
  `편집으로 돌아가기`는 진입 화면·보기·안정 ID·caret·스크롤을 복원하고,
  `이 컷 고치기`는 재생 작품 ID와 컷 ID를 현재 편집본에서 확인해 집중 편집을 연다.
  삭제된 현재 컷·진입 컷·다른 작품은 대체 컷을 열지 않고 이야기 구성으로 안내하며
  초점을 돌린다. 예시/학생 재생 스냅숏을 별도 컨텍스트로 두고 닫으면 폐기한다.
  예시는 active를 교체하지 않으며 학생 draft/active/UI 저장값을 변경하지 않는다.
  예시에는 학생용 컷 수정·고쳐쓰기 응답 저장을 노출하지 않고, 학생 플레이는
  명시적으로 적용한 스냅숏만 읽는다. 미적용 글은 자동 반영하지 않는다.
  전역 키 처리는 플레이 영역의 비입력 대상에만 적용한다. 입력·textarea·select·
  button 자식·contenteditable·이미 처리된 키·IME 조합·수정 키는 가로채지 않는다.
  플레이 진입은 맨 위와 무대 초점, 예시 종료는 메인의 호출 버튼 초점을 복원한다.

  검증: 지정 좁은 검사 25/25, `npm run check`, Vinext 빌드 포함 `npm test`
  107/107, `git diff --check` 통과. Excel/이전 작품 호환 검사도 전체 검사에 포함된다.
  격리 Chrome 1440×900·390×844에서 실제 클릭/키 입력으로 예시→닫기 저장값
  비교, 학생 6컷 중 5번째 재생→수정, 대본 진입 위치·본문 선택 범위 복원,
  이야기 구성→플레이→구성 복귀, 편집본에서 재생 컷 삭제 후 기존 적용본 재생→
  수정 요청의 안전한 안내를 확인했다. 같은 플레이에 임시 input/textarea/button/
  select/contenteditable을 넣어 Enter/Space 기본 동작, 버튼 2회 정상 실행,
  입력 공백·줄바꿈 및 플레이 인덱스 불변을 확인했다. 무대의 Enter/Space/방향키/
  Escape 탐색도 유지된다. 가로 넘침 없음, 플레이 버튼·선택기 모두 44px 이상.
  데스크톱의 하단 조작은 세로 스크롤로 접근 가능하며 무대/대사 높이 조정은
  U1-10 범위로 남긴다. 추가 런타임 상태 주입으로 비정상 인덱스·빈 전체,
  삭제된 진입 컷·다른 작품 ID에서도 잘못된 컷이 열리지 않음을 두 크기에서 확인했다.
  이 상태 주입은 실제 여러 기기 동시 편집 검증을 의미하지 않는다.
  임시 검증 작품의 끊어진 continuation 참조와 스크롤 후 클릭 좌표 문제는
  검증 도구에서 원인을 수정했으며 서비스의 저장 검사를 완화하지 않았다.

  재현 도구 `/tmp/u1-09-browser.mjs`와 입력 `/tmp/u1-09-fixture.json`, 로그
  `/tmp/u1-09-{baseline,narrow,check,test,browser}.log`, 캡처
  `/tmp/U1-09-{example,student}-{1440,390}.png`. 캡처를 열어 시각적으로 확인했다.
  iOS Simulator(simctl)·Android adb가 없어 네이티브 모바일 키보드는 미검증이며
  U1-11 실제 기기 항목으로 넘긴다. 자산·Excel·StoryProject 형식·의존성·호스팅
  설정은 변경하지 않았다. 기존 작업을 보존했고 2026-09-05 커밋 `767f76e`로
  `origin/main`에 푸시했다. 별도 배포는 하지 않았다.

- U1-08 완료: 교육 UX 디자이너 주 책임, 프런트엔드 아키텍트·접근성 검토.
  `ScriptScreen.tsx`, `SceneFocusEditor.tsx`, `AssetPickerButton.tsx`,
  `StoryStudio.tsx`, `story-editor-location.ts`의 현재 컷 선택·보기 왕복·스크롤·
  caret·picker 적용/취소 경로를 확인했습니다. 화면 용어를 `이 장 대본`으로
  바로잡고 선택 컷의 공통 무대를 대본 위에 배치했습니다. 컷 집중에는
  `글/왼쪽 이미지/오른쪽 이미지/배경` 탭, 같은 인물·장 후보, 전체 자료 찾기,
  저장 전 무대 미리보기, 취소·`이 컷에 사용`·`장의 기본으로`를 연결했습니다.
  전체 자료 창도 선택 즉시 저장하지 않고 별도 확인 뒤 바깥 미리보기로 돌아오며,
  Escape·Tab 순환·호출 버튼 초점 복귀와 대상 컷/필드 변경 시 닫기 안전장치를
  갖습니다. 장 기본 복귀는 컷 override만 비웁니다.
  대본↔컷 왕복은 안정 ID·scrollY와 현재 textarea 선택 범위를 보존하고 글 길이가
  줄면 안전하게 범위를 제한합니다. 추가·복제·이동·삭제 뒤 유효 본문에 초점을
  두고 삭제 되돌리기는 삭제했던 컷으로 복귀합니다. Chrome 1440×900,
  1024×768, 390×844에서 네 탭·44px·가로 넘침을 확인했고 390×430에서는 무대를
  300px 폭 16:9로 축소해 글상자 하단이 화면 안에 남았습니다. 한글 composition
  중 390→1024 리사이즈에도 같은 textarea DOM·초점이 유지됐습니다. 빠른 후보와
  전체 창의 미리보기·취소는 저장 불변, 적용은 현재 컷만 변경, 장 기본값/다른 컷
  불변을 실제 저장본으로 비교했습니다. 컷 추가·복제·이동·삭제·undo의 선택/초점도
  통과했습니다. 재현 `/tmp/u1_capture.mjs u1-08`, 로그
  `/tmp/u1-08-browser.log`, 캡처 `/tmp/U1-08-{assets-390,picker-390,
  scene-390x430,manuscript-1024}.png`. iOS simctl과 Android adb가 없어 네이티브
  키보드는 미검증이며 U1-11의 실제 기기 항목에 남깁니다. 좁은26/26, 화면 계약
  포함41/41, 정적 검사, Vinext 빌드·전체102/102, `git diff --check` 통과.
  자산·Excel·작품 스키마·의존성·호스팅 설정, 커밋·푸시·배포는 변경하지 않았습니다.

- U1-07 완료: 프런트엔드 아키텍트 주 책임, 교육 UX·미디어 자산 검토.
  캐릭터 포즈 정렬 ADR을 읽고 원본 파일·ID·임의 크기 보정을 변경하지 않는 범위로
  시작했습니다. `story-stage-view.ts`에 장 기본값/컷 override·배경 경로·인물
  방향/구도·없는 자료·공백 화자명을 해석하는 읽기 전용 모델을 추출했습니다.
  SceneThumbnail·SceneFocusEditor·StoryPlayer의 유효 이미지 선택을 해당 모델로
  연결했고, 기존 배치/반전 함수는 호환 wrapper로 남겼습니다. 알 수 없는 명시
  ID는 장 기본값으로 조용히 대체하지 않습니다. 빈 컷·기본값·override·입력 불변·
  없는 ID·좌우 방향 검사 추가, 좁은8/8·정적 검사·빌드·전체99/99 통과.
  모델 연결 후에도 Chrome1440×900/390×844에서 U1-06의 장 이동·후보/기본값
  독립·상속/개별 배경·기본값 해제·컷/메모 보존 흐름을 다시 통과했습니다.
  후속으로 `StoryStage.tsx`의 읽기 전용 `StoryStageCharacter`를 세 표면에 연결해
  방향/구도·로딩·이미지 오류 표시를 공통화했습니다. src/ID 변경 시 실패 상태를
  새로 시작하며 빈 ID는 인물을 표시하지 않습니다. 실패 안내에는 반전을 적용하지
  않습니다. 썸네일 대사 span 스타일이 오류 안내에 섞이지 않도록 선택자를 분리했습니다.
  공통 사용·읽기 전용 계약 검사를 추가해 정적 검사·빌드·전체100/100 통과.
  격리 Chrome에서 실제 img error 이벤트를 주입해 썸네일(1440/820/390/844가로),
  컷 집중·플레이의 오류 안내 전환을 확인했습니다. 이는 HTTP 실패 응답 검사가 아니라
  이미지 오류 이벤트 처리 검사입니다. 재현은 `/tmp/u1_capture.mjs u1-07-render`.
  테스트 초기에 집중 편집에서 썸네일을 찾던 문제는 화면 상태를 읽어 확인한 뒤
  '대본 전체로' 동선으로 수정했습니다. 서비스의 해당 동선은 바꾸지 않았습니다.
  배경도 `StoryStageBackground`로 공통화했습니다. CSS backgroundImage 중복을
  실제 img+동일 명암 레이어로 바꾸고 unknown ID/이미지 error 안내 및 ID/src 변경
  시 오류 초기화를 제공합니다. 세 호출부의 공통 배경 사용·CSS 배경 중복 없음
  계약을 추가했습니다. 정적 검사·빌드·전체100/100, `git diff --check` 통과.
  `/tmp/u1_capture.mjs u1-07-render`에서 세 표면의 배경 error 이벤트 주입과
  안내 전환도 통과했습니다. 실제 HTTP 실패 응답 검증과는 구분합니다.
  후속 배치 통일: 세 표면에 `StoryStageCanvas`를 사용해 16:9 캔버스와 인물
  영역 폭42%·높이80%·하단8%·좌우4%를 공통 적용했습니다. 원본 이미지는 contain과
  하단 정렬이며 기존 listener의 축소/이동은 덮어써 같은 좌표를 유지합니다.
  썸네일 글, 집중 편집의 선택 버튼/글상자, 플레이 상단/대사는 캔버스 밖으로
  분리했습니다. 이로써 글·조작을 위한 음수 위치나 서로 다른 높이 단위를 쓰지 않습니다.
  Chrome 1440×900/820×1180/390×844/844×390에서 세 표면(총12조합) DOM 실측으로
  캔버스 비율·인물 영역 비율·contain·캔버스 내부 배치·가로 넘침 없음을 확인했습니다.
  토끼·자라·용왕이 포함된 캡처에서 데스크톱 플레이/모바일 집중 편집을 시각 검토했습니다.
  재현 `/tmp/u1_capture.mjs u1-07-layout`, 로그 `/tmp/u1-07-layout.log`, 캡처
  `/tmp/U1-07-{editor,thumbnail,player}-{width}.png`. 캡처의 smooth scroll 지연은
  instant 스크롤 뒤 촬영으로 수정했습니다. 이미지/배경 오류 처리 검사도 새 캔버스에서
  다시 통과했습니다. 정적 검사·빌드·전체100/100, `git diff --check` 통과.
  마지막으로 토끼/자라, 회복 용왕/의관, 옹고집 두 인물의 세 쌍을 같은 컷에 넣고
  좌우를 교환했습니다. 세 표면×네 화면 크기×여섯 배치, 총72조합에서 두 이미지의
  동일 ID 순서, 로드 완료, 높이80%·하단8%, contain, 캔버스 내부 배치를 DOM으로
  확인했고 390px 플레이 캡처 6개를 시각 검토해 머리·발 잘림과 좌우 교환 시 크기
  변화를 찾지 못했습니다. 대표 6개 원본의 읽기 전용 Audit은 모두 800×1200,
  edgePixels=0, KEEP이며 groundY는 5개 1149, 의관 1146(허용 범위)입니다.
  전체88개 결과는 KEEP15, 평행이동 후보1, 수동 검토71, LEGACY1로 유지됩니다.
  `onggojib.character.youngest-child-pixel`의 groundY=1141(-8px)은 UI/CSS 결함이
  아닌 A1-02 평행이동 후보로 기록하고 이번 카드에서 보정하지 않았습니다. 모든
  포즈의 얼굴 기준점 승인까지 완료했다는 뜻은 아닙니다. 좁은8/8, 정적 검사,
  Vinext 빌드·전체100/100, `git diff --check` 통과. 자산 ID/파일/작품 참조,
  커밋·푸시·배포는 변경하지 않았습니다.

- U1-06 완료: 장 순서 순수 명령 `moveStoryChapter`와 선택 장 위/아래 이동을
  연결했습니다. ID·단계·컷·메모는 유지하고 order만 재정렬합니다. 첫/끝·1개·
  빈 목록·없는 대상 실패와 입력 불변 회귀를 추가했습니다. 기본 무대에는 기존
  이미지 선택기를 재사용해 좌/우/배경 선택·해제를 제공하며 후보 자료와 따로
  표시합니다. 후보 추가는 기본값을 바꾸지 않고 기본값 변경은 컷 필드를 수정하지
  않는 기존 updateChapter 경로를 사용합니다. 초기 좁은 검사 27/27, 이후 정적
  검사·빌드 포함 전체97/97 통과, `git diff --check` 통과.
  Chrome 1440×900·390×844에서3장 가운데 장을 처음/끝으로 이동, 끝 이동 비활성,
  선택 장 유지, 배경 선택 저장, 컷/메모 저장값 불변·가로 넘침 없음을 확인했습니다.
  비교 기준은 fixture 주입 전이 아니라 정상화·기기 저장이 끝난 편집 직전 상태로
  고정했습니다. 임시 재현: `/tmp/u1_capture.mjs u1-06`.
  후속 실제 검사에서 Enter로 첫 장까지 이동할 때 disabled 버튼에서 body로 초점이
  빠지는 문제를 재현했습니다. 이 경우에만 현재 장 순서 그룹으로 초점을 복귀시키고
  현재 순번의 접근성 이름·초점 테두리를 제공합니다. 이동 중 같은 장 ID는 유지됩니다.
  1440×900·390×844에서 해당 초점 복귀, 배경 후보 추가 시 기본값 불변, 기본 배경
  선택 후 상속 컷 썸네일만 변경·개별 grassland 배경 유지, 기본값 해제 후 상속 컷의
  배경 없음·개별 배경 유지, 대본 진입 가능을 확인했습니다. 두 컷 fixture는 각각
  빈 backgroundId와 명시 backgroundId를 가집니다. 기존 글만 보기에서는 썸네일이
  없으므로 검사 시 실제 보기 설정을 작은 그림으로 변경했습니다.
  최종 정적 검사·빌드·전체97/97, `git diff --check` 통과. 네이티브 모바일 기기
  검증은 통합 단계에 남기며, 이번 결과는 격리 Chrome의 대표 크기 검증입니다.
  U1-07 카드와 세 무대 소스 위치를 확인해 READY로 열었습니다. 이번 세션에는
  시작하지 않았고, 커밋·푸시·배포하지 않았습니다.

- U1-05 완료: 교육 UX 주 책임, 데이터 보존·접근성 검토 관점으로 독립 구성
  화면을 정리합니다. 사전 좁은 검사(단계·v1 호환·핵심 흐름) 20/20 통과.
  이야기/장 탭 분기를 제거해 작품 기본·큰 생각·뼈대는 펼치기, 장 목록과 선택
  상세는 동시에 보이게 바꿨습니다. 중복 매트릭스/카드를 단일 목록으로 정리하고
  1200px 미만은 장 선택기로 표시합니다. 자세한 장 계획은 접고 모든 기존 필드,
  다중 단계 토글·미연결·대본 진입 콜백은 유지했습니다. 이어쓰기 안내 배너는
  대본 편집에만 표시해 구성 화면의 공간을 확보했습니다.
  Chrome 1440×900/1024×768/820×1180/390×844에서 목록1·상세1·가로 넘침 없음을
  확인했습니다(`/tmp/u1_capture.mjs u1-05`, `/tmp/U1-05-plan-{width}.png`).
  기존 CSS의 가로 자동 배치 상속은 세로 목록 명시로 수정했습니다. 옛 매트릭스와
  단일 사건 안내를 요구하던 소스 문자열 검사는 새 승인 배치·다중 단계·필드 보존
  계약으로 교체했습니다. 이는 실제 편집 상호작용 검사를 대체하지 않습니다.
  최종 `npm run check`, 빌드 포함 `npm test` 94/94, `git diff --check` 통과.
  최종 좁은 검사 21/21, 정적 검사·빌드 포함 전체 95/95 통과. CF-11에 모든
  planning 문자열·장 필드·다중 단계·메모 내용/연결의 Excel 왕복 검사를 추가했습니다.
  메모 시각은 공식 양식의 열이 아니며 기존 importer가 새로 부여하므로 내용/연결과
  구분해 유효 시각을 검사합니다(시각 왕복 보존을 주장하지 않음).
  테스트 전용 Chrome에서 네 크기 각각 장0/1/5/20·긴 제목(총16조합), 첫 장 명시
  추가, 3→4→5 전환 뒤 숨긴 위기/절정 메모 보존, 장 상세 보존, 입력/caret 선택
  상태를 유지한 크기 변경, 빈 컷 장의 대본 진입·같은 장 복귀를 확인했습니다.
  데스크톱은 실제 목록 버튼 Enter 선택, 중간/모바일은 native select 변경 경로를
  사용했습니다. 재현 도구는 `/tmp/u1_capture.mjs u1-05-edit`입니다.
  800~1199px도 접이식 긴 목록보다 상세 공간을 확보하는 단일 선택기를 적용했고,
  1024/820px에서 원문과 선택 유지·가로 넘침 없음을 검증했습니다. 목록 데이터나
  선택 상세를 리사이즈로 재마운트하지 않습니다.
  펼친 기본 계획 화면도 가로 넘침 없으며 34px/23px였던 삭제 조작을 44px 이상으로
  보정했습니다. 구성 화면의 적용 안내는 고정 배치를 해제해 입력 가림을 없앴습니다.
  마지막 캡처 `/tmp/U1-05-open-{width}.png`와 1440px 실화면에서 가림 해소 확인.
  실제 모바일 기기 IME/가상키보드 및 Safari는 U1-11 통합 검증 범위로 남깁니다.
  장 이동·기본 무대 조작은 U1-06 카드 범위라 이번에는 구현하지 않았습니다.
  해당 카드·기존 소스 위치를 확인해 U1-06만 READY로 열었습니다. 커밋·푸시·배포 없음.

- U1-04 완료: 메인 두 카드와 확정 문구, 기존 세 템플릿·로컬/Excel/공개 시트
  진입을 연결했습니다. 메인에서는 자동 초안 저장을 시작하지 않도록 제한했고,
  읽기 상태를 checking/available/missing/failed로 분리했습니다. 빈 작품·템플릿은
  메인 교체 확인을 거치고 Excel input은 파일 전달 전에 초기화합니다. 공개 시트
  주소는 메인의 별도 입력 상태로 받아 기존 draft를 수정하지 않고 검사합니다.
  이 중간 구현에서 `npm run check`, 빌드 포함 `npm test` 93/93이 통과했습니다.
  격리된 Chrome에서 1440×900/1024×768/390×844 두 카드·가로 넘침 없음,
  빈 메인의 예시 자동 저장 없음, 템플릿 진입, 교체 취소 시 저장 문자열 불변,
  손상 JSON 보존, 저장 접근 거부 시 런타임 예외 없음, 복구 기록 실패 시 교체 중단을
  확인했습니다. 고정 저작권 문구의 콘텐츠 겹침도 제거했습니다. 이후 정적 검사와
  전체 93개 회귀 검사를 다시 통과했습니다.
  후속 검증에서 Excel 가져오기 성공 뒤 다른 작품의 active가 남아 플레이 가능한
  오류를 실제 브라우저로 재현했습니다. confirmImport에서 기존 작품 ID 선택자를
  재사용해 다른 작품의 active를 비우고 저장하도록 수정했습니다. 같은 작품의
  기존 적용본은 유지합니다. 실제 Excel 취소 시 draft/active 저장 문자열 불변,
  같은 파일 재선택, 성공 뒤 ID 일치·적용 전 플레이 비활성화를 확인했습니다.
  선택자 계약 회귀 검사를 추가했고 좁은 검사 28/28, `npm run check`, 빌드 포함
  `npm test` 94/94 및 `git diff --check`를 통과했습니다. 실제 UI 재현은
  `/tmp/u1_capture.mjs u1-04-import`로 수행했으며 선택자 단위 검사와 구분합니다.
  최종 검증: 1440×900/1024×768/390×844 각각 빈 작품·세 템플릿·로컬 복귀,
  공개 시트 확인/취소/성공, Excel 재선택/취소/성공 뒤 active 분리, 파일 없음과
  잘못된 확장자 뒤 작품 불변을 확인했습니다. 공개 시트 응답은 공식 Excel의
  CSV를 브라우저 네트워크에서 대체한 테스트이며 실제 Google 공유 권한·가용성을
  검증한 것은 아닙니다. 파일 없음은 headless 파일 입력의 빈 선택 경로로 검증했고
  운영체제 파일 선택창 자체를 조작하지는 않았습니다.
  메인 확인창 Enter 진입·Escape 닫기·원래 버튼 초점 복귀 및 주요 입력/버튼
  44px 목표를 확인했습니다. 처음 Enter 검사 실패는 CDP 키 입력의 text 누락으로
  재현되어 입력을 수정한 뒤 세 크기에서 통과했습니다. 템플릿은 기본 접기로
  정리해 모바일 첫 화면에 이어만들기도 보이게 했으며 렌더 계약을 추가했습니다.
  최신 캡처를 시각 검토했고 가로 넘침·고정 저작권 겹침이 없습니다. 최종
  `npm run check`, 빌드 포함 `npm test` 94/94, `git diff --check` 통과.
  실제 모바일 기기·가상 키보드와 Safari는 미검증이며 U1-11 통합 검증에서
  범위를 재확인합니다. 예시 재생 컨텍스트 분리는 계획대로 U1-09 범위입니다.
  임시 브라우저 재현 도구는 `/tmp/u1_capture.mjs u1-04`, 캡처는
  `/tmp/U1-04-home-{1440,1024,390}.png`이며 지속적인 회귀 자동화는 아직 아닙니다.
  추가 임시 재현 모드: `u1-04-paths`, `u1-04-invalid`, `u1-04-import`.
  U1-05 카드의 허용 파일과 현행 구성 컴포넌트를 확인해 READY로 열었습니다.
  이번 세션에는 시작하지 않았습니다. 커밋·푸시·배포하지 않았습니다.

- G6-00은 2026-09-02에 완료했습니다. ADR(`story-stage-chapter-mapping-v1.md`) 및 G6-00~G6-07 원자 카드를 등록했습니다.
- G6-01은 2026-09-02에 완료했습니다. `Chapter.storyStageKeys` 계약을 추가하고 v1 정규화/하위 호환성을 검증했습니다.
- G6-02는 2026-09-02에 완료했습니다. 순수 모듈 `app/story-stages.ts`를 신설하고 단계 포맷, 추천, 역색인 및 미연결 계산 단위를 검증했습니다.
- G6-03은 2026-09-02에 완료했습니다. 장 편집 화면에 44px 다중 단계 선택 토글 버튼과 구조 변경 시 보존 메커니즘을 구현했습니다.
- G6-04는 2026-09-02에 완료했습니다. 데스크톱/태블릿 장-단계 매트릭스 표 및 모바일 단계 요약/장별 칩 반응형 흐름표를 구현했습니다.
- G6-05는 2026-09-02에 완료했습니다. 대본 헤더, 장면 포커스 편집기, 메모 팝업 및 고쳐쓰기 자기 점검 화면에 다중 단계 라벨과 미연결 성찰 안내를 연결했습니다.
- G6-06은 2026-09-02에 완료했습니다. Excel `장의 흐름` 시트에 `이야기 단계` 열을 추가하고, 한국어·영문 쉼표/가운뎃점/줄바꿈 파싱 및 오류 안내, 공식 템플릿 재생성을 완료했습니다.
- G6-07은 2026-09-02에 완료했습니다. 다중 단계 핵심 사용자 흐름(CF-08, CF-09)을 추가 검증하고 전체 83개 회귀 테스트와 Next.js 프로덕션 빌드를 통과했습니다.
- A1-00은 2026-09-03에 완료했습니다. 캐릭터별 기준본, `800×1200`,
  `groundY=1149`, 고정 기준점과 보정/재생성 판정 기준을 ADR 및 상위 지침에
  공식화했습니다.
- OPS-02는 2026-09-03에 완료했습니다. 사용하지 않는 D1·인증 실험과 시작
  템플릿을 제거하고, 캐릭터 작업물을 후보·검토·보관으로 나눴으며, 공식 8개
  Excel 탭·9개 핵심 흐름·실제 QA 증거 범위에 맞게 기준 문서를 정리했습니다.
- A1-01은 2026-09-03에 완료했습니다. 등록 자산 70개와 후보 18개를 같은 설정으로
  읽기 전용 검사하며, JSON/Markdown 비교표와 수동 기준점 안전장치를 생성합니다.
- 2026-09-04 사용자 요청으로 U1 화면 정합화가 다음 우선순위입니다. A1-02는
  삭제·완료 처리하지 않고 유예합니다. UI는 기존 등록 자산으로 구현하며
  캐릭터 승인/교체는 별도 카드에 남깁니다.
- U1-00 문서 정비를 완료했습니다. U1-01은 2026-09-04 사용자 위임으로 구성01을
  채택했습니다. 초기 캡처는 배율·합성 문제로 시각 합격 증거에서 제외했으며,
  격리된 브라우저 프로필과 페이지 표면 캡처로 문제를 해소했습니다. 현재 화면과
  빈 상태 27개, 원작 토끼와 자라·옹고집전 6개를 1440×900·1024×768·390×844로
  다시 수집했고 PNG 픽셀, viewport, 가로 넘침, 주 컨테이너·입력·조작 치수를
  같은 세션에서 대조했습니다. 원작 소스·실제 비밀값·서비스 코드는 변경하지
  않았습니다. 결과와 재현·목표 배치 계약은 `docs/qa/studio-ui-baseline.md`에
  기록했습니다. 사용자에게 같은 구성안 승인을 다시 요청하지 않습니다.
- 의존성 정정: 화면 위치 계약은 확정된 안정 ID·작품 분리와 실제 소스 경로로
  검증 가능하여 U1-02를 먼저 구현했습니다. 이후 U1-01의 남은 지정 크기 시각 검수를
  완료해 두 선행 작업이 모두 DONE이다. 다음 한 작업으로 U1-03만 READY로 열었습니다.
- U1-02 완료: 별도 UI 위치 키, 작품 ID 검증·손상/권한 오류 fallback,
  메인 복귀·이어하기·새로고침 복원, 플레이 진입 화면 복귀를 구현했습니다.
  `StoryProject`·Excel은 변경하지 않았습니다. 새 순수 검사 2개를 실패 후 구현했고,
  위치·상태·핵심 흐름 검사 17/17과 `npm run check`, 빌드 포함 `npm test` 92/92를
  통과했습니다.
  1440px에서 컷 입력→메인→이어하기→새로고침 복원, 구성→플레이→구성 복귀,
  선택 컷 삭제→빈 장 안전 대체→메인→이어하기를 실제 Chrome으로 확인했습니다.
  390×844에서는 이어 쓸 4장·1컷 복원, 플레이→편집 복귀, 메인→이어하기,
  새로고침 복원과 삭제 확인창을 실제 터치 크기에서 확인했습니다. UI 자동화 도구의
  기본 confirm 응답 한계는 제품 코드 오류가 아니며 데스크톱의 삭제 수락·복귀,
  순수 삭제 fallback 검사로 교차 확인했습니다. 다음 실행 작업은 U1-01입니다.
- U1-03 완료: 공통 `StudioShell`에 머리말·세 단계 탐색·저장 상태·플레이 적용
  안내를 모으고 `.creator-shell` 안에만 네이비/흰 작업면/청록 행동 토큰을 적용했습니다.
  기존 전역 종이·민트 토큰은 치환하지 않았습니다. 390px에서 저장 상태를 숨기던
  기존 전역 규칙의 침범을 실제 검수 중 찾아 셸 범위 표시로 차단했습니다.
  1440×900, 1280×720, 390×844, 844×390, 320×800, 200% 확대 등가 조건에서
  가로 넘침 없음, 저장 상태 표시, 탐색 3개, 적용 행동 1개, 주요 조작 44px,
  낮은 화면의 비고정 적용 바를 확인했습니다. 빈 작품 확인 대화상자는 첫 조작으로
  초점이 들어가고 취소 뒤 연 버튼으로 돌아왔습니다. `npm run check`와 Vinext 빌드,
  전체 93개 검사가 통과했습니다. 다음 한 작업은 U1-04입니다.
- 과거 완료 기록의 Next.js 표기는 당시 문구이며 현재 실행 도구는 Vinext입니다.
  G4 내부 QA 기록은 실제 학생 수업/모바일 실기기 전체 검증 완료를 뜻하지 않습니다.

## 5. 완료 기록

| ID | 완료일 | 검증 증거 | 비고 |
|---|---|---|---|
| OPS-01 | 2026-08-24 | 문서 링크·상태 규칙 검토, `npm run check`, `npm test` | 소스 기능 변경 없음 |
| OPS-02 | 2026-09-03 | `npm run template:generate`, `npm run check`, `npm test` 83/83, `npm audit --omit=dev` 0건, 문서 링크·최종 diff 검사 | D1/Drizzle/인증 예제·기본 아이콘·중복 보관 문서 제거, 실제 파일럿 과장 정정, 무시된 캐릭터 작업물 보관 구조화 |
| G0-01 | 2026-09-01 | fixture 검사 6/6, `npm run check`, `npm test` 11/11 | 정상 v1·이전본·손상본 고정 fixture 추가 |
| G0-02 | 2026-09-01 | 호환 특성 검사 4/4, `npm run check`, `npm test` 15/15 | 이전본 메모 기본값·본문 보존·현재 미지원 검증 고정 |
| G0-03 | 2026-09-01 | 7개 흐름 ID·내부 링크·`docs/qa` 경로, diff 검사 | 수동 실행 명세와 현재 기준선 결함 기록 |
| G1-01 | 2026-09-01 | 문서 단위 검사 3/3, `npm run check`, `npm test` 18/18 | 식별자·스키마·엄격 ISO·불변 JSON 봉투 추가 |
| G1-02 | 2026-09-01 | 문서 단위 검사 6/6, `npm run check`, `npm test` 21/21 | 명시적 parse 결과, 선택 필드 정규화, 오류 위치, v1 마이그레이션 추가 |
| G1-03 | 2026-09-01 | 저장소 검사 4/4, `npm run check`, `npm test` 25/25, CF-01 저장·적용 및 CF-06 새로고침 복원 확인 | 500ms 지연 저장, v1 봉투 마이그레이션, 실패 안내, draft·active 분리 |
| G1-04 | 2026-09-01 | checkpoint 검사 3/3, `npm run check`, `npm test` 28/28, 복구 안내·최근 기록 버튼 확인 | 원인·시각·문서 체크포인트 10개, 복구 전 보존, 삭제 직후 undo 추가 |
| G2-01 | 2026-09-01 | 명령 검사 4/4, `npm run check`, `npm test` 32/32, 장면 추가·복제 및 새 복사본 선택 확인 | 순수 장면 명령, 경계 이동/삭제 대체 선택/order 보장 |
| G2-02 | 2026-09-01 | 위치 검사 3/3, `npm run check`, `npm test` 35/35, 390×844 새 장면 초점·가시성, 1440×900 20장면 왕복 확인 | 안정 ID 위치 해석, 대본 스크롤·본문 초점 복원, 모바일 입력 여유 추가 |
| G2-03 | 2026-09-01 | 오류 검사 3/3, `npm run check`, `npm test` 38/38, 적용 오류 목록→본문 초점·강조 확인 | 위치·행동·필드가 있는 차단 오류, 선택형 구상 빈칸 분리 |
| G2-04 | 2026-09-01 | 메모 명령 검사 3/3, `npm run check`, `npm test` 41/41, CF-03 데스크톱 메모 검색·편집→원래 장면 복귀 확인 | 챕터·장면 연결, 끊어진 연결 안내, 삭제된 원래 장면 안전 복귀, 모바일 전체 화면 돌아가기 문구 |
| G2-05 | 2026-09-01 | 고쳐쓰기 콘텐츠 검사 2/2, `npm run check`, `npm test` 43/43, CF-01 첫 플레이·CF-02 이어쓰기 플레이의 성찰·편집 복귀 확인 | 구조별 비채점 질문, `확인함/나중에 볼래요` 기기 저장, 플레이 전 장면 복귀 |
| G3-01 | 2026-09-01 | 상태·selector 검사 2/2, `npm run check`, `npm test` 45/45, 예시 작품 플레이 진입·편집 복귀 확인 | 플레이 화면 상태 reducer와 편집 대상 selector 분리, 기존 화면 흐름·저장 방식 유지 |
| G3-02 | 2026-09-01 | 가져오기 검사 6/6, `npm run check`, `npm test` 51/51, CF-04·CF-05의 최신/이전 Excel 왕복·손상 입력 draft 보존을 어댑터 경로에서 확인 | Excel·공개 시트 공통 snapshot, 원문/판정값 분리, 탭·행·열·원문·고치는 법이 있는 오류 계약 추가 |
| G3-03-01 | 2026-09-01 | `npm run check`, `npm test` 51/51, 1440×900·390×844 빈 작품 확인 창 열기·취소 확인, 모바일 버튼 46px/48px | 공통 `ModalDialog`로 빈 작품 확인 창 하나만 분리, 클래스·문구·버튼 구조 유지 |
| G3-03-02 | 2026-09-01 | asset picker 단위 검사 3/3, `npm run check`, `npm test` 54/54, 1440×900·390×844 이미지 선택·검색·태그·선택마크·닫기 확인 | `AssetPickerButton` 컴포넌트 및 `story-asset-picker-utils` 분리, props 및 기존 CSS·문구 유지 |
| G3-03-03 | 2026-09-02 | `npm run check`, `npm test` 54/54, CF-01 새 작품 시작·CF-02 이어쓰기 템플릿 1/2/옹고집전 진입 및 예시 플레이 확인 | `StartScreen` 컴포넌트 분리, 모든 시작 버튼·템플릿·오류 문구·키보드 순서 보존 |
| G3-03-04 | 2026-09-02 | `npm run check`, `npm test` 54/54, 1440×900·390×844 이야기 나침반·뼈대 3/4/5단계·챕터 흐름 보드 및 메모 생성·삭제 확인 | `StoryPlanScreen` 컴포넌트 및 `ResourceWidgets` 분리, 구상 입력·챕터 이동 콜백 연동 보존 |
| G3-03-05 | 2026-09-02 | `npm run check`, `npm test` 54/54, 1440×900·390×844 대사/해설 추가·종류 전환·화자 선택·이동·복제·삭제 및 고쳐쓰기 자기 점검 확인 | `ScriptScreen`, `SceneThumbnail`, `StoryRevisionCheck` 컴포넌트 분리, 기존 ref 등록 및 초점 유지 |
| G3-03-06 | 2026-09-02 | `npm run check`, `npm test` 54/54, 1440×900·390×844 장면 무대 편집·배경/화자 선택·장면 배치 복사 및 창작 메모 팝업/모달 확인 | `CreativeMemoEditor`, `SceneFocusEditor`, `MemoPopup` 컴포넌트 분리, 기존 콜백·상태 보존 |
| G3-03-07 | 2026-09-02 | `npm run check`, `npm test` 54/54, 1440×900·390×844 플레이어 진입·장면 탐색·지시문/해설·고쳐쓰기 성찰 및 편집 복귀 확인 | `StoryPlayer`, `DialogueText`, `DialogueInline` 컴포넌트 분리, 상위 `G3-03` 마일스톤 완결 |
| G3-04 | 2026-09-02 | 핵심 흐름 검사 7/7 (CF-01~07), 3회 연속 통과, `npm run check`, `npm test` 61/61 | `tests/core-user-flows.test.mjs` 추가, Draft/Active 분리·오류 보호·기기 저장 복원·메모 복귀 자동 검증 체계 완성 |
| G4-01 | 2026-09-02 | 가져오기 UI 검사 1/1, `npm run check`, `npm test` 62/62, CF-04·CF-05 연동 확인 | `ImportPreviewDialog` (ImportIssuesDialog, ImportConfirmationDialog) 분리 및 draft 보호·미리보기 확인 체계 완성 |
| G4-02 | 2026-09-02 | 성능 최적화 검사 1/1, `npm run check`, `npm test` 63/63 | `AssetPreview` 및 `AssetPickerButton`에 `decoding="async"` / `loading="lazy"` 적용, `StoryPlayer` 다음 장면 자산 선로딩 구현 |
| G4-03 | 2026-09-02 | 접근성 검사 1/1, `npm run check`, `npm test` 64/64, 키보드 및 포커스 트랩 검증 | `ModalDialog` 포커스 트랩/복귀 및 Escape 리스너, `StoryPlayer` 방향키/스페이스 키보드 내비게이션 완성 |
| G4-04 | 2026-09-02 | 당시 문서 검사 1/1, `npm run check`, `npm test` 65/65 | 내부 QA 시나리오와 Top 3 해결 기록. 실제 학생 파일럿 증거가 없어 2026-09-03에 성과 수치 주장을 정정함 |
| G5-01 | 2026-09-02 | 적용 문제·상태·핵심 흐름 검사 14/14, `npm run check`, `npm test` 67/67, 390×844·1440×900 수동 확인 | 새 작품 active 초기화·ID 불일치 방어, 장별 빈 컷 차단·안내·플레이어 장 선택 방어 |
| G5-02 | 2026-09-02 | 가져오기 검사 8/8, `npm run check`, `npm test` 69/69 | 중복 장·컷 ID와 컷 종류·화자 위치 오류를 위치와 수정 안내로 거부, Excel 빈 행의 실제 행 번호 보존 |
| G5-03 | 2026-09-02 | 렌더링 검사 10/10, `npm run check`, `npm test` 70/70, 390×844·768×1024·1440×900 수동 흐름 | 학생용 장·컷 용어 통일, 주요 조작 44px 이상, 모바일 적용 영역의 콘텐츠 가림 방지 |
| G6-00 | 2026-09-02 | ADR `story-stage-chapter-mapping-v1.md`, 원자 카드 G6-00~G6-07 등록 | 다중 단계 연결형 이야기 흐름표 설계 공식화 |
| G6-01 | 2026-09-02 | 문서 단위/호환 검사 26/26, `npm run check`, `npm test` 76/76 | `Chapter.storyStageKeys` 계약 및 v1 정규화·호환 구현 |
| G6-02 | 2026-09-02 | 순수 단계 모듈 검사 5/5, `npm run check`, `npm test` 76/76 | `app/story-stages.ts` 순수 계산·추천·안내 모듈 및 테스트 완성 |
| G6-03 | 2026-09-02 | 렌더링/선택기 검사 1/1, `npm run check`, `npm test` 77/77 | 장 편집 다중 단계 토글 버튼(44px) 및 구조 변경 시 보존 구현 |
| G6-04 | 2026-09-02 | 렌더링/매트릭스 검사 1/1, `npm run check`, `npm test` 77/77 | 데스크톱/태블릿 장-단계 매트릭스 표 및 모바일 단계 요약/장별 칩 반응형 흐름표 구현 |
| G6-05 | 2026-09-02 | 렌더링/연결 검사 1/1, `npm run check`, `npm test` 78/78 | 대본·장면 편집기·메모 팝업 다중 단계 라벨 및 고쳐쓰기 미연결 힌트 연결 구현 |
| G6-06 | 2026-09-02 | 가져오기/Excel 검사 3/3, `npm run template:generate`, `npm run check`, `npm test` 81/81 | 장의 흐름 `이야기 단계` 열 추가, 한국어/영문/기호 파싱·오류 검증, 공식 템플릿 재생성 |
| G6-07 | 2026-09-02 | 핵심 흐름(CF-08, CF-09) 검사 9/9, 전체 회귀 83/83, `npm run build` | 다중 단계 전환 보존·Excel 왕복 E2E 검증 및 전체 문서 마감 |
| A1-00 | 2026-09-03 | Markdown 구조·내부 경로·상태 수·규칙 충돌 검사, `git diff --check` | 캐릭터 기준본·색감·발선·중심·비율 허용 오차와 비용 우선 보정 원칙 공식화 |
| A1-01 | 2026-09-03 | 자산 Audit fixture 7/7, `npm run assets:audit` 88개, 입력 이미지 불변·보고서 결정성 확인, `npm run check`, `npm test` 90/90, `git diff --check` | 기준본·위치 묶음 설정, 캔버스·알파·발선·중심·중심 신체 높이 검사와 JSON/Markdown 비교표 완성 |
| U1-00 | 2026-09-04 | 위치·상태·단계·핵심 흐름 20/20, 문서 14개 내 링크 43개·작업 카드/의존성 검사, 목업 원본 복사·해시 확인, `git diff --check` | 기존 기준 문서·지침 정합화, 목업 9개 보관, U1-01~11 등록. 서비스 코드·배포 설정 변경 없음, 새 UI 실화면·전체 검사 미실행 |
| U1-01 | 2026-09-04 | 현행·빈 상태 PNG 27개와 원작 두 이야기 PNG 6개의 정확한 1440×900·1024×768·390×844 치수, 같은 세션 DOM 실측·가로 넘침 없음, 문서 링크 13개, 위치·상태·단계·핵심 흐름 22/22, `git diff --check` | 구성 01 채택, 장 0·1·5·20개/긴 제목·스크롤·초점·대화상자·반응형 계약 확정. 서비스 코드·이미지·호스팅 설정 변경 없음 |
| U1-02 | 2026-09-04 | 위치·상태·핵심 흐름 17/17, `npm run check`, Vinext 빌드, `npm test` 92/92, Chrome 1440px·390×844 왕복/새로고침/삭제 fallback | 작품별 UI 위치 키, 손상·권한 오류 안전 fallback, 메인·플레이 왕복을 작품/Excel 스키마와 분리 |
| U1-03 | 2026-09-04 | 화면 상태 3/3, 렌더 계약 13/13, `npm run check`, Vinext 빌드, `npm test` 93/93, Chrome 1440×900·1280×720·390×844·844×390·320×800·200% 확대 등가 조건 및 대화상자 초점 왕복 | 공통 셸 분리, 셸 범위 목표 토큰, 항상 보이는 저장 상태, 세 단계 탐색과 단일 적용 행동, 낮은 화면 콘텐츠 가림 방지. 작품·Excel·이미지·배포 변경 없음 |

U1-04 완료 기록 — 2026-09-04: 메인 A 두 진입·확정 문구·접이식 템플릿,
기기 저장 상태 구분과 교체 확인, Excel/공개 시트 연결, 가져오기 후 다른 작품
플레이 분리. 좁은 검사 28/28, 정적 검사·빌드·전체 94/94, Chrome 세 크기
진입/취소/오류 보존/초점 복귀 확인. 외부 Google 응답은 공식 양식 기반 대체,
네이티브 모바일 및 OS 파일 선택창은 미검증(§4 상세). 다음 U1-05 READY.

U1-05 완료 기록 — 2026-09-04: 구성 탭·중복 장 목록 정리, 선택 상세·접힌 기존
필드·다중 단계 보존. 네 화면 크기×장0/1/5/20 편집 왕복·리사이즈 입력 보존,
단계/숨긴 메모·Excel 계약, 44px 조작과 입력 가림 수정. 좁은21/21, 정적 검사·
빌드·전체95/95 통과. native 모바일 IME는 미검증. 다음 U1-06 READY.

U1-06 완료 기록 — 2026-09-04: 장 순서 명령·위/아래 조작, 경계에서 초점 보존,
후보 자료와 기본 무대 분리. 좁은27/27·정적 검사·빌드·전체97/97, Chrome 두 크기의
순서/자료/배경 상속·개별 지정·해제 비교 통과. 자산과 Excel 형식 변경 없음.
다음 U1-07 READY, 이번 세션에서 시작하지 않음.

U1-07 완료 기록 — 2026-09-05: 장 기본값과 컷 override를 해석하는 순수 모델 및
썸네일·집중 편집·플레이 공통 읽기 전용 무대를 연결했습니다. 배경/인물 로드 실패,
없는 ID, 공백 화자명을 안전하게 표시하고 입력 상태는 공통 무대 밖에 유지합니다.
Chrome 네 화면 크기에서 기본 배치12조합과 지정 인물 세 쌍의 좌우 교환을 포함한
72조합을 실측·시각 검토했습니다. 대표 6개 원본은 KEEP, 옹고집 막내 아이의 -8px
발선은 A1-02 평행이동 후보로 분리했습니다. 좁은8/8·정적 검사·Vinext 빌드·전체
100/100·`git diff --check` 통과. 자산 ID/파일/작품 참조 변경 없음. 다음 U1-08
READY, 이번 세션에서 시작하지 않음.

U1-08 완료 기록 — 2026-09-05: `이 장 대본`과 선택 컷 무대를 연결하고 컷 집중
편집에 `글/왼쪽 이미지/오른쪽 이미지/배경` 탭을 구성했습니다. 같은 인물·장 후보,
전체 자료 찾기, 저장 전 무대 미리보기와 `이 컷에 사용` 확인 단계를 두었으며 취소·
Escape는 저장 상태를 바꾸지 않고 `장의 기본으로`는 현재 컷 override만 비웁니다.
대본↔컷 왕복은 안정 ID·스크롤·textarea 선택 범위를 보존하고, 추가·복제·이동·
삭제·되돌리기 뒤에는 유효한 컷 본문으로 초점을 복구합니다. Chrome 1440×900,
1024×768, 390×844 및 낮은 390×430에서 가로 넘침·44px 조작·글쓰기 공간을
확인했고, 한글 조합 중 화면 크기 변경에도 같은 입력 DOM과 초점이 유지됐습니다.
좁은 검사26/26, 화면 계약 포함41/41, 정적 검사·Vinext 빌드·전체102/102,
`git diff --check` 통과. iOS Simulator와 Android adb가 없어 네이티브 모바일
키보드는 미검증이며 U1-11 실제 기기 항목으로 넘깁니다. 자산·Excel·작품 스키마·
의존성·호스팅 설정은 변경하지 않았고 커밋·푸시·배포도 하지 않았습니다. 다음
U1-09 READY, 이번 세션에서 시작하지 않음.

U1-09 완료 기록 — 2026-09-05: 플레이 유효 위치 계산을 통일하고 진입 위치 복귀와
현재 컷 안정 ID 수정 동작을 분리했다. 삭제·다른 작품은 안전한 구성 화면으로
안내하고 예시를 학생 draft/active/UI 위치에서 격리했다. 입력·버튼·선택기·
contenteditable 기본 키 동작과 미적용 글 분리를 유지한다. 시작20/20→좁은25/25,
정적 검사·Vinext 빌드·전체107/107·`git diff --check` 통과. Chrome1440×900·
390×844에서 예시/학생/삭제 왕복·초점·44px·가로 넘침과 런타임 비정상 상태를
확인했다(§4 상세). 네이티브 iOS/Android 키보드는 도구 부재로 U1-11 미검증.
허용 9개 파일만 수정, 기존 변경·자산·Excel·작품 형식 보존, 커밋·푸시·배포 없음.
U1-10 완료 기록 — 2026-09-07: 플레이어 모바일 78px 고정 높이를 해제하고 1000자 긴 대사·해설 완독 스크롤을
보장했다. 화자명 분리, 괄호 지시문 강조, 다중 줄바꿈, 무공백 문자열 줄바꿈, 44px 조작 타깃을 적용했다.
로컬 headless Chrome에서 7개 뷰포트(1440, 1280, 1024, 820, 390, 844x390, 320) 및 200% 확대 실측으로
가로 넘침 0건, 버튼 44px 충족, 컷 탐색, 이 컷 고치기, 편집 복귀, 토끼와 자라 및 옹고집전 재생을 확인했다.
정적 검사, Vinext 빌드 포함 108/108 테스트, GitHub Actions CI 통과. 캡처 13개와 실측 JSON을 보존했다.
다음 U1-11 하나만 READY로 열었으며 이번 세션에서 구현하지 않았다.

## 6. 상태표 편집 규칙

1. 행을 삭제하거나 완료 기록을 덮어쓰지 않는다.
2. 대기 상태에서 `READY`는 하나만 둔다. 실행 중에는 `IN_PROGRESS` 하나로
   전환하며, 승인 대기 등으로 둘 다 없으면 이유를 기록하고 구현을 중단한다.
3. `DONE`에는 실제로 실행한 검증 증거만 기록한다.
4. 다음 작업 카드가 현재 코드와 맞지 않으면 다음 작업을 `READY`로 열지 않고
   카드 정비 작업을 추가한다.
5. 작업 중 범위가 커지면 한 행을 크게 만들지 말고 새 ID로 분리한다.
6. 우선순위 유예는 `DEFERRED`로 남기고 재개 위치·조건을 기록한다. 완료 이력을 되돌리지 않는다.
