# ADR — Story Asset Taxonomy v2

- 상태: Accepted target architecture
- 결정일: 2026-09-01
- 대체 대상: `docs/decisions/story-asset-taxonomy-v1.md`
- 관련 문서: `docs/architecture/storymaker-system-asset-architecture-master-plan.md`
- 캐릭터 정렬 기준: `docs/decisions/character-pose-normalization-v1.md`

## 배경

v1은 기존 `StoryAsset.tags`에 `인물 · 토끼`, `감정·상태 · 놀람` 같은 태그를
비파괴적으로 추가하여 현재 Picker에서 즉시 사용할 수 있게 했다. asset ID,
StoryProject와 Excel을 바꾸지 않고 분류를 먼저 도입했다는 점에서 유효한
과도기 결정이었다.

하지만 v1 태그는 다음 한계를 가진다.

1. 인물, 감정, 행동과 구도가 정규 필드가 아니라 문자열이다.
2. 검색이 선택 태그 전체를 AND로 평가하여 같은 종류의 값을 OR로 고를 수 없다.
3. Character, Variant와 PoseSet 관계를 표현하지 못한다.
4. Full/Upper Pair와 Stage 보정을 자동 검사할 수 없다.
5. 품질 상태와 학생 Picker 노출 상태를 분리할 수 없다.
6. 배경과 사건이 합성된 scene illustration을 명시적으로 구분하지 못한다.

현재 카탈로그는 108개이며, 캐릭터 70개와 배경 38개로 구성된다. 이 규모에서는
별도 검색 서버가 아니라 정규 metadata와 메모리 배열 검색이 적절하다.

## 결정

### 1. v1 호환 계층을 유지한다

- 기존 asset ID를 변경하지 않는다.
- 현재 `StoryAsset`과 `tags` 검색을 목표 구조가 안정될 때까지 유지한다.
- v2 metadata는 adapter 또는 정적 manifest로 먼저 추가한다.
- 이전 저장본과 Excel은 기존 ID로 계속 resolve한다.
- generator가 v2 metadata를 직접 생성하기 전까지 분류 결과 fixture를 둔다.

### 2. 활성 자산 타입을 세 종류로 구분한다

```ts
type AssetType = "character" | "background" | "scene-illustration";
```

`prop`은 별도 배치 과업이 제품 범위로 확정될 때 추가한다.

### 3. 캐릭터 관계를 정규화한다

```text
Character
  → Design Version
  → Variant
  → Pose Set
  → Framing Asset
```

- 감정과 행동은 Variant가 아니다.
- Variant는 어린 시절, 병든 상태와 의상 변화처럼 비교적 지속되는 외형이다.
- 같은 표정·행동의 전신과 상반신은 같은 PoseSet에 속한다.
- asset ID는 파일 경로와 독립된 영구 정체성이다.

### 4. Stage 책임을 중복 저장하지 않는다

- Character/Design이 기본 StageProfile을 가진다.
- 개별 asset은 투명 여백, crop, baseline 같은 파일별 보정만 가진다.
- 1.0 적용 순서는 `asset 보정 → character 기본 → 작품 위치 묶음 → chapter 예외`다.
- Scene override와 자유 픽셀 배치는 후속 범위다.
- 같은 캐릭터 Pose의 파일 자체 정렬과 비율 판정은 캐릭터 정렬 ADR의 기준본,
  `800×1200`, `groundY=1149`, 몸통 중심과 머리/몸 비율 규칙을 따른다.
- 개별 자산 보정은 평행이동과 균일 확대·축소만 허용하며, 부분 변형이 필요하면
  `REFERENCE-REMAKE`로 분류한다.

### 5. 검색 의미를 고정한다

```text
같은 Facet 안의 여러 값 = OR
서로 다른 Facet = AND
검색어 = 추가 AND
```

학생 UI에는 Boolean 용어를 노출하지 않는다. Filter는 결과 포함 여부를,
Ranking은 포함된 결과의 순서만 결정한다.

### 6. 1차 Facet만 먼저 도입한다

초기 정규 Facet:

- 작품/Story Pack
- 인물
- 구도
- 감정·상태
- 행동
- 추천 범위

`entityType`, `species`, `gender`, `ageGroup`, `role`, `style`은 실제 metadata와
학생 과업이 확인된 뒤 추가한다. 성별과 연령은 이미지로 자동 추정하지 않는다.

### 7. Vocabulary의 단일 기준을 사용한다

