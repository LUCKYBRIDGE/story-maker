# Chat-first 개발 운영 계약

- 기준일: 2026-09-05
- 대상 저장소: `LUCKYBRIDGE/story-maker`
- 목적: GitHub 연결 Chat을 기본 개발 주체로 두고, CI와 Work/로컬을 필요한 검증 게이트로 분리한다.
- 상위 규칙: `AGENTS.md`, `docs/storygame-ai-implementation-runbook.md`

## 1. 핵심 원칙

공유 기준선은 로컬 폴더가 아니라 GitHub이다.

1. `main`: 승인·통합된 공유 기준선
2. 작업 branch / PR: 현재 구현 중인 공유 기준선
3. Work/로컬 폴더: 실제 브라우저·기기·OS·로컬 파일을 검증하기 위한 실행 복사본
4. `/tmp`나 로컬 미커밋 파일: 공유 기준선이 아니며 필요한 것은 검토 후 저장소로 승격한다.

Chat과 Work가 서로 다른 코드를 들고 오래 작업하지 않는다. 로컬 수정이 필요하면 같은
작업 branch에 커밋·push하여 다시 GitHub를 공유 기준선으로 만든다.

## 2. 왜 Chat-first인가

이 저장소는 제품 계약, 작업 상태, 원자 작업 카드, ADR, 코드와 자동 테스트가 GitHub 안에
있다. 따라서 다음 업무는 GitHub 연결 Chat이 기본적으로 맡는다.

- 현재 `main`, branch, PR, diff, 작업 상태 확인
- READY 작업의 범위·선행 조건 확인
- 코드·테스트·문서 구현
- 작업 branch 생성, commit, push, draft PR
- CI 결과와 실패 로그 분석
- CI 실패 수정
- PR diff 검토
- 인수 증거 취합과 DONE 가능 여부 판단
- 상태표와 다음 READY 전환
- 사용자 승인 후 merge가 필요한 경우 merge 준비

Work/로컬은 Chat이 접근할 수 없는 실제 환경을 검증한다.

- 로컬 미커밋 파일과 로컬 전용 자산
- 실제 dev server의 시각 결과
- 브라우저 focus, IME, caret, 실제 다운로드/업로드
- iOS Safari, Android Chrome, soft keyboard, safe-area
- OS 파일 대화상자, Web Serial, 실제 하드웨어
- 저장소에 아직 승격되지 않은 로컬 QA 도구

## 3. 실행 등급

모든 새 작업 카드는 가능하면 다음 등급 중 하나를 명시한다.

| 등급 | 기본 실행 | 완료 증거 | 예시 |
|---|---|---|---|
| C1 | Chat | GitHub diff·문서 정합성 | ADR, 상태표, 설명 문서 |
| C2 | Chat + CI | 자동 검사 성공 | 데이터 로직, parser, selector, migration, 단위 테스트 |
| W1 | Chat + CI + Work 검증 | CI + 실제 브라우저/로컬 흐름 | 반응형, focus, IME, 다운로드 UX |
| W2 | Chat + CI + 실제 환경 | CI + 기기/OS/하드웨어 | iOS/Android 키보드, Web Serial |

등급은 모델 능력의 등급이 아니라 **필요한 증거의 종류**다. W1/W2라도 설계와 코드 수정의
기본 소유자는 Chat이며, Work는 실제 환경 증거를 추가하는 역할이 기본이다.

## 4. 증거 계층

완료 여부는 작업 카드가 요구하는 증거를 기준으로 판단한다.

### G — GitHub evidence
- 실제 파일 내용
- commit / branch / PR diff
- 상태표·ADR·작업 카드 정합성

### A — Automated CI evidence
- `npm run check`
- `npm test` (Vinext build 포함)
- PR diff whitespace 검사
- 이후 저장소에 추가되는 자동 회귀 검사

### B — Browser/local evidence
- 지정 viewport
- focus와 keyboard 흐름
- 200% 확대
- 긴 본문·가로 화면·이미지 오류
- 실제 파일 다운로드/업로드

### D — Device/OS evidence
- iOS/Android 실제 soft keyboard
- safe-area 실제 장치 동작
- Web Serial / micro:bit
- OS 권한이나 파일 선택기

C2는 일반적으로 G+A로 완료할 수 있다. W1은 G+A+B, W2는 필요한 경우 G+A+B+D가
있어야 한다. 작업 카드가 요구하지 않은 검증을 형식적으로 추가하지 않는다.

## 5. 표준 Chat 개발 흐름

```text
GitHub main/PR 재확인
→ 유일한 READY 확인
→ 실행 등급 결정
→ 작업 branch
→ 가장 좁은 코드/테스트 구현
→ commit/push
→ draft PR
→ CI
→ 실패 시 Chat 수정
→ W1/W2이면 Work handoff
→ Work 결과를 Chat이 분석
→ 필요한 최소 수정
→ 증거 충족
→ DONE/상태표 갱신
→ 사용자 승인 범위에 따라 merge
```

