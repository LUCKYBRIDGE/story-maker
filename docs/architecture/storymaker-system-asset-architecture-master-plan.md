# Story Maker 시스템·자산 아키텍처 마스터 플랜

- 상태: **채택된 목표 아키텍처 / 단계적 구현 기준**
- 기준일: **2026-09-01**
- 대상 저장소: `LUCKYBRIDGE/story-maker`
- 제품 기준: `docs/storygame-detailed-design.md`
- 실행 순서: `docs/storygame-development-status.md`
- 자산 결정: `docs/decisions/story-asset-taxonomy-v2.md`
- 캐릭터 정렬 결정: `docs/decisions/character-pose-normalization-v1.md`
- 현재 구현 개요: `docs/architecture/overview.md`

이 문서는 Story Maker의 작품 문서, 로컬 저장, 자산 카탈로그, 검색, 자산 제작과
Story Pack의 장기 구조를 하나의 목표 아키텍처로 연결한다. 현재 구현 사실이나
실행 가능한 작업을 임의로 바꾸지 않는다. 충돌이 있으면 `AGENTS.md`의 문서
우선순위와 현재 `READY` 작업을 따른다.

---

## 1. 한눈에 보는 결정

### 2026-09-04 현재 UI 작업과의 관계

다음 구현 우선순위는 U1 네 화면 정합화다. [화면 흐름 ADR](../decisions/studio-screen-flow-v1.md)과
상태표를 따른다. 이 문서의 taxonomy v2·Story Pack·저장소 확장은 장기 목표이며
U1의 선행 조건이 아니다. 기존 자산 ID·경로·캐릭터 기준본과 schemaVersion 1,
Excel 계약을 그대로 쓴다. 공통 무대는 현재 자산 해석/표시를 공유하는 범위로 제한한다.
A1-02 승인 감정 세트 등록은 유예됐으며 자산 완료 기준을 낮추거나 후보를 폐기하지 않는다.


Story Maker는 다음 제품 경계를 유지한다.

> 학생이 그림을 고르고 대사와 해설을 쓴 뒤 직접 플레이해 보고, 어색한 부분을
> 다시 고쳐 쓰는 Local-first 선형 Visual Story Remix Studio

핵심 결정은 다음과 같다.

1. 핵심 제작은 로그인, 서버와 외부 API 없이 완전 동작한다.
2. 작품은 버전이 있는 `StoryDocumentEnvelope`로 저장하고, 파싱 실패 원본을
   자동으로 덮어쓰지 않는다.
3. 편집본, 플레이 버전, 체크포인트와 외부 Excel 스냅숏의 역할을 분리한다.
4. 자산 ID는 파일 경로와 분리하여 영구 참조로 사용한다.
5. 캐릭터는 개별 이미지가 아니라 같은 배우의 디자인·변형·포즈 집합으로 관리한다.
6. 내부 자산 관계와 학생의 검색 방식을 분리한다.
7. 검색은 같은 패싯 안에서는 OR, 서로 다른 패싯 사이는 AND로 평가한다.
8. Filter와 Ranking을 분리한다.
9. Full/Upper Pair는 핵심 추천 Pose부터 단계적으로 확보한다.
10. 기존 저장본, Excel과 asset ID는 adapter와 alias로 계속 연다.

---

## 2. 범위와 비범위

### 이 문서가 고정하는 것

- 작품 문서와 저장 경계
- 자산 정체성, 카탈로그와 검색 원칙
- 캐릭터 동일성, Pose와 표시 구도 관계
- Story Pack과 전역 자산 라이브러리의 관계
- 기존 v1에서 목표 구조로 이동하는 순서
- 구현 전에 갖춰야 할 검사와 인수 조건

### 이 문서가 직접 고정하지 않는 것

- 현재 세션의 작업 순서
- 학생 화면의 최종 문구와 상세 배치
- 특정 캐릭터의 그림 제작 수량
- 클라우드, 업로드, 공개 공유의 제품 도입 여부
- 분기형 이야기, 자유 배치, 복잡한 애니메이션

학생 화면과 1.0 제품 범위는 상세 설계가 기준이고, 구현 순서는 개발 상태표와
원자 작업 카드가 기준이다.

---

## 3. 2026-09-01 현재 기준선