감정·상태 초기값:

```text
기본, 기쁨, 슬픔, 화남, 놀람, 걱정, 미안함, 결심, 피곤,
의심, 생각, 아픔, 후회, 안도, 온화, 망설임, 조심, 회상
```

행동 초기값:

```text
말하기, 도망, 소품 들기, 제안, 명령, 부탁, 건네기, 일하기
```

`걷기`, `달리기`처럼 현재 catalog에 없는 값은 자산과 과업이 생길 때 추가한다.
Alias는 canonical 값과 별도로 관리한다.

### 8. Pair는 단계적으로 완성한다

Full/Upper 1:1 Pair는 핵심 추천 캐릭터의 기본·자주 쓰는 Pose부터 확보한다.
모든 legacy와 사건 전용 Pose의 Pair 완성은 1.0 출시 조건이 아니다.

```ts
type PairingStatus =
  | "complete"
  | "missing-full"
  | "missing-upper"
  | "exception"
  | "legacy";
```

### 9. 품질과 노출을 분리한다

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

품질이 좋은 중복 자산도 `approved + hidden`일 수 있다. legacy 자산은 새 검색에서
숨기더라도 기존 작품에서 resolve할 수 있어야 한다.

### 10. 고급 Query는 연기한다

중첩 AND/OR/NOT AST, 검색 서버와 inverted index는 v2 초기 범위가 아니다.
기본 Facet으로 해결되지 않는 실제 교사·학생 과업과 성능 측정이 생길 때 별도
결정으로 추가한다.

## 결과

### 장점

- 자산이 늘어도 문자열 태그를 다시 해석하지 않고 검색할 수 있다.
- 같은 캐릭터의 디자인·변형·Pose와 Pair를 자동 검사할 수 있다.
- 학생에게는 단순한 선택 UI를 제공하면서 내부 무결성을 높인다.
- legacy 자산을 삭제하지 않고 새 Picker의 품질을 관리할 수 있다.
- Story Pack을 추천 컨텍스트로 활용하면서 전역 검색을 유지할 수 있다.

### 비용과 위험

- v1 tag 검색과 v2 Facet 검색의 결과 차이를 fixture로 고정해야 한다.
- 현재 generator와 catalog에 metadata를 추가하는 작업이 필요하다.
- Pair를 무리하게 수량 목표로 만들면 자산 제작이 제품 안전성보다 앞설 수 있다.
- facet UI가 과도하게 펼쳐지면 학생에게 개발자 도구처럼 보일 수 있다.

## 구현 순서

1. 현재 G0 fixture와 v1 검색 결과를 고정한다.
2. 작품 문서와 저장 안전 작업을 먼저 완료한다.
3. v1 asset을 v2 record로 바꾸는 순수 adapter와 audit을 만든다.
4. 핵심 추천 캐릭터의 Character/Variant/PoseSet metadata를 검증한다.
5. 같은 Facet OR·다른 Facet AND 검색을 순수 함수로 구현한다.
6. 기존 Picker를 한 번에 재작성하지 않고 새 검색 결과에 연결한다.
7. 안정화 후 generator를 v2 manifest의 원본으로 전환한다.

각 단계는 `docs/storygame-development-status.md`에 실행 가능한 작업 카드가 생긴
뒤 시작한다.

## 인수 조건

1. 기존 asset ID, 저장본과 Excel이 계속 열린다.
2. 같은 Facet의 여러 값은 OR, 다른 Facet은 AND로 평가된다.
3. 검색어는 Facet 결과와 AND로 평가된다.
4. Filter와 Ranking 결과가 독립적으로 검증된다.
5. hidden asset은 새 검색에 나오지 않고 legacy asset은 기존 작품에서 열린다.
6. 핵심 추천 Pose의 Pair 상태가 자동 보고된다.
7. 잘못된 vocabulary, 중복 ID와 끊어진 참조가 검사에서 발견된다.
8. 같은 캐릭터 Pose의 바닥선·중심·눈높이·중심 신체 높이와 머리/몸 비율이
   등록 전에 Audit되고, 동적 외곽은 전체 크기 기준에서 제외된다.

## v1 문서의 처리

`story-asset-taxonomy-v1.md`는 삭제하지 않는다. 현재 런타임 adapter가 왜 존재하는지
설명하는 이력 문서로 남기고 상태를 `Superseded by v2 / transitional implementation`
으로 변경한다.
