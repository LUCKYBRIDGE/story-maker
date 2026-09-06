# GitHub-first 하이브리드 개발 운영 계약

- 기준일: 2026-09-06
- 대상 저장소: `LUCKYBRIDGE/story-maker`
- 목적: GitHub를 단일 공유 기준선으로 두고, Chat과 Work 중 해당 작업에 더 유리한 실행 주체가 개발을 주도하도록 한다.
- 상위 규칙: `AGENTS.md`, `docs/storygame-ai-implementation-runbook.md`

## 1. 핵심 원칙

개발의 중심은 특정 도구가 아니라 GitHub다.

1. `main`: 승인·통합된 공유 기준선
2. 작업 branch / PR: 진행 중인 공유 기준선
3. Chat: GitHub 기반 설계·구현·테스트·리뷰·CI 분석에 강함
4. Work/로컬: 로컬 파일·터미널·실제 브라우저·런타임·자산·실기기에 강함
5. 어느 쪽이 수정하든 장시간 로컬/대화 전용 상태로 두지 않고 같은 branch/PR에 동기화한다.
6. 주도권은 비율 목표가 아니라 **정보 접근성, 피드백 루프 속도, 필요한 증거**로 결정한다.

## 2. 작업 주도권

모든 중간 규모 이상의 작업은 시작할 때 하나를 고른다.

### Chat Lead
다음 조건이 중심이면 Chat이 주도한다.

- 필요한 정보가 GitHub 안에 충분히 있음
- 로직·데이터·문서·테스트가 핵심
- PR/CI/여러 문서 간 정합성 판단이 중요
- 반복적인 실제 브라우저 관찰이 필수가 아님

대표 작업:
- parser / validation / migration / selector / command
- Excel·시트 데이터 계약
- taxonomy / Story Pack
- ADR·작업 카드·개발 상태
- 테스트 설계와 CI 실패 분석
- GitHub diff·PR 리뷰

### Work Lead
다음 조건이 중심이면 Work가 주도한다.

- 실제 화면을 보면서 여러 번 수정→실행해야 함
- 로컬 파일·자산·생성물이 핵심
- dev server·브라우저 runtime·성능 로그가 문제의 본질
- IME, focus, caret, scroll, 파일 picker, 하드웨어처럼 실제 환경 의존성이 큼

대표 작업:
- 반응형 CSS fine tuning
- 브라우저 runtime 디버깅
- 실제 다운로드/재업로드 흐름
- 대량 자산 정리·이미지 생성 파이프라인
- 성능 프로파일링
- Web Serial / micro:bit
- 실기기 문제 재현

### Joint
경계가 섞이면 역할을 분리한다.

예:
```text
Chat: 계약·회귀 테스트·아키텍처
Work: 실제 브라우저 구현·런타임 조정
Chat: PR diff·CI·회귀 검토
Work: 최종 실제 환경 확인
```

또는:
```text
Chat: 1차 구현
Work: 실제 환경에서 원인 확인 + 최소 수정
Chat: 최종 diff·CI·상태 판정
```

## 3. 증거 체계

주도권과 완료 증거를 분리한다.

### G — GitHub evidence
- 실제 파일 내용
- commit / branch / PR diff
- 상태표·ADR·작업 카드 정합성

### A — Automated evidence
- GitHub Actions
- `npm run check`
- `npm test` (Vinext build 포함)
- diff whitespace
- 저장소 내부 자동 회귀 검사

### B — Browser/local evidence
- 실제 Chrome/Safari dev server
- 지정 viewport
- focus / keyboard / IME / caret / scroll
- 200% 확대
- 긴 본문·이미지 오류
- 실제 파일 다운로드/업로드
- 로컬 성능·메모리

### D — Device/OS evidence
- iOS/Android 실제 soft keyboard
- safe-area 실제 장치 동작
- OS 파일 선택기·권한
- Web Serial / micro:bit

작업 카드는 필요한 증거만 요구한다. 주도권이 Work라고 해서 A를 생략하지 않고,
주도권이 Chat이라고 해서 B/D가 필요한 작업을 자동 검증만으로 DONE 처리하지 않는다.

## 4. 주도권 선택 규칙

작업 시작 시 다음 순서로 결정한다.

1. 필요한 정보가 어디에 있는가?
2. 수정→검증 피드백 루프를 누가 더 짧게 만들 수 있는가?
3. 최종 인수에 필요한 증거가 G/A/B/D 중 무엇인가?
4. 다른 주체로 넘길 때 handoff 비용이 구현 비용보다 큰가?
5. 동일 branch/PR에서 안전하게 동기화할 수 있는가?

비율 목표는 참고만 한다. “Chat 사용량을 늘리기 위해 Work가 더 잘하는 작업을 Chat으로
보낸다”거나 그 반대의 결정을 하지 않는다.

## 5. 표준 개발 흐름

```text
GitHub main / 열린 PR / 상태표 확인
→ 유일한 READY 확인
→ Lead: Chat / Work / Joint 결정
→ 필요한 증거 G/A/B/D 결정
→ 작업 branch/PR 고정
→ 주도 실행
→ 가능한 자동 검증은 CI
→ 필요한 경우 다른 주체 handoff
→ 같은 branch/PR로 즉시 동기화
→ 최종 diff + 필수 증거 확인
→ DONE/상태표 갱신
→ 사용자 승인 범위에 따라 merge
```

