# storygame 아키텍처 개요

- 기준일: 2026-08-24
- 상태: 현재 구현 사실과 다음 구조 개선의 기준
- 제품 기준: `docs/storygame-detailed-design.md`
- 실행 순서: `docs/storygame-completion-execution-plan.md`

## 1. 시스템 성격

`storygame`은 로그인 없이 브라우저 안에서 작품을 편집하고 플레이하는 단일
경로 웹 애플리케이션이다. 핵심 작품 데이터는 현재 기기의 브라우저 저장소에
있고, Excel은 사용자가 보관·교환하는 공식 외부 스냅숏이며, 공개 Google
시트는 읽기 전용 가져오기 원본이다.

현재 호스팅 설정에는 D1과 R2가 없다. 따라서 자체 사용자 계정, 서버 작품
저장, 이미지 업로드와 여러 기기 동기화는 구현되어 있지 않다.

## 2. 기술 구성

| 영역 | 현재 구성 |
|---|---|
| UI | React 19, TypeScript, Next 16 계열 API |
| 빌드·런타임 | Vinext, Vite, Cloudflare/Sites 대상 ESM |
| 스타일 | `app/globals.css`의 전역 CSS와 CSS 변수 |
| 작품 모델 | `app/story-data.ts`와 `app/creative-memos.ts` |
| 화면·상태 | `app/StoryStudio.tsx`의 클라이언트 상태 |
| 이미지 | `app/story-assets.ts` 카탈로그와 `public/story-assets/` 파일 |
| Excel | `app/story-workbook.ts`, ExcelJS 동적 로딩 |
| Google 시트 | `app/story-sheet.ts`, 공개 gviz CSV 탭별 읽기 |
| 기기 저장 | `localStorage`의 편집본·직전 편집본·플레이 버전 |
| 검사 | ESLint, TypeScript, Vinext build, Node test |

## 3. 현재 데이터 흐름

```text
학생 입력
  → draft(현재 편집본)
  → 브라우저 자동 저장
  → 플레이에 적용 검사
  → active(플레이 버전)
  → 플레이어

Excel 파일 ─┐
            ├→ 공통 CSV 스냅숏 → 검증·정규화 → draft
공개 시트 ──┘

draft → ExcelJS → 새 .xlsx 파일
```

### 저장 키

- `storygame:draft:v1`: 현재 편집본
- `storygame:active:v1`: 마지막 플레이 적용본
- `storygame:backup:v1`: 큰 변경 직전 한 단계 백업
- `storygame:asset-favorites:v1`: 이미지 즐겨찾기
- `storygame:asset-recents:v1`: 최근 이미지

브라우저 저장은 기기 로컬이며 서버 백업이 아니다. 작품 데이터는 현재 모든
입력에서 전체 JSON으로 직렬화된다.

## 4. 주요 모듈 책임

### `app/StoryStudio.tsx`

시작, 구상, 대본, 장면 꾸미기, 창작 메모, 이미지 선택, 파일·복구, 플레이와
대부분의 상태 전이를 포함한다. 현재 5천 줄을 넘으므로 기능은 동작하지만 변경
영향 범위가 넓다.

### `app/story-data.ts`

`StoryProject`, `Chapter`, `StoryLine`, `StoryPlanning` 타입과 기본 작품,
이어쓰기 템플릿, 빈 작품·호환 복제 로직을 보유한다. 큰 이야기 콘텐츠가 코드와
함께 있어 데이터 검토와 UI 로직 변경을 분리하기 어렵다.

### `app/creative-memos.ts`

자유·인물·관계·장소·사건 메모 모델, 도움 틀, 생성과 정규화 로직을 보유한다.

### `app/story-sheet.ts`

공개 Google 시트의 탭을 CSV로 읽고, Excel과 공유하는 스냅숏을 프로젝트로
변환한다. 이전 열 이름과 이미지 표시 이름을 함께 지원한다.

### `app/story-workbook.ts`

Excel을 공통 스냅숏으로 읽고, 현재 프로젝트를 공식 7개 탭 양식으로 내보낸다.
ExcelJS는 파일 작업을 시작할 때 동적으로 불러온다.

## 5. 현재 강점

- 편집본과 플레이 버전이 분리되어 발표본이 자동으로 바뀌지 않는다.
- Excel과 Google 시트가 하나의 변환 경로를 공유한다.
- 최신 양식과 일부 이전 양식을 함께 읽는다.
- 화자 이름, 캐릭터 이미지, 배경 이미지가 독립 값이다.
- 핵심 편집과 플레이는 서버·로그인 없이 작동한다.
- 창작 메모와 작품 본문이 데이터와 화면에서 구분된다.

## 6. 현재 구조 위험

1. `StoryStudio.tsx`에 도메인 명령, 저장, 네트워크, 모달, 화면이 집중되어 있다.
2. `globals.css`가 7천 줄을 넘어 중복 반응형 규칙과 작은 글자 규칙을 찾기 어렵다.
3. 작품 문서에 `schemaVersion`이 없고, 전체 프로젝트 정규화가 체계화되어 있지 않다.
4. 한 단계 백업과 `localStorage`만으로는 수업용 작품 보존에 부족하다.
5. 테스트는 데이터·문자열 회귀에는 강하지만 실제 상호작용 검증은 약하다.
6. ExcelJS 청크를 포함해 최소화 후 500KB를 넘는 클라이언트 청크가 있다.
7. `drizzle-orm`, `drizzle-kit`, `chatgpt-auth.ts`는 현재 제품 흐름에서 사용되지
   않으므로 향후 경로가 확정되지 않으면 정리 후보이다.

## 7. 목표 구조와 이동 순서

목표는 전면 재작성이 아니라 책임을 검증 가능한 순서로 옮기는 것이다.

```text
story-studio/
  domain/         작품 명령, 정규화, 유효성 검사, 마이그레이션
  storage/        기기 저장, 체크포인트, 환경설정
  import-export/  Excel·Google 시트 어댑터와 오류 모델
  state/          reducer, selector, undo/redo
  components/     시작·구상·대본·장면·메모·플레이 화면
```

이동 순서:

1. 장면·챕터·메모 변경을 순수 함수로 추출하고 테스트한다.
2. 작품 문서 버전과 정규화·마이그레이션을 만든다.
3. 저장소 인터페이스와 복구 이력을 분리한다.
4. import/export 오류 모델을 화면과 분리한다.
5. 공통 Dialog와 큰 모달부터 컴포넌트로 분리한다.
6. 시작·구상·대본·장면·플레이 순서로 화면을 분리한다.
7. 화면별 CSS를 옮기되 시각 결과를 한 단계씩 검증한다.

각 단계는 기존 사용자 흐름을 유지하고 독립적으로 배포 가능한 상태여야 한다.

## 8. 확장 경계

클라우드 작품 저장이 제품 결정으로 확정될 때만 D1을 사용하고, 학생 업로드
파일이 확정될 때만 R2를 사용한다. 그 경우 인증, 소유권, 충돌, 보존·삭제,
미성년자 개인정보 정책을 같은 설계에서 다뤄야 한다. 현재 로컬 제작 경로를
계속 독립적으로 유지한다.
