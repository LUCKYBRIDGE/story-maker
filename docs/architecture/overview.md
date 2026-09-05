# storygame 아키텍처 개요

- 기준일: 2026-09-04
- 상태: 현재 구현 사실과 다음 구조 개선의 기준
- 제품 기준: `docs/storygame-detailed-design.md`
- 작업 상태: `docs/storygame-development-status.md`
- 자산 목표: `docs/architecture/storymaker-system-asset-architecture-master-plan.md`

## 1. 시스템 경계

`storygame`은 로그인 없이 브라우저에서 작품을 편집하고 플레이하는 로컬 우선
웹 앱이다. 브라우저 저장소가 작업본의 위치이고, Excel은 보관·교환용 공식
스냅숏이며, 공개 Google 시트는 읽기 전용 가져오기 원본이다.

현재 호스팅 설정에는 D1·R2가 없다. 자체 계정, 서버 작품 저장, 여러 기기 동기화,
이미지 업로드는 구현 범위가 아니다. 이 경계와 맞지 않아 사용되지 않던 D1·Drizzle
예제와 인증 실험 코드는 2026-09-03 저장소 정리에서 제거했다.

## 2. 기술 구성

| 영역 | 현재 구성 |
|---|---|
| UI | React 19, TypeScript, Next 16 계열 API |
| 빌드·런타임 | Vinext, Vite, Cloudflare Sites 대상 ESM |
| 스타일 | `app/globals.css`와 CSS 변수 |
| 작품 모델 | `app/story-data.ts`, `app/creative-memos.ts` |
| 문서 호환 | `app/story-project-document.ts`, `app/story-project-validation.ts` |
| 저장·복구 | `app/story-project-repository.ts`, `app/story-project-checkpoints.ts` |
| 편집 명령 | `app/story-commands.ts`, `app/creative-memo-commands.ts` |
| 위치·화면 상태 | `app/story-editor-location.ts`, `app/story-studio-player-state.ts`, selectors |
| 주요 화면 | `app/components/`와 상위 조정자 `app/StoryStudio.tsx` |
| 이미지 | `app/story-assets.ts`, `public/story-assets/`, taxonomy v1 adapter |
| Excel·시트 | `app/story-workbook.ts`, `app/story-sheet.ts`, `app/story-import.ts` |
| 검사 | ESLint, TypeScript, Vinext build, Node test |

## 3. 데이터 흐름

```text
학생 입력
  → draft(현재 편집본)
  → 버전 문서 봉투(schemaVersion 1)로 자동 저장
  → 적용 문제 검사
  → active(마지막 플레이 버전)
  → 플레이어

Excel 파일 ─┐
            ├→ 공통 스냅숏 → 위치가 있는 오류 → 정규화·검증 → draft
공개 시트 ──┘

draft → ExcelJS → 공식 8개 탭 .xlsx
```

주요 저장 키는 `storygame:draft:v1`, `storygame:active:v1`,
`storygame:checkpoints:v1`, `storygame:backup:v1`이다. 즐겨찾기·최근 이미지와
고쳐쓰기 응답도 별도 키로 보관한다. 저장 실패 시 Excel 보관 안내를 제공한다.

## 4. 구현된 안전장치

- `StoryDocumentEnvelope`와 `schemaVersion: 1`, 이전 v1 저장본 마이그레이션
- 정규화·검증 실패 시 현재 편집본을 덮어쓰지 않는 명시적 결과 타입
- 500ms 지연 저장과 편집본·플레이본 분리
- 최대 10개 체크포인트, 복구 전 현재 상태 보존, 삭제 직후 되돌리기
- 장·컷 변경 순수 명령과 안정 ID 기반 선택·스크롤·초점 복원
- Excel·Google 시트 공통 오류 모델과 탭·행·열·고치는 법 안내
- 장 하나에 여러 이야기 단계를 연결하는 데이터·화면·Excel 왕복
- 장이 없거나 컷이 0개인 상태의 적용·플레이 방어

## 5. 코드 책임과 남은 위험