현재 구현은 다음 상태다.

| 영역 | 현재 사실 | 목표와의 관계 |
|---|---|---|
| 작품 모델 | 버전 없는 `StoryProject` | Envelope·migration 필요 |
| 기기 저장 | `localStorage`의 draft/active/backup | 저장소 adapter와 안전한 load 필요 |
| 외부 보관 | Excel 왕복, 공개 Google 시트 읽기 | 공통 StoryDocument adapter로 유지 |
| 자산 | 108개: 캐릭터 70, 배경 38 | 정식 manifest와 타입 분리 필요 |
| 캐릭터 구도 | 전신 46, 상반신 19, 여러 인물 5 | Pair audit 전에는 완성도를 주장하지 않음 |
| 추천 범위 | 기본 추천 49, 추가 자료 59 | visibility의 v1 호환 값으로 사용 |
| 분류 | `group/pose/framing/tags`와 런타임 taxonomy adapter | v2 정규 필드로 점진 이전 |
| 검색 | 검색어 AND 선택된 모든 태그 | 패싯별 OR/교차 AND로 이전 필요 |
| 방향 | 일부 asset ID의 하드코딩 Map | manifest metadata로 이전 필요 |
| 테스트 | 렌더·Excel·일부 데이터 회귀 | 저장 손상·검색·Pair·resolve 검사 보강 필요 |

현재 카탈로그 규모에서는 메모리 배열 검색으로 충분하다. 별도 검색 서버,
데이터베이스 또는 inverted index는 필요하지 않다.

---

## 4. 시스템 경계

```text
Story Maker UI
  ├─ 구상
  ├─ 편집
  ├─ 이미지 선택
  └─ 플레이
        │
        ▼
Domain
  ├─ StoryDocument
  ├─ Scene/Chapter commands
  └─ Draft → Play Snapshot
        │
        ├──────────────┐
        ▼              ▼
Content/Story Pack   Asset Library
        │              │
        └──────┬───────┘
               ▼
Persistence / Import-Export
  ├─ Local repository
  ├─ Checkpoint/Recovery
  ├─ Excel adapter
  └─ Public Sheet adapter
```

각 경계의 책임은 다음과 같다.

- **Domain**: 작품 내용과 편집 규칙
- **Content**: 이야기 템플릿과 Story Pack
- **Asset Library**: 전역 자산 정체성, metadata, 검색과 resolve
- **Persistence**: 기기 저장, 체크포인트와 복구
- **Import/Export**: Excel과 공개 Google 시트 변환
- **Player**: 편집 상태와 분리된 플레이 스냅숏 표시

클라우드 기능이 도입되더라도 Local repository를 제거하거나 핵심 제작 경로를
로그인 뒤로 옮기지 않는다.

---

## 5. 작품 문서와 저장 안전성

### 5.1 StoryDocument Envelope

순수 작품 모델과 저장 포맷을 분리한다.

```ts
interface StoryDocumentEnvelope {
  documentType: "story-maker-project";
  schemaVersion: number;
  savedAt: string;       // ISO 8601
  appVersion: string;
  assetCatalogVersion?: string;
  project: StoryProject;
}
```

`savedAt`은 표시 문자열이 아니라 ISO 시각으로 저장한다. 학생 화면용 저장 시각은
표시 단계에서 변환한다.

### 5.2 안전한 Load Pipeline

```text
Raw data
  → Parse
  → Detect schema version
  → Sequential migrate
  → Normalize optional fields
  → Validate IDs and references
  → Open editor
```

실패하면 raw data를 quarantine/recovery 영역에 보존한다. 다음 흐름은 금지한다.

```text
JSON.parse 실패
  → 예시 작품으로 시작
  → 같은 키에 예시 작품 자동 저장
```

### 5.3 Migration 원칙

1. v1부터 현재 버전까지 순서대로 이동한다.
2. 각 단계 뒤 normalize와 validate를 실행한다.
3. 실패한 원본과 마지막 정상본을 보존한다.
4. asset ID alias와 legacy resolve를 지원한다.
5. 이전 Excel은 입력 adapter에서 현재 StoryDocument로 변환한다.
6. migration이 UI 컴포넌트에 직접 들어가지 않게 한다.

### 5.4 저장 역할

