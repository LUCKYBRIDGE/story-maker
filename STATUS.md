# storygame 로컬 ↔ GitHub 상태 확인 및 동기화 가이드

> **목적**: 매 세션마다 500줄 이상의 문서를 읽거나 다수의 git/gh 명령어를 반복 실행하며 소모되는 **토큰(Token)을 최소화**하고, 1초 만에 로컬과 원격(GitHub)의 정확한 최신 상태를 확인·동기화하기 위한 가이드입니다.

---

## 1. 현재 최신 기준선 스냅샷 (2026-09-08 기준)

| 항목 | 상태 | 비고 |
|---|---|---|
| **기본 브랜치** | `main` | GitHub `origin/main`과 로컬 `main` 완전 일치 |
| **최신 HEAD 커밋** | `26c958b` | `Merge pull request #1 from LUCKYBRIDGE/u1-10-chat-player-readability-20260905` |
| **열린 PR** | 없음 | PR #1 머지 완료 |
| **검증 상태** | 통과 | `npm run check` (0건), `npm test` (134/134 전체 통과) |
| **완료된 주요 기능** | U1~U2 완료 | • 시작 화면 UI 전면 재편 (3색 밴드 제거, 세그먼트 탭, 이어하기 3대 카드)<br>• 3D 책 넘김 연출 제거 및 즉각 화면 전환<br>• 이야기 단계 혼용(처음-중간-결말 등) 비강제 권고 다이얼로그<br>• 컷 중간 추가 / 동일 화자 컷 합치기 / 대본 메타바 1줄 통합 |

---

## 2. ⚡ 1초 초고속 현황 확인 (토큰 95% 절약)

터미널이나 AI 세션에서 아래 명령 하나만 실행하면, 원격 동기화 여부·미커밋 변경·열린 PR이 10줄 이내로 즉시 요약 출력됩니다.

```bash
npm run status:check
```

### 출력 예시
```text
==============================================================
 📖 storygame 로컬 ↔ GitHub 최신 동기화 현황 (Fast Check)
==============================================================
• 로컬 브랜치   : main
• 로컬 HEAD     : 26c958b (Merge pull request #1 ...)
• 원격 main HEAD: 26c958b (Merge pull request #1 ...)
• 동기화 상태   : 동기화 완료 (In-Sync: local HEAD == origin/main)
• 작업 트리     : 깨끗함 (Clean, 0 files)
• 열린 GitHub PR: 열린 PR 없음
• 최근 검증 상태: 134/134 테스트 통과, ESLint/TS 0 오류
==============================================================
```

> **단일 Git 명령으로 확인할 때:**
> ```bash
> git fetch origin --quiet && git status -sb && git log -1 --oneline
> ```

---

## 3. 🤖 AI 세션 시작 시 토큰 다이어트 팁

AI 어시스턴트(Chat/Work)와의 새로운 대화를 시작할 때, AI가 수많은 문서를 일일이 검색하고 읽느라 토큰을 소모하지 않도록 아래와 같이 지시하면 효과적입니다.

### 권장 프롬프트 예시
```text
저장소 현황은 STATUS.md를 확인하거나 `npm run status:check`를 실행해서 파악해줘.
불필요하게 500줄짜리 상세 상태 문서를 전부 읽지 말고 바로 다음 작업을 진행하자.
```

---

## 4. 🔄 표준 작업 및 GitHub 반영 5단계 흐름

개발 작업을 진행하고 GitHub에 안전하게 반영하는 표준 절차입니다:

```mermaid
graph LR
    A[1. npm run status:check] --> B[2. 새 작업 브랜치 생성]
    B --> C[3. 개발 및 검증 (npm test)]
    C --> D[4. 커밋 및 원격 Push]
    D --> E[5. PR 생성 및 main 머지]
```

1. **시작 전 확인**:
   ```bash
   npm run status:check
   git checkout main && git pull origin main
   ```
2. **작업 브랜치 생성**:
   ```bash
   git checkout -b <기능명-날짜>
   ```
3. **코드 수정 및 로컬 검증**:
   ```bash
   npm run check   # TS, ESLint 검사
   npm test        # 134개 전체 회귀 테스트
   ```
4. **커밋 및 원격 푸시**:
   ```bash
   git add -u
   git commit -m "feat(...): 작업 내용 요약"
   git push origin <기능명-날짜>
   ```
5. **PR 생성 및 main 머지**:
   ```bash
   gh pr create --title "..." --body "..."
   # CI 통과 확인 후
   gh pr merge --merge
   ```

---

## 5. ⚠️ 자주 발생하는 불일치 상황 해결 (치트시트)

| 상황 | 원인 | 해결 명령어 |
|---|---|---|
| **로컬이 원격보다 뒤처짐 (Behind)** | GitHub에서 머지되었으나 로컬에 미반영 | `git checkout main && git pull origin main` |
| **로컬이 원격보다 앞섬 (Ahead)** | 로컬 커밋 후 원격에 push하지 않음 | `git push origin <현재브랜치>` |
| **미커밋 변경사항 존재 (Dirty)** | 작업 중이던 임시 파일 잔존 | 변경사항 커밋(`git commit`) 또는 취소(`git restore .`) |
| **CI whitespace 에러** | 파일 끝 공백이나 빈 줄 규칙 위반 | `git diff --check origin/main HEAD` 실행 후 해당 줄 정리 |