`StoryStudio.tsx`는 2,968줄로 초기 상태보다 분리됐지만 저장·가져오기·모달 조정과
화면 전환 책임이 여전히 크다. `globals.css`는 약 8,300줄이고 반응형 규칙이 한
파일에 집중되어 있다. 정적 작품·자산 데이터도 각각 약 2천·2.5천 줄이다.

우선 확인할 구조 위험은 다음과 같다.

1. 상위 조정자의 저장·가져오기·Dialog 흐름을 작은 훅/컨트롤러로 더 분리할 필요
2. 전역 CSS를 화면 경계별로 옮길 때 발생할 수 있는 순서 의존성과 중복 규칙
3. 최소화 후 500KB가 넘는 클라이언트 청크와 긴 작품에서의 렌더 비용
4. taxonomy v2 manifest·legacy resolve는 목표이며 아직 미완료. 캐릭터 자동 Audit은
   A1-01 완료 기록이 있고 후보 승인·등록은 A1-02로 남아 있음
5. 실제 iOS/Android 소프트 키보드, 브라우저 저장 할당량, 긴 수업 작품의 수동 검증 부족

## 6. 공식 외부 형식

현재 Excel은 `시작하기`, `이야기 구성`, `장의 흐름`, `장의 자료`, `화자`,
`컷 대본`, `창작 메모`, `리소스`의 8개 탭을 쓴다. 이전 `작품`, `챕터`,
`챕터 흐름`, `장면`, `대사` 이름은 가져오기에서만 호환한다. 새 문서와 학생용
화면의 표준 용어는 `장`, `컷`이다.

## 7. U1 점진 개선 순서와 경계

[화면 흐름 ADR](../decisions/studio-screen-flow-v1.md)을 새 UI의 계약으로 삼는다.
현재 구현과 다른 목표는 완료로 간주하지 않고 U1 카드별로 이전한다.

1. 실제 네 화면·원작·목업의 차이와 미승인 배치를 확인한다.
2. StoryStudio의 화면/진입/위치 경계만 정리한다. 전역 상태 라이브러리나 라우터를 도입하지 않는다.
3. 셸 범위 토큰→메인→구성→장 조작을 기존 컴포넌트 위에 적용한다.
4. AssetPreview·반전·상속 해석을 재사용해 읽기 전용 공통 무대를 추출한다.
5. 대본/컷 보기와 플레이의 위치 복귀·예시 격리·반응형을 각각 검증한다.
6. 실제 입력 비용·번들을 측정해 회귀를 확인한다. 막연한 성능 최적화나 대규모
   hooks 분리는 해당 카드에 필요한 범위만 한다.

화면 모델은 메인/구성/편집/플레이 네 개이며, 대본/컷 집중은 편집 안의 보기다.
현재 저장은 localStorage 기반이다. IndexedDB·서버 저장은 이번에 추가하지 않는다.
재접속용 UI 위치가 필요하면 작품 ID에 묶인 별도 선택적 버전 키로 저장한다.
schemaVersion 1과 Excel에 viewport·패널·caret 정보를 넣지 않는다.
UI 위치 읽기 실패가 작품 읽기·저장을 차단하거나 실패 원본을 덮어쓰지 않아야 한다.

공통 무대는 데이터 resolve와 읽기 전용 표현만 책임진다. 입력·선택·플레이 인덱스는
각 화면 조정자에 남긴다. 역할을 나누려고 모든 기존 코드를 새 파일로 옮기지 않는다.

원작 참조 경로·commit·관찰 범위는 [목업 기준표](../design/mockups/README.md)에 기록한다.
원작 배포 번들을 개발 소스로 복사하거나 그 저장소를 수정하지 않는다.
taxonomy v2 이전·A1-02 자산 교체는 U1 선행 조건이 아니다.

클라우드 저장이나 학생 업로드가 제품 결정으로 확정될 때만 서버·인증을 설계한다.
소유권, 충돌, 보존·삭제, 미성년자 개인정보를 한 계약으로 다루고 로컬 경로를 유지한다.