- **Draft**: 현재 편집 중인 최신 상태
- **Play Snapshot**: 마지막으로 `플레이에 적용`한 안정 상태
- **Checkpoint**: 복구를 위한 의미 있는 시점
- **Backup/Excel**: 사용자가 파일로 보관하는 외부 스냅숏
- **Undo/Redo**: 최근 편집 행동; Checkpoint와 별개

### 5.5 저장소 이동 원칙

먼저 `StoryRepository` 경계를 만들고 현재 `localStorage`를 adapter로 감싼다.
IndexedDB 전환은 긴 작품 크기, 저장 할당량, 다중 체크포인트 요구를 측정한 뒤
별도 작업으로 결정한다. 저장 기술 교체와 문서 schema migration을 한 번에
묶지 않는다.

저장소는 최소한 다음 실패 상태를 구분해야 한다.

- 정상 저장
- 저장 공간 부족
- 파싱 실패
- migration 실패
- validation 실패
- 마지막 정상본 복원 가능
- 격리된 원본 내려받기 가능

---

## 6. 자산 정체성과 타입

### 6.1 영구 ID와 파일 경로 분리

```text
Asset identity ≠ file path
```

작품과 Excel은 영구 asset ID를 참조한다. 파일명, WebP 변환, CDN 경로가 바뀌어도
asset ID는 유지한다.

### 6.2 활성 목표 타입

```ts
type AssetType =
  | "character"
  | "background"
  | "scene-illustration";
```

- `character`: 배경 위에 독립적으로 배치하는 인물
- `background`: 인물을 올려놓는 무대
- `scene-illustration`: 인물과 사건이 이미 결합된 완성 삽화

`prop`은 별도 배치 기능이 확정될 때 추가한다. 현재 schema에 미리 넣지 않는다.

기존 `background + category=special` 자산은 audit으로 실제 background와
scene-illustration을 구분한다. 기존 ID는 바꾸지 않는다.

### 6.3 캐릭터 내부 관계

```text
Character
  → Design Version
  → Variant
  → Pose Set
  → Framing Asset
```

- `characterId`: 배우의 영구 정체성
- `designVersion`: 얼굴·체형·의상·렌더링 스타일의 기준 세대
- `variantId`: 어린 시절, 병든 상태, 의상 변화처럼 지속되는 외형 상태
- `poseSetId`: 같은 표정·행동을 공유하는 표시 구도 묶음
- `assetId`: 실제 렌더링 파일을 가리키는 영구 자산 ID

감정은 Variant가 아니다. `어린 자라`는 Variant지만 `놀란 자라`는 Pose/Expression이다.

### 6.4 권장 책임 분리

```ts
interface CharacterDefinition {
  characterId: string;
  canonicalName: string;
  canonicalDesignVersion: string;
  canonicalColorwayId: "default";
  storyPackIds: string[];
  defaultStageProfile: CharacterStageProfile;
  normalizationProfiles: CharacterNormalizationProfile[];
}

interface CharacterNormalizationProfile {
  designVersion: string;
  variantId: string;
  framing: SourceFraming;
  referenceAssetId: string;
  canvas: { width: 800; height: 1200 };
  groundY: 1149;
  visualCenterX: 400;
  eyeLineY?: number;
  coreBodyHeight?: number;
  headBodyRatio?: number;
}

interface CharacterPoseSet {
  poseSetId: string;
  characterId: string;
  designVersion: string;
  variantId: string;
  expression?: ExpressionId;
  actions: ActionId[];
  assets: {
    full?: string;
    upper?: string;
    threeQuarter?: string;
  };
  pairingStatus: PairingStatus;
}

interface CharacterAssetRecord {
  assetId: string;
  poseSetId: string;
  sourceFraming: SourceFraming;
  renderOverride?: AssetRenderOverride;
  qualityStatus: QualityStatus;
  pickerVisibility: PickerVisibility;
  src: string;
  sourcePath?: string;
  copyright: string;
}
```

Stage 기본값은 `CharacterDefinition`이 소유한다. 이미지의 투명 여백, crop과
baseline 차이처럼 파일별 보정만 `AssetRenderOverride`에 둔다. 같은 전체
StageProfile을 캐릭터와 개별 asset 양쪽에 중복 저장하지 않는다.

