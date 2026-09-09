# 원본 예시 작품 변환 v1

- 결정일: 2026-09-09, EX-01 사용자 요청.
- 원본: pinky-ne-site-publish의 worker/story-data/stories.js와 해당 모듈이 참조하는 승인 대본.
- 기준 커밋: df00a622848182c7d2ef0b0a4731b8b64d237082.

첫 화면의 선택 테마에 따라 토끼와 자라 또는 옹고집전 전체 예시를 독립 스냅숏으로 재생한다.
기존 사용자 편집본·적용본과 이어 쓰기 템플릿은 덮어쓰지 않는다. 예시는 처음 요청할 때 불러온다.

scripts/generate-story-examples.mjs가 원본 route를 장, beat를 컷으로 변환하고 원본 선택지와
합류/결말 연결을 보존한다. 원본의 단일 행동 3개는 문구를 담은 해설 컷과 다음 컷 연결로
옮겨 서비스의 2/3개 선택지 계약을 유지한다. 분기 질문도 별도 해설 컷으로 보존한다.
기존 STORY_ASSETS의 sourcePath로 배경과 인물을 연결하며 이미지를 새로 복제하지 않는다.

기본 원본 경로는 /Volumes/WAN2/apps/pinky-ne-site-publish이며 다른 위치에서는
STORY_SOURCE_ROOT 환경 변수로 지정한다. 다음 명령은 저장소 루트에서 실행한다.

```sh
node --experimental-strip-types --experimental-loader=./tests/node-types-loader.mjs scripts/generate-story-examples.mjs
```

산출물 app/story-examples.generated.json은 직접 수정하지 않는다. 갱신 시 원본 커밋,
missingAssets가 빈 배열인지, 대사·연결 일치와 양 작품 재생을 확인하고 npm test를 실행한다.
실서비스 실행에는 원본 저장소나 외부 서버 연결이 필요하지 않다.


## ST-02 원본 도달성 감사 (2026-09-09)

고정 원본 커밋 `df00a622848182c7d2ef0b0a4731b8b64d237082`의 stories 모듈을
별도 임시 디렉터리에 읽어 route graph와 생성 컷을 비교했다. 원본 저장소는 수정하지 않았다.

- 토끼와 자라: 136컷 모두 도달, 완전 경로 6개, 결말 컷 3개.
- 옹고집전: 453컷 중 345컷 도달, 완전 경로 16개, 결말 컷 2개.
- 원본부터 도달 불가인 5경로: real-route(9컷), real-loop-testimony(18컷),
  fake-first-verdict(7컷), fake-repeat-verdict(8컷), fake-route(66컷), 총 108컷.
  원본 beat는 107개이며 단일 행동 안내 컷 1개가 변환 시 추가된다.
- 이 분리 경로를 삭제하거나 다시 연결하지 않는다. 원문 보존과 이야기 품질 변경을
  분리하며 Narrative Audit에서 의도를 확인한다. 추가 도달 불가 ID는 테스트 실패다.
- `tests/helpers/example-graph.mjs`는 전체 연결·순환·경로·합류를 검사하며
  `tests/browser/pinky-examples.mjs`는 각 도달 가능한 결말의 대표 경로를 재생한다.
  22개 경로 전부의 시각/의미 검수나 사람의 연출 품질 승인을 뜻하지 않는다.