Chat은 로컬 명령을 실행했다고 주장하지 않는다. 자동 검증은 CI 결과를 직접 확인한다.

## 6. Work handoff 최소화

Work에는 프로젝트 전체를 다시 분석시키지 않는다. PR 단위로 다음 정보만 준다.

```text
작업 ID / 실행 등급:
PR:
branch:
CI 결과:
검증해야 할 것:
viewport / 기기:
재현 절차:
수정 권한: 보고만 / 최소 수정 허용
```

### 기본 권한은 "보고만"

Work가 실패를 발견하면 원인·재현·로그/캡처를 Chat에 돌려준다. 코드는 Chat이 수정하는
것이 기본이다.

다만 로컬에서만 재현 가능한 문제를 수정하는 편이 명백히 효율적인 경우에는 같은 작업
branch에서 최소 수정할 수 있다. 이때 즉시 commit·push하고 SHA를 보고한다.

## 7. CI 계약

PR CI는 최소 다음을 자동 실행한다.

1. `npm ci`
2. `npm run check`
3. `npm test`
4. PR 변경분 whitespace 검사

CI가 통과한 동일 명령을 Work가 관례적으로 다시 실행하지 않는다. 다음 경우에만 반복한다.

- CI와 로컬의 Node/브라우저/OS 차이가 의심됨
- 로컬 dev server에서만 재현되는 문제
- 작업 카드가 로컬 실행 자체를 인수 조건으로 명시함

## 8. 동시 작업과 충돌 방지

- 제품 구현은 상태표의 유일한 READY/IN_PROGRESS 계약을 유지한다.
- 사용자가 직접 요청한 운영·지침 정비는 별도 branch/PR에서 진행할 수 있지만 제품 코드와 섞지 않는다.
- 같은 파일을 Chat과 Work가 동시에 수정하지 않는다.
- Work가 로컬에서 원격보다 앞선 미커밋 변경을 발견하면 먼저 보존·보고하고 원격 변경으로 덮지 않는다.
- 한 PR이 다른 PR에 의존하게 되면 base/merge 순서와 재동기화 필요를 명시한다.

## 9. GitHub 작업 권한 경계

실제 개발을 요청받은 세션에서 다음은 기본적으로 수행 가능한 되돌릴 수 있는 작업이다.

- 작업 branch 생성
- commit
- push
- draft PR 생성·업데이트
- CI 조회와 실패 로그 분석

다음은 명시적 사용자 승인 또는 해당 요청에서의 명백한 위임이 필요하다.

- main merge
- 공개 배포
- 강제 push
- 사용자 데이터 삭제
- 비용을 발생시키는 외부 서비스 작업
- 비밀정보·권한 변경

## 10. 현재 bootstrap gap

Chat-first 체계가 완성되려면 다음을 순서대로 닫는다.

### B0 — 중앙 운영 계약
이 문서, AGENTS, 런북에 Chat/CI/Work 책임을 한 곳으로 모은다.

### B1 — PR CI
`.github/workflows/ci.yml`로 check/test/diff 검사를 GitHub에서 재현 가능하게 한다.

### B2 — 지속 가능한 Browser QA
현재 `/tmp/u1_capture.mjs`, `/tmp/u1-09-browser.mjs`처럼 로컬 임시 경로에 있는
재현 가치 높은 도구를 한 번 Work에서 검토한다. 개인정보·절대 경로·임시 데이터가 없도록
정리한 뒤 `scripts/qa/` 또는 `tests/browser/`로 승격한다.

새 E2E 의존성은 기존 CDP 방식이 유지 불가능하다는 증거가 있을 때만 검토한다.

### B3 — Browser QA 명령 표준화
저장소 안의 QA 도구가 준비되면 `npm run qa:player` 같은 명령으로 고정하고, 가능한 부분은
CI로 이동한다. GUI/IME/실기기만 Work에 남긴다.

### B4 — 실기기 증거
iOS/Android의 실제 키보드와 장치 고유 동작은 Work/실기기 게이트로 유지한다.

## 11. 목표 비중

기계적으로 비율을 맞추는 것이 목적은 아니지만 운영 목표는 다음과 같다.

- 일반 C1/C2 개발: Chat 90~100%
- W1 UI 작업: Chat 70~85%, Work는 최종 실제 화면 검증
- W2 작업: 설계·코드·분석은 Chat, 장치 실행만 Work

Work를 호출하는 횟수보다 **Work만이 만들 수 있는 증거가 실제로 필요한가**를 기준으로 판단한다.