`CharacterNormalizationProfile`은 감정별 외곽 상자의 크기가 아니라 같은 배우의
기준본과 고정 기준점을 저장한다. 개별 `AssetRenderOverride`는 평행이동과 균일
확대·축소만 허용한다. 자세에 따라 달라지는 귀·더듬이·뿔·손·소품 끝은 자동
크기 계산에서 제외한다.

---

## 7. Full/Upper Pair 정책

일반적인 핵심 Pose는 가능한 한 전신과 상반신을 같은 `poseSetId`로 연결한다.

```ts
type PairingStatus =
  | "complete"
  | "missing-full"
  | "missing-upper"
  | "exception"
  | "legacy";
```

### 1.0 적용 범위

Pair는 다음 순서로 확보한다.

1. 기본 추천 핵심 캐릭터의 기본 Pose
2. 자주 쓰는 감정·대화 Pose
3. Story Pack의 교육 과업에 필요한 Pose
4. audit 결과 활용 가치가 높은 추가 자료

모든 legacy·특수 Pose의 1:1 Pair 완성을 1.0 출시 조건으로 두지 않는다.

### 예외

- 여러 인물 합성 이미지
- scene-illustration
- 사건 전용 CG
- legacy 호환 자산
- 활용 가치보다 제작 비용이 큰 특수 Pose

가능하면 Full-body Master에서 Upper crop을 만든다. 별도 연출이 필요하면 같은
PoseSet 안에서 독립 제작하되 Character Bible을 통과해야 한다.

---

## 8. Stage와 방향

표시 보정은 다음 순서로 적용한다.

```text
Asset render correction
  → Character/design default
  → 작품의 위치 묶음 기본값
  → Chapter override
```

1.0에서는 장면별 픽셀 좌표와 Scene override를 넣지 않는다. 후속 도입 시에는
`이 장면만 다름`과 `묶음 기본값으로 되돌리기`를 함께 제공한다.

파일 자체의 기본 정렬은 다음 규격을 사용한다.

```text
800×1200 투명 캔버스
groundY = 1149
하단 투명 여백 = 50px
visualCenterX = 400 (몸통 기준 ±12px)
일반 선 자세의 머리/모자 몸체 상단 여백 = 120~180px
```

정렬은 `발선 → 몸통 중심 → 눈높이 → 중심 신체 높이 → 머리/몸 비율` 순서로
검사한다. 발선이나 중심만 다르면 평행이동하고, 중심 신체와 머리/몸 비율이 함께
유지될 때만 균일 확대·축소한다. 머리만 크거나 팔다리·의상 구조가 달라진 이미지는
런타임 보정으로 숨기지 않고 `REFERENCE-REMAKE`로 돌린다.

위치 묶음 키는 기본적으로 다음을 사용한다.

```text
Story Pack/작품 + Character + Display Framing
```

방향 metadata는 다음을 포함한다.

```ts
facing: "left" | "right" | "front" | "neutral";
mirrorSafe: boolean;
```

글씨, 비대칭 소품 또는 방향 의미가 있는 이미지는 자동 좌우반전하지 않는다.

---

## 9. 검색과 분류

### 9.1 내부 관계와 학생 탐색 분리

- 내부 관계: Character/Design/Variant/PoseSet으로 무결성을 관리한다.
- 학생 탐색: 독립 패싯을 조합하여 원하는 자산을 찾는다.

### 9.2 1차 정규 패싯

현재 자산과 학생 과업이 증명된 축부터 사용한다.

1. 작품/Story Pack
2. 인물
3. 구도
4. 감정·상태
5. 행동
6. 추천 범위

`entityType`, `species`, `gender`, `ageGroup`, `role`, `style`은 실제 metadata와
학생 탐색 필요가 확인된 뒤 추가한다. 성별과 연령은 이미지에서 자동 추정하지
않는다.

### 9.3 Query 의미

```text
같은 Facet 안의 여러 값 = OR
서로 다른 Facet = AND
검색어 = 전체 Facet 결과에 추가 AND
```

예:

```text
(동물 OR 판타지)
AND (놀람 OR 걱정)
AND 전신
AND SEARCH("토끼")
```