## 6. Chat 최적 사용

Chat은 다음을 기본적으로 맡는다.

- GitHub current state 재조회
- 아키텍처·데이터 계약·범위 판단
- GitHub 코드/문서 수정
- 테스트·fixture 작성
- branch/commit/push/draft PR
- Actions job/step/log 분석
- PR diff와 회귀 검토
- 여러 Work 결과의 통합 판단
- 상태표·다음 READY 정리

Chat이 로컬 명령이나 실기기 검증을 수행했다고 주장하지 않는다.

## 7. Work 최적 사용

Work는 검증 전용이 아니다. 다음에서 더 빠르고 안전하면 직접 구현을 주도한다.

- 실제 브라우저를 보며 UI 반복 조정
- runtime event/focus/IME/scroll 문제
- 로컬 대량 자산·파일 처리
- dev server 로그와 성능 분석
- 실제 Excel 다운로드·재업로드
- OS·브라우저·하드웨어 고유 동작

Work가 수정한 코드는 장시간 로컬 전용 상태로 남기지 않는다. 같은 branch에 commit·push해
GitHub PR을 다시 공유 기준선으로 만든다.

## 8. Handoff 계약

handoff는 저장소 전체 재설명이 아니라 PR 단위로 한다.

```text
작업 ID:
Lead: Chat / Work / Joint
PR / branch:
현재 HEAD:
이미 확보한 증거:
다음 주체가 해야 할 일:
재현 절차:
수정 가능 범위:
끝나면 push가 필요한가:
```

반환 보고:

```text
환경:
실행/수정 내용:
PASS:
FAIL:
재현:
증거 위치:
변경 파일:
commit SHA:
push 상태:
남은 미검증:
```

## 9. CI 계약

PR CI는 공통 자동 검증층이다.

1. `npm ci`
2. committed diff whitespace
3. `npm run check`
4. `npm test`

CI가 통과한 동일 명령을 관례적으로 Work에서 반복하지 않는다. 다음일 때만 반복한다.

- CI/로컬 OS 차이를 조사
- 로컬 dev server 자체가 인수 조건
- 작업 카드가 로컬 실행을 명시
- CI는 통과하지만 runtime이 다르게 동작

## 10. 동시 작업 방지

- 제품 구현은 유일한 READY/IN_PROGRESS 계약을 유지한다.
- 운영 최적화는 별도 branch/PR에서 제품 코드와 분리한다.
- 같은 파일을 Chat과 Work가 동시에 수정하지 않는다.
- 로컬 미커밋 변경은 먼저 보존·보고한다.
- Work가 수정한 뒤 즉시 push하고, Chat은 push 후의 PR을 기준으로 재검토한다.
- 두 PR이 의존하면 merge 순서와 rebase/동기화 필요를 명시한다.

## 11. GitHub 권한 경계

실제 구현 요청 시 기본적으로 가능한 되돌릴 수 있는 작업:

- 작업 branch
- commit / push
- draft PR 생성·업데이트
- CI 조회·실패 로그 분석

명시적 사용자 승인 또는 명백한 위임 필요:

- main merge
- 공개 배포
- force push
- 사용자 데이터 삭제
- 외부 비용 발생
- 비밀정보·권한 변경
- repository ruleset/branch protection 변경

## 12. 현재 최적화 backlog

### O1 — 운영 계약 정착
이 문서, AGENTS, 런북, 공용 skills를 GitHub-first hybrid로 통일한다.

### O2 — PR CI
현재 CI를 공통 자동 검증층으로 유지한다.

### O3 — Browser QA 영속화
`/tmp/u1_capture.mjs`, `/tmp/u1-09-browser.mjs` 등 재현 가치 있는 도구를 Work가
실제 로컬에서 감사하여 `scripts/qa/` 또는 `tests/browser/`로 승격한다.

- 절대 경로 제거
- 개인·임시 데이터 제거
- 현재 selector 검증
- assertion과 exit code 보장
- 일회성 캡처/로그는 승격하지 않음
- 기존 CDP 방식으로 충분하면 새 E2E dependency를 추가하지 않음

### O4 — QA 명령 표준화
영속화된 QA를 `npm run qa:player` 등으로 고정하고 자동화 가능한 것은 CI로 이동한다.

### O5 — 실기기 게이트
iOS/Android 실제 keyboard, OS picker, Web Serial은 Work/실기기에 남긴다.

### O6 — main 보호
현재 main은 protected/ruleset 없음. CI check 이름이 안정된 뒤 사용자 승인으로
`verify` 필수, force push 방지를 권장한다.

## 13. 운영 목표

목표는 Chat 또는 Work의 사용률이 아니다.

- GitHub 밖에 장시간 남는 변경 최소화
- 중복 테스트 최소화
- 불필요한 전체 저장소 재분석 최소화
- 가장 빠른 주체에게 구현 주도권 부여
- 완료 판정은 필수 증거로 통일

이 원칙 아래 일반 데이터/로직은 Chat 비중이 높아질 수 있고, 브라우저·로컬·하드웨어 작업은
Work 비중이 높아질 수 있다. 둘 다 정상적인 최적 상태다.