학생 화면에는 AND/OR 용어를 노출하지 않는다. `종류`, `감정`, `구도`처럼
그룹을 보여 주고 선택 결과를 즉시 갱신한다.

현재 v1의 자유 태그 `tags.every(...)` 검색은 목표 의미가 아니다. v2 Picker가
연결될 때까지 호환 adapter로 유지하고, 변경 전후 결과 fixture를 만든다.

### 9.4 Filter와 Ranking

Filter는 결과 포함 여부만 결정한다. Ranking은 포함된 결과의 순서만 바꾼다.

기본 Ranking 후보:

1. 현재 Story Pack
2. 기본 추천
3. 현재 장면/작품에서 사용한 캐릭터
4. 즐겨찾기
5. 최근 사용
6. 기타 승인 자산

Ranking은 Filter가 제외한 asset을 다시 결과에 넣지 않는다.

### 9.5 고급 Boolean

중첩 AND/OR/NOT AST는 현재 1.0 범위가 아니다. 기본 패싯으로 표현할 수 없는
실제 교사 과업이 확인될 때 별도 ADR과 테스트를 거쳐 추가한다.

---

## 10. Controlled Vocabulary

정규 필드 값과 검색 alias를 분리한다.

### 감정·상태 v2 초기값

```text
기본, 기쁨, 슬픔, 화남, 놀람, 걱정, 미안함, 결심, 피곤,
의심, 생각, 아픔, 후회, 안도, 온화, 망설임, 조심, 회상
```

### 행동 v2 초기값

```text
말하기, 도망, 소품 들기, 제안, 명령, 부탁, 건네기, 일하기
```

`걷기`, `달리기`처럼 현재 catalog와 분류 규칙에 없는 값은 실제 자산이 생길 때
추가한다.

### Alias 예

```text
깜짝·당황 → 놀람
불안 → 걱정
부끄러움·죄책감 → 미안함
다짐·단호 → 결심
지침 → 피곤
분노 → 화남
```

중요한 검색축은 정규 필드에 저장하고, 세부 묘사만 `searchTags`에 둔다.

---

## 11. 품질과 Picker 노출

자산 품질과 Picker 노출을 분리한다.

```ts
type QualityStatus =
  | "approved"
  | "secondary"
  | "review"
  | "replace"
  | "rejected"
  | "legacy";

type PickerVisibility = "primary" | "secondary" | "hidden";
```

v1 호환 매핑:

| v1 | v2 기본 매핑 |
|---|---|
| `기본 추천` | `primary` |
| `추가 자료` | `secondary` |
| 기존 작품 전용 legacy | `hidden`, resolve 가능 |
| 의미가 중복되는 승인 자산 | `approved + hidden` 가능 |

기존 작품이 참조할 수 있는 ID는 숨길 수 있지만 무단 삭제하지 않는다.

Audit 판정은 다음 용어를 사용한다.

```text
KEEP
NORMALIZE-TRANSLATE
NORMALIZE-UNIFORM-SCALE
MANUAL-REVIEW
HIDE-DUPLICATE
REFERENCE-REMAKE
REPLACE
REJECT
LEGACY
```

`NORMALIZE`는 비율을 보존하는 평행이동과 균일 확대·축소로만 수행한다. 비균일
확대 또는 머리만 따로 조정해야 통과하는 파일은 `REFERENCE-REMAKE` 대상이다.

---

## 12. Story Pack

Story Pack은 특정 이야기에 우선 추천할 자산, 템플릿과 저작권 정보를 묶은
콘텐츠 패키지다. 접근 권한 폴더가 아니다.

```ts
interface StoryPackManifest {
  id: string;
  version: number;
  title: string;
  recommendedCharacterIds: string[];
  recommendedAssetIds: string[];
  backgroundIds: string[];
  sceneIllustrationIds: string[];
  templates: StoryTemplate[];
  assetAliases?: Record<string, string>;
  copyright: CopyrightInfo;
}
```

Global Asset Library가 Story Pack 위에 있고, 하나의 asset은 여러 Pack에서 추천할
수 있다. 작품은 기본적으로 asset ID를 참조한다. Pack이 갱신되어도 기존 ID와
alias resolve를 유지한다.

템플릿 의미가 Pack 버전에 의존하게 될 때만 StoryDocument에 사용한 Pack 버전을
저장한다. 현재부터 모든 프로젝트에 불필요한 Pack metadata를 강제하지 않는다.

---

## 13. Asset Audit

정적 catalog 또는 generator 단계에서 다음을 검사한다.

- asset ID 중복
- 참조 파일 존재
- character/design/variant/poseSet 참조 유효성
- Full/Upper Pair 상태
- framing과 vocabulary 유효성
- 과도한 투명 여백, 해상도와 baseline
- 기준본 대비 몸통 중심, 눈높이, 중심 신체 높이와 머리/몸 비율
- 귀·더듬이·뿔·손·소품을 제외한 기준점 측정 여부
- 비균일 확대나 머리 단독 보정 사용 여부
- facing/mirrorSafe 누락
- hidden/legacy resolve 가능 여부
- alias가 존재하는 canonical ID로 연결되는지
- 시스템에서 참조 중인 asset ID가 삭제되지 않았는지

Audit은 전체 실패 개수뿐 아니라 Character별 Pair와 품질 현황을 보여 준다.
자동 수치 보고와 함께 기준본 및 전체 Pose 비교표를 생성하고 실제 무대의 좌·우
배치에서 위치 튐을 확인한다. 기준과 허용 오차는
`docs/decisions/character-pose-normalization-v1.md`를 따른다.

---

## 14. 구현 순서

이 문서는 개발 상태표의 작업 순서를 덮어쓰지 않는다.

### Now — 기준선 고정

- 현재 유일한 `READY`인 `G0-01` fixture 작업
- 최신·이전·손상 저장본과 Excel 기준선
- 현재 v1 검색과 asset resolve 특성 기록

### Next — 작품 안전성

- StoryDocument Envelope
- parse/migrate/normalize/validate
- 원본 quarantine와 마지막 정상본
- local repository adapter와 저장 상태
- checkpoint/recovery

### After safety — 자산 기반

- v1 catalog adapter fixture
- 정적 v2 manifest
- Character/Variant/PoseSet metadata
- 핵심 추천 Pair audit
- Stage/facing metadata
- quality와 visibility
- CharacterNormalizationProfile과 기준본 등록
- 캔버스·알파·groundY·중심·비율 자동 Audit 및 비교표

### Then — Faceted Picker

- 같은 Facet OR / 다른 Facet AND
- 검색어 AND
- Filter/Ranking 분리
- 현재 선택, 추천, 즐겨찾기와 최근 사용 보존
- 결과 0개일 때 완화 제안

### Later — 조건부 확장

- IndexedDB 전환
- 추가 패싯
- 사용자 이미지와 업로드
- Cloud repository
- Prop 배치
- 3명 이상 배우 배치
- 고급 Boolean Query

후속 항목은 제품 결정과 별도 작업 카드 없이 구현하지 않는다.

---

## 15. 인수 조건

### 저장

1. 현재 v1 저장본이 내용 손실 없이 열린다.
2. 손상본이 예시 작품으로 자동 덮어써지지 않는다.
3. migration 실패 뒤 원본과 마지막 정상본을 복구할 수 있다.
4. Draft와 Play Snapshot은 독립적으로 유지된다.
5. 이전 Excel을 열고 다시 현재 Excel로 저장할 수 있다.

### 검색

1. 같은 Facet의 여러 값은 OR이다.
2. 다른 Facet은 AND다.
3. 검색어는 Facet 결과와 AND다.
4. 선택하지 않은 Facet은 결과를 제한하지 않는다.
5. hidden asset은 새 검색에 나오지 않는다.
6. legacy asset은 기존 작품에서 정상 렌더링된다.
7. Ranking은 Filter 결과 집합을 바꾸지 않는다.

### 자산

1. ID와 파일 경로가 분리된다.
2. 기존 ID는 alias 또는 legacy resolve 없이 변경하지 않는다.
3. 핵심 추천 Pose의 Pair 상태를 자동 보고한다.
4. Pose 변경 시 baseline과 상대 크기 변동을 audit한다.
5. mirrorSafe가 아닌 자산을 자동 반전하지 않는다.
6. 신규 전신은 `800×1200`, 투명 배경, `groundY=1149`를 만족한다.
7. 같은 위치 묶음의 중심 신체 높이와 머리/몸 비율이 기준본 대비 ±3% 안에
   있거나 수동 검토 판정을 남긴다.
8. 균일 변환으로 해결할 수 없는 비율·정체성 차이만 재생성한다.

### UI

1. 학생에게 asset ID, 파일 경로와 Boolean 용어를 노출하지 않는다.
2. 기본 화면에는 인물·감정·구도처럼 핵심 선택만 보인다.
3. 결과 수, 선택 조건, 초기화와 결과 없음 안내를 제공한다.
4. 키보드와 대표 모바일·태블릿 흐름을 실제로 확인한다.

---

## 16. 정리된 충돌과 결정

| 과거 초안 또는 기존 문서 | 정리된 결정 |
|---|---|
| 모든 선택 태그를 무조건 AND | 목표 v2는 같은 Facet OR, 다른 Facet AND |
| 모든 일반 Pose의 Pair를 1.0 필수화 | 핵심 추천 Pose부터 단계 적용 |
| Scene override를 기본 상속에 포함 | 1.0은 Chapter override까지 |
| IndexedDB를 즉시 1.0 저장 기반으로 확정 | Repository 경계 후 측정하여 결정 |
| 중첩 Boolean AST를 1.0 검색 기반으로 준비 | 실제 고급 과업이 생길 때 후속 도입 |
| `prop` 타입을 미리 추가 | 별도 배치 기능이 확정될 때 추가 |
| 감정 Vocabulary에서 `후회` 누락 | v1 ADR·코드와 맞춰 포함 |
| 실제 자산 없는 `걷기/달리기` 선반영 | catalog에 생길 때 추가 |
| Character와 Asset에 StageProfile 중복 | Character 기본 + Asset별 보정으로 분리 |
| 자산 기반을 데이터 안전과 함께 P0로 실행 | 현재 G0/G1 순서를 먼저 완료 |

---

## 17. 아직 결정하지 않은 것

다음 항목은 문서에서 숫자나 구현을 미리 확정하지 않는다.

1. 핵심 Character별 Pair 목표 개수와 캐릭터별 실제 눈높이·중심 신체 기준값
2. IndexedDB 전환 시점과 데이터 용량 기준
3. species/gender/age/role 패싯의 학생용 노출 여부
4. Story Pack 버전을 작품에 고정해야 하는 최초 기능
5. scene-illustration에서 actor overlay를 자동으로 끌지 여부
6. 사용자 이미지 보존 기간, 용량, 삭제와 소유권 정책

결정에는 실제 asset audit, 저장 fixture, 학생 과업 또는 교실 관찰 근거가 필요하다.

---

## 18. 구현 금지 사항

1. 기존 asset ID 일괄 rename
2. malformed 저장본을 예시 작품으로 조용히 덮기
3. 기존 학생 프로젝트를 새 asset으로 자동 치환
4. `StoryStudio.tsx` 전면 재작성
5. 자유 태그 문자열만으로 v2 taxonomy 구현
6. Ranking을 Filter 조건에 섞기
7. Story Pack을 검색 장벽이나 권한 폴더로 사용
8. CSS 색상 필터로 캐릭터 외형을 무차별 변형
9. 캐릭터를 가로·세로로 다르게 늘리거나 머리만 따로 확대하여 기준본 차이를 숨기기
10. 귀·더듬이·뿔·손·소품 끝을 맞추려고 전체 캐릭터 크기를 바꾸기
11. 서버 기능을 Local core의 필수 조건으로 만들기
12. 작업 카드 없이 Cloud·업로드·Prop·고급 Query를 반쯤 구현하기

---

## 19. 최종 문장

> Story Maker는 버전이 있는 StoryDocument를 안전하게 기기에 보존하는 Local-first
> 선형 창작 도구다. 콘텐츠는 Story Pack으로 공급하고, 캐릭터 자산은
> Character/Design/Variant/PoseSet 구조로 동일성을 관리한다. 학생의 자산 탐색은
> 같은 패싯 OR·다른 패싯 AND 규칙을 따르며, 기존 v1 저장본·Excel·asset ID는
> adapter와 legacy resolve로 계속 지원한다. 현재 구현은 기준선과 작품 안전성을
> 먼저 완성한 뒤 핵심 추천 자산부터 점진적으로 이 구조로 이동한다.
